package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    public Usuario findByEmail(String email);
    //public UserDetails findByEmail(String login);
}
