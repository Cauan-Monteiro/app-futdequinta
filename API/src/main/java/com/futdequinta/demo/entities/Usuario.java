package com.futdequinta.demo.entities;

import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String email;
    private String senha;

    @OneToOne
    @JoinColumn(name = "jogador_id")
    private Jogador jogador;

    @OneToMany(mappedBy = "usuario", fetch = FetchType.EAGER)
    private List<Membership> memberships;

    public Usuario() {}

    public Usuario(Long id, String nome, String email, String senha, Jogador idJogador) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.jogador = idJogador;
    }
    public Usuario(Long id, String nome, String email, String senha) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public Jogador getIdJogador() {
        return jogador;
    }

    public void setIdJogador(Jogador idJogador) {
        this.jogador = idJogador;
    }

    public List<Membership> getMemberships() {
        return memberships;
    }

    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", email='" + email + '\'' +
                ", senha='" + senha + '\'' +
                ", idJogador=" + jogador +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if (this.memberships != null) {
            for (Membership membership : this.memberships) {
                // O Spring Security exige o prefixo "ROLE_" quando usamos o .hasRole() nas configurações
                authorities.add(new SimpleGrantedAuthority("ROLE_" + membership.getRole().name()));
            }
        }

        authorities.add(new SimpleGrantedAuthority("ROLE_VISITANTE"));
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
}
