package com.futdequinta.demo.entities;

import jakarta.persistence.*;

import java.util.Objects;

@Entity
public class Jogador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Integer pontos;
    private Integer partidas;
    private Integer vitorias;
    private Integer empates;
    private Integer derrotas;

    public Jogador() {}

    public Jogador(Long id, String nome, Integer pontos, Integer partidas, Integer vitorias, Integer empates, Integer derrotas) {
        this.id = id;
        this.nome = nome;
        this.pontos = pontos;
        this.partidas = partidas;
        this.vitorias = vitorias;
        this.empates = empates;
        this.derrotas = derrotas;
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

    public Integer getPontos() {
        return pontos;
    }

    public void setPontos(Integer pontos) {
        this.pontos = pontos;
    }

    public Integer getPartidas() {
        return partidas;
    }

    public void setPartidas(Integer partidas) {
        this.partidas = partidas;
    }

    public Integer getVitorias() {
        return vitorias;
    }

    public void setVitorias(Integer vitorias) {
        this.vitorias = vitorias;
    }

    public Integer getEmpates() {
        return empates;
    }

    public void setEmpates(Integer empates) {
        this.empates = empates;
    }

    public Integer getDerrotas() {
        return derrotas;
    }

    public void setDerrotas(Integer derrotas) {
        this.derrotas = derrotas;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Jogador jogador = (Jogador) o;
        return Objects.equals(id, jogador.id) && Objects.equals(nome, jogador.nome);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, nome);
    }

    @Override
    public String toString() {
        return "Jogador{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", pontos=" + pontos +
                ", partidas=" + partidas +
                ", vitorias=" + vitorias +
                ", empates=" + empates +
                ", derrotas=" + derrotas +
                '}';
    }
}
