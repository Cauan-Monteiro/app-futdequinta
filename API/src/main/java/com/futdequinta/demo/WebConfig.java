package com.futdequinta.demo;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Libera todas as rotas da API
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Libera todos os verbos
                .allowedOrigins("http://129.148.62.223","http://localhost"); // <--- AQUI É O PULO DO GATO 🐈
    }
}
