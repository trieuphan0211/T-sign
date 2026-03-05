package vn.stephenphan.certtificateservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(jsr250Enabled = true, securedEnabled = true)
public class SecurityConfig {

    @Value("${pki.roles.signer:signer_role}")
    private String signerRole;

    @Value("${pki.roles.admin:admin_role}")
    private String adminRole;

    @Value("${pki.roles.viewer:viewer_role}")
    private String viewerRole;

    /**
     * Configure security filter chain with JWT OAuth2 resource server
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (Swagger/OpenAPI)
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/actuator/health"
                        ).permitAll()
                        // Certificate status check - accessible to all authenticated users
                        .requestMatchers("/api/v1/certs/status/**").authenticated()
                        // User synchronization - requires signer role
                        .requestMatchers("/api/v1/certs/sync-user").hasRole("USER")
                        // Certificate enrollment - requires signer role
                        .requestMatchers("/api/v1/certs/enroll", "/api/v1/certs/issue-p12").hasRole("USER")
                        // Certificate revocation - requires admin or signer role
                        .requestMatchers("/api/v1/certs/revoke").hasAnyRole(adminRole, signerRole)
                        // Certificate renewal - requires signer role
                        .requestMatchers("/api/v1/certs/renew").hasRole(signerRole)

                        // Certificate details - accessible to viewer, signer, or admin
                        .requestMatchers("/api/v1/certs/**").hasAnyRole(viewerRole, signerRole, adminRole)
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    /**
     * Convert JWT token to authentication token with extracted authorities
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("SCOPE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwt -> {
            // 1. Lấy các quyền mặc định từ scope
            Collection<GrantedAuthority> authorities = grantedAuthoritiesConverter.convert(jwt);
            // 2. Trích xuất field "role" trực tiếp từ root payload
            String customRole = jwt.getClaimAsString("role");
            if (customRole != null && !customRole.isEmpty()) {
                // Thêm tiền tố ROLE_ để sử dụng được với .hasRole("USER") hoặc @PreAuthorize("hasRole('USER')")
                authorities.add(new SimpleGrantedAuthority("ROLE_" + customRole));
            }
            return authorities;
        });
        return jwtAuthenticationConverter;
    }
//    @Bean
//    public Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
//        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
//        converter.setJwtGrantedAuthoritiesConverter(this::extractAuthorities);
//        converter.setPrincipalClaimName("preferred_username");
//        return converter;
//    }

    /**
     * Extract authorities from JWT token including realm and resource roles
     */
//    @SuppressWarnings("unchecked")
//    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
//        // Extract realm roles
//        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
//        List<String> realmRoles = realmAccess != null ?
//            (List<String>) realmAccess.get("roles") : List.of();
//
//        // Extract resource roles (for this client)
//        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
//        List<String> resourceRoles = List.of();
//        if (resourceAccess != null && resourceAccess.containsKey("certificate-service")) {
//            Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get("certificate-service");
//            resourceRoles = clientAccess != null ?
//                (List<String>) clientAccess.get("roles") : List.of();
//        }
//
//        // Combine all roles and convert to Spring Security authorities
//        List<String> allRoles = new java.util.ArrayList<>();
//        allRoles.addAll(realmRoles);
//        allRoles.addAll(resourceRoles);
//
//        return allRoles.stream()
//            .map(role -> "ROLE_" + role.toUpperCase())
//            .map(SimpleGrantedAuthority::new)
//            .collect(Collectors.toList());
//    }
}
