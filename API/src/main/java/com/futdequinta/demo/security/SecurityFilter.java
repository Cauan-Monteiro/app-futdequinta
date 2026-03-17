package com.futdequinta.demo.security;

import com.futdequinta.demo.entities.Usuario;
import com.futdequinta.demo.repositories.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    TokenService tokenService;

    @Autowired
    UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);
        System.out.println("1. Token recebido no filtro: " + token);

        if(token != null){
            var login = tokenService.validateToken(token);
            System.out.println("2. Email extraído do token: " + login);

            // Verificamos se o login não está vazio (o TokenService retorna "" se for inválido)
            if (login != null && !login.isEmpty()) {
                UserDetails user = (UserDetails) usuarioRepository.findByEmail(login);
                System.out.println("3. Usuário encontrado no banco: " + (user != null ? user.getUsername() : "NENHUM"));

                if (user != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("4. Autenticação definida com sucesso!");
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}
