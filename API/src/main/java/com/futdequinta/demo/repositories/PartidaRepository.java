package com.futdequinta.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.futdequinta.demo.entities.Partida;

public interface PartidaRepository extends JpaRepository<Partida,Long> {
}
