package com.futdequinta.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class TimeSorteado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId;

    @ElementCollection
    @CollectionTable(name = "time_sorteado_azul",
                     joinColumns = @JoinColumn(name = "time_sorteado_id"))
    @Column(name = "jogador_id")
    private List<Long> jogadoresAzul = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "time_sorteado_vermelho",
                     joinColumns = @JoinColumn(name = "time_sorteado_id"))
    @Column(name = "jogador_id")
    private List<Long> jogadoresVermelho = new ArrayList<>();

    private LocalDateTime dataSorteio;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public List<Long> getJogadoresAzul() {
        return jogadoresAzul;
    }

    public void setJogadoresAzul(List<Long> jogadoresAzul) {
        this.jogadoresAzul = jogadoresAzul;
    }

    public List<Long> getJogadoresVermelho() {
        return jogadoresVermelho;
    }

    public void setJogadoresVermelho(List<Long> jogadoresVermelho) {
        this.jogadoresVermelho = jogadoresVermelho;
    }

    public LocalDateTime getDataSorteio() {
        return dataSorteio;
    }

    public void setDataSorteio(LocalDateTime dataSorteio) {
        this.dataSorteio = dataSorteio;
    }
}
