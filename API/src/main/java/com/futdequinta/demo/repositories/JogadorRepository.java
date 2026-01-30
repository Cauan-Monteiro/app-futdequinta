package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Jogador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JogadorRepository  extends JpaRepository<Jogador,Long> {
}
