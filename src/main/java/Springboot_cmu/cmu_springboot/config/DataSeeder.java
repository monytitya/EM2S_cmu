package Springboot_cmu.cmu_springboot.config;

import Springboot_cmu.cmu_springboot.entity.Role;
import Springboot_cmu.cmu_springboot.entity.User;
import Springboot_cmu.cmu_springboot.repository.RoleRepository;
import Springboot_cmu.cmu_springboot.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.beans.factory.annotation.Value;

@Component
@Profile({"auth-service", "default"})
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;
    private final String bootstrapAdminUsername;
    private final String bootstrapAdminEmail;
    private final String bootstrapAdminPassword;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JdbcTemplate jdbcTemplate,
                      Environment environment,
                      @Value("${bootstrap.admin.username:}") String bootstrapAdminUsername,
                      @Value("${bootstrap.admin.email:}") String bootstrapAdminEmail,
                      @Value("${bootstrap.admin.password:}") String bootstrapAdminPassword) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
        this.bootstrapAdminUsername = bootstrapAdminUsername;
        this.bootstrapAdminEmail = bootstrapAdminEmail;
        this.bootstrapAdminPassword = bootstrapAdminPassword;
    }

    @Override
    public void run(String... args) {
        jdbcTemplate.execute("ALTER TABLE \"employee\" ALTER COLUMN \"image_url\" TYPE TEXT");

        Role adminRole = roleRepository.findFirstByNameOrderByIdAsc("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setId(System.currentTimeMillis());
            role.setName("ADMIN");
            role.setDescriptions("Administrator role");
            return roleRepository.save(role);
        });

        if (environment.acceptsProfiles(Profiles.of("auth-service"))
                && (bootstrapAdminUsername.isBlank()
                || bootstrapAdminEmail.isBlank()
                || bootstrapAdminPassword.isBlank())) {
            return;
        }

        String username = environment.acceptsProfiles(Profiles.of("auth-service"))
                ? bootstrapAdminUsername : "admin";
        String email = environment.acceptsProfiles(Profiles.of("auth-service"))
                ? bootstrapAdminEmail : "admin@company.com";
        String password = environment.acceptsProfiles(Profiles.of("auth-service"))
                ? bootstrapAdminPassword : "admin123";

        userRepository.findByUsername(username).ifPresentOrElse(admin -> {
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
        }, () -> {
            User admin = new User();
            admin.setUsername(username);
            admin.setEmail(email);
            admin.setPassword(passwordEncoder.encode(password));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            userRepository.save(admin);
        });
    }
}
