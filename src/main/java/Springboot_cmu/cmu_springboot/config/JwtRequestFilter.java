package Springboot_cmu.cmu_springboot.config;

import Springboot_cmu.cmu_springboot.services.CustomUserDetailsService;
import Springboot_cmu.cmu_springboot.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(
            CustomUserDetailsService userDetailsService,
            JwtUtil jwtUtil
    ) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }


    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/api/auth/")
                || path.startsWith("/swagger-ui/")
                || path.startsWith("/v3/api-docs")
                || path.equals("/swagger-ui.html");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        final String authorizationHeader =
                request.getHeader("Authorization");

        String username = null;
        String jwt = null;

   
        if (authorizationHeader != null
                && authorizationHeader.startsWith("Bearer ")) {

            jwt = authorizationHeader.substring(7);

            try {
                username = jwtUtil.extractUsername(jwt);

            } catch (Exception e) {

                logger.warn(
                        "JWT token parsing failed: "
                        + e.getMessage()
                );
            }
        }

        if (username != null
                && SecurityContextHolder
                .getContext()
                .getAuthentication() == null) {

            try {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                if (jwtUtil.validateToken(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

              
                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authenticationToken
                            );

                    logger.debug(
                            "JWT authentication successful for user: "
                            + username
                    );
                }

            } catch (Exception e) {

                logger.warn(
                        "JWT authentication failed for user "
                        + username
                        + ": "
                        + e.getMessage()
                );
            }
        }


        chain.doFilter(request, response);
    }
}