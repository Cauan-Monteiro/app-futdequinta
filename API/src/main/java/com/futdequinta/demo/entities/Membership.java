package com.futdequinta.demo.entities;

import com.futdequinta.demo.enums.RoleUsuario;
import jakarta.persistence.Entity;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "time_id")
    private Company time;

    @Enumerated(EnumType.STRING)
    private RoleUsuario role;

    public Membership() {}

    public Membership(Long id, Usuario usuario, Company time, RoleUsuario role) {
        this.id = id;
        this.usuario = usuario;
        this.time = time;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Company getTime() {
        return time;
    }

    public void setTime(Company time) {
        this.time = time;
    }

    public RoleUsuario getRole() {
        return role;
    }

    public void setRole(RoleUsuario role) {
        this.role = role;
    }

    @Override
    public String toString() {
        return "Membership{" +
                "id=" + id +
                ", usuario=" + usuario +
                ", time=" + time +
                ", role=" + role +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Membership that = (Membership) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
