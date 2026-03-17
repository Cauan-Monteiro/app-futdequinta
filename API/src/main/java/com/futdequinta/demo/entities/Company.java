package com.futdequinta.demo.entities;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String imagemTime;

    public Company(Long id, String nome, String imagemTime) {
        this.id = id;
        this.nome = nome;
        this.imagemTime = imagemTime;
    }
    public Company() {}

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getImagem_time() {
        return imagemTime;
    }

    public void setImagem_time(String imagemTime) {
        this.imagemTime = imagemTime;
    }

    @Override
    public String toString() {
        return "Company{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", imagemTime='" + imagemTime + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return Objects.equals(id, company.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
