package Springboot_cmu.cmu_springboot.controller;

import Springboot_cmu.cmu_springboot.dto.AuthRequest;
import Springboot_cmu.cmu_springboot.dto.AuthResponse;
import Springboot_cmu.cmu_springboot.entity.Role;
import Springboot_cmu.cmu_springboot.entity.User;
import Springboot_cmu.cmu_springboot.repository.RoleRepository;
import Springboot_cmu.cmu_springboot.repository.UserRepository;
import Springboot_cmu.cmu_springboot.services.CustomUserDetailsService;
import Springboot_cmu.cmu_springboot.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.annotation.Profile;

import java.util.Map;
import java.util.HashMap;

@RestController
@Profile({"auth-service", "default"})
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          CustomUserDetailsService userDetailsService,
                          JwtUtil jwtUtil,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authRequest.getUsername(),
                            authRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of(
                    "error", "Incorrect username or password"
            ));
        }

        final UserDetails userDetails = userDetailsService
                .loadUserByUsername(authRequest.getUsername());

        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String roleName = "USER";

        // Validate inputs
        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "username, email, and password are required"
            ));
        }

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username already exists"
            ));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email already exists"
            ));
        }

        Role role = roleRepository.findFirstByNameOrderByIdAsc(roleName.toUpperCase()).orElseGet(() -> {
            Role newRole = new Role();
            newRole.setId(System.currentTimeMillis());
            newRole.setName(roleName.toUpperCase());
            newRole.setDescriptions(roleName.toUpperCase() + " role");
            return roleRepository.save(newRole);
        });

        // Create the user
        User user = new User();
        user.setId(System.currentTimeMillis());
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        final UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        final String jwt = jwtUtil.generateToken(userDetails);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "userId", savedUser.getId(),
                "username", savedUser.getUsername(),
                "role", role.getName(),
                "jwt", jwt
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentProfile(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .map(user -> ResponseEntity.ok(toProfileMap(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentProfile(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = request.getOrDefault("username", "").trim();
        String email = request.getOrDefault("email", "").trim();
        if (username.isBlank() || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Username and email are required."
            ));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        boolean usernameInUse = userRepository.findByUsername(username)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .isPresent();
        if (usernameInUse) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "That username is already in use."
            ));
        }

        boolean emailInUse = userRepository.findByEmail(email)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .isPresent();
        if (emailInUse) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "That email address is already in use."
            ));
        }

        user.setUsername(username);
        user.setEmail(email);
        String password = request.get("password");
        if (password != null && !password.isBlank()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        User savedUser = userRepository.save(user);
        UserDetails updatedUserDetails = userDetailsService.loadUserByUsername(savedUser.getUsername());
        Map<String, Object> response = new HashMap<>(toProfileMap(savedUser));
        response.put("jwt", jwtUtil.generateToken(updatedUserDetails));
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toProfileMap(User user) {
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole().getName() : "N/A",
                "isActive", user.getIsActive() != null ? user.getIsActive() : true
        );
    }
}
