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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
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
        String roleName = request.getOrDefault("role", "USER"); 

        // Validate inputs
        if (username == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "username, email, and password are required"
            ));
        }

        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Username already exists"
            ));
        }

        // Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email already exists"
            ));
        }

        // Find or create the role
        Role role = roleRepository.findByName(roleName.toUpperCase()).orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName(roleName.toUpperCase());
            newRole.setDescriptions(roleName.toUpperCase() + " role");
            return roleRepository.save(newRole);
        });

        // Create the user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Auto-login: generate JWT token immediately
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
}
