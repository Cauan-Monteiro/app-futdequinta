package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.Jogador;
import com.futdequinta.demo.repositories.JogadorRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jogadores")
@CrossOrigin(origins = "http://localhost:5173")
public class JogadorController {

    private final JogadorRepository repo;

    public JogadorController(JogadorRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Jogador> listar() {
        return repo.findAll();
    }

    @PutMapping("/{id}")
    public Jogador atualizar(@PathVariable Long id, @RequestBody Jogador atualizado) {
        return repo.findById(id)
                .map(j -> {
                    j.setNome(atualizado.getNome());
                    j.setPontos(atualizado.getPontos());
                    j.setPartidas(atualizado.getPartidas());
                    j.setVitorias(atualizado.getVitorias());
                    j.setEmpates(atualizado.getEmpates());
                    j.setDerrotas(atualizado.getDerrotas());
                    return repo.save(j);
                })
                .orElseThrow(() -> new RuntimeException("Jogador não encontrado"));
    }
}
