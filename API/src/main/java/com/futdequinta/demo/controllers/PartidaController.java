package com.futdequinta.demo.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futdequinta.demo.entities.Partida;
import com.futdequinta.demo.repositories.PartidaRepository;

@RestController
@RequestMapping("/api/partidas")
@CrossOrigin(origins = "http://localhost:5173")
public class PartidaController {

    private final PartidaRepository repo;

    public PartidaController(PartidaRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Partida> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Partida criar(@RequestBody Partida partida) {
        partida.setData(LocalDateTime.now());
        return repo.save(partida);
    }

    @PutMapping("/{id}")
    public Partida atualizar(@PathVariable Long id, @RequestBody Partida atualizado) {
        return repo.findById(id)
                .map(p -> {
                    p.setGolsAzul(atualizado.getGolsAzul());
                    p.setGolsVermelho(atualizado.getGolsVermelho());
                    p.setVencedor(atualizado.getVencedor());
                    return repo.save(p);
                })
                .orElseThrow(() -> new RuntimeException("Partida não encontrada"));
    }
}