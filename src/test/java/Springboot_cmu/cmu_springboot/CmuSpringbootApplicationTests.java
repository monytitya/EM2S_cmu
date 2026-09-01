package Springboot_cmu.cmu_springboot;

import Springboot_cmu.cmu_springboot.repository.RoleRepository;
import Springboot_cmu.cmu_springboot.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class CmuSpringbootApplicationTests {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Test
    void contextLoads() {
    }

    @Test
    void defaultAdminUserShouldAuthenticate() {
        assertTrue(userRepository.findByUsername("admin").isPresent());

        assertDoesNotThrow(() -> authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken("admin", "admin123")));
    }
}
