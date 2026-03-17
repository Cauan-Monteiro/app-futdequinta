package com.futdequinta.demo.controllers;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.futdequinta.demo.entities.Jogador;
import com.futdequinta.demo.repositories.JogadorRepository;

@RestController
@RequestMapping("/api/jogadores")

public class JogadorController {

    private final JogadorRepository repo;

    public JogadorController(JogadorRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Jogador> listar() {
        return repo.findAll(Sort.by("pontos").descending().and(Sort.by("derrotas").ascending().and(Sort.by("vitorias").descending())));
    }
    
    @PutMapping("/{id}")
    public Jogador atualizar(@PathVariable Long id, @RequestBody Jogador atualizado) {
        return repo.findById(id)
                .map(j -> {
                    j.setNome(atualizado.getNome());
                    j.setPontos(atualizado.getPontos());
                    j.setPosicao(atualizado.getPosicao());
                    j.setAtributos(atualizado.getAtributos());
                    j.setPartidas(atualizado.getPartidas());
                    j.setVitorias(atualizado.getVitorias());
                    j.setEmpates(atualizado.getEmpates());
                    j.setDerrotas(atualizado.getDerrotas());
                    j.setFotoUrl(atualizado.getFotoUrl());
                    return repo.save(j);
                })
                .orElseThrow(() -> new RuntimeException("Jogador não encontrado"));
    }
}
