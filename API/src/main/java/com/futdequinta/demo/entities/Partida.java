package com.futdequinta.demo.entities;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Entity
public class Partida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer golsAzul;
    private Integer golsVermelho;
    private String vencedor; // "Azul", "Vermelho" ou "Empate"
    private LocalDateTime data;

    @ElementCollection
    private List<JogadorTime> jogadores;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getGolsAzul() {
        return golsAzul;
    }

    public void setGolsAzul(Integer golsAzul) {
        this.golsAzul = golsAzul;
    }

    public Integer getGolsVermelho() {
        return golsVermelho;
    }

    public void setGolsVermelho(Integer golsVermelho) {
        this.golsVermelho = golsVermelho;
    }

    public String getVencedor() {
        return vencedor;
    }

    public void setVencedor(String vencedor) {
        this.vencedor = vencedor;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public List<JogadorTime> getJogadores() {
        return jogadores;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Partida partida = (Partida) o;
        return Objects.equals(id, partida.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Partida{" +
                "id=" + id +
                ", golsAzul=" + golsAzul +
                ", golsVermelho=" + golsVermelho +
                ", vencedor='" + vencedor + '\'' +
                ", data=" + data +
                ", jogadores=" + jogadores +
                '}';
    }
}
