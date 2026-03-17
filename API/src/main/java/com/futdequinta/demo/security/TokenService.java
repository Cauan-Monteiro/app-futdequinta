package com.futdequinta.demo.security;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.futdequinta.demo.entities.Membership;
import com.futdequinta.demo.entities.Usuario;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    public String gerarToken(Usuario usuario) {
        try {
            Algorithm algoritmo = Algorithm.HMAC256(secret);
            System.out.println(usuario.getMemberships());

            Map<String, String> permissoesPorTime = new HashMap<>();
            for (Membership membership : usuario.getMemberships()) {
                permissoesPorTime.put(membership.getTime().getId().toString(), membership.getRole().name());
            }

            return JWT.create()
                    .withIssuer("futdequinta")
                    .withSubject(usuario.getEmail())
                    .withClaim("nome", usuario.getNome())
                    .withClaim("idJogador", usuario.getIdJogador() != null ? usuario.getIdJogador().getId() : null)
                    .withClaim("permissoes", permissoesPorTime)
                    .withExpiresAt(Instant.now().plus(15, ChronoUnit.DAYS))
                    .sign(algoritmo);

        } catch (JWTCreationException exception) {
            throw new RuntimeException("Erro ao gerar token jwt", exception);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            return JWT.require(algorithm)
                    .withIssuer("futdequinta")
                    .build()
                    .verify(token)
                    .getSubject();

        } catch (JWTVerificationException exception){
            // Invalid signature/claims or other validation errors
            return "";
        }
    }
}