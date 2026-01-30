package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Partida;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartidaRepository extends JpaRepository<Partida,Long> {
}
