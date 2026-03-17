package com.futdequinta.demo.entities;

import java.util.Objects;

import com.futdequinta.demo.enums.Posicao;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Jogador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private Integer pontos;

    @Enumerated(EnumType.STRING)
    private Posicao posicao;

    @Embedded
    private Atributos atributos;

    private Integer partidas;
    private Integer vitorias;
    private Integer empates;
    private Integer derrotas;
    private String fotoUrl;

    public Jogador() {}

    public Jogador(Long id, String nome, Integer pontos, Posicao posicao, Atributos atributos, Integer partidas, Integer vitorias, Integer empates, Integer derrotas, String fotoUrl) {
        this.id = id;
        this.nome = nome;
        this.pontos = pontos;
        this.posicao = posicao;
        this.atributos = atributos;
        this.partidas = partidas;
        this.vitorias = vitorias;
        this.empates = empates;
        this.derrotas = derrotas;
        this.fotoUrl = fotoUrl;
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

    public Posicao getPosicao() {return posicao;}

    public void setPosicao(Posicao posicao) {this.posicao = posicao;}

    public Atributos getAtributos() { return atributos; }

    public void setAtributos(Atributos atributos) { this.atributos = atributos; }

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

    public String getFotoUrl() {
        return fotoUrl;
    }

    public void setFotoUrl(String fotoUrl) {
        this.fotoUrl = fotoUrl;
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
                ", posicao=" + posicao +
                ", atributos=" + atributos +
                ", partidas=" + partidas +
                ", vitorias=" + vitorias +
                ", empates=" + empates +
                ", derrotas=" + derrotas +
                ", fotoUrl='" + fotoUrl + '\'' +
                '}';
    }
}
