package com.futdequinta.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.futdequinta.demo.entities.Jogador;

public interface JogadorRepository  extends JpaRepository<Jogador,Long> {
}
