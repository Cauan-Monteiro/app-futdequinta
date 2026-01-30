package com.futdequinta.demo.entities;

import jakarta.persistence.Embeddable;

@Embeddable
public class JogadorTime {
    private Long id;    // id do jogador
    private String time; // "Azul" ou "Vermelho"

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
