package com.futdequinta.demo.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futdequinta.demo.entities.Jogador;
import com.futdequinta.demo.entities.JogadorTime;
import com.futdequinta.demo.entities.Partida;
import com.futdequinta.demo.repositories.JogadorRepository;
import com.futdequinta.demo.repositories.PartidaRepository;

@RestController
@RequestMapping("/api/partidas")
public class PartidaController {

    private final PartidaRepository repo;
    private final JogadorRepository jogadorRepository;

    public PartidaController(PartidaRepository repo, JogadorRepository jogadorRepository) {
        this.repo = repo;
        this.jogadorRepository = jogadorRepository;
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

    
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Partida partida = repo.findById(id).orElse(null);
        if (partida == null) {
            return ResponseEntity.notFound().build();
        }

        String vencedor = partida.getVencedor();

        for (JogadorTime jt : partida.getJogadores()) {
            Jogador jogador = jogadorRepository.findById(jt.getId()).orElse(null);
            if (jogador == null) continue;

            jogador.setPartidas(jogador.getPartidas() - 1);

            if ("Empate".equals(vencedor)) {
                jogador.setPontos(jogador.getPontos() - 1);
                jogador.setEmpates(jogador.getEmpates() - 1);
            } else if (jt.getTime().equals(vencedor)) {
                jogador.setPontos(jogador.getPontos() - 3);
                jogador.setVitorias(jogador.getVitorias() - 1);
            } else {
                jogador.setDerrotas(jogador.getDerrotas() - 1);
            }

            jogadorRepository.save(jogador);
        }

        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}