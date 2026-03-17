package com.futdequinta.demo.config;

import com.futdequinta.demo.security.SecurityFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                        "http://localhost",
                        "http://localhost:5173",
                        "http://129.148.62.223"
                    ));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    return config;
                }))
                .csrf(csrf -> csrf.disable()) // Desativamos o CSRF porque vamos usar Tokens
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/verificar-email").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/registrar").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/partidas", "/api/jogadores").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/company").hasRole("JOGADOR")
                        .requestMatchers(HttpMethod.POST, "/api/partidas").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        String hierarquia = "ROLE_ADMIN > ROLE_JOGADOR \n ROLE_JOGADOR > ROLE_VISITANTE";
        return RoleHierarchyImpl.fromHierarchy(hierarquia);
    }
}