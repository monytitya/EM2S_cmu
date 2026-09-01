package Springboot_cmu.cmu_springboot.config;

import Springboot_cmu.cmu_springboot.entity.Role;
import Springboot_cmu.cmu_springboot.entity.User;
import Springboot_cmu.cmu_springboot.repository.RoleRepository;
import Springboot_cmu.cmu_springboot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ADMIN");
            role.setDescriptions("Administrator role");
            return roleRepository.save(role);
        });

        userRepository.findByUsername("admin").ifPresentOrElse(admin -> {
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
        }, () -> {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@company.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
        });
    }
}
