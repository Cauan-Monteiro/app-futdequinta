package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.TimeSorteado;
import com.futdequinta.demo.repositories.TimeSorteadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/times-sorteados")
public class TimeSorteadoController {

    @Autowired
    private TimeSorteadoRepository repo;

    @GetMapping("/{companyId}")
    public ResponseEntity<TimeSorteado> buscar(@PathVariable Long companyId) {
        return repo.findByCompanyId(companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deletar(@PathVariable Long companyId) {
        Optional<TimeSorteado> found = repo.findByCompanyId(companyId);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        repo.delete(found.get());
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<TimeSorteado> salvar(@RequestBody TimeSorteado dto) {
        TimeSorteado t = repo.findByCompanyId(dto.getCompanyId()).orElse(new TimeSorteado());
        t.setCompanyId(dto.getCompanyId());
        t.setJogadoresAzul(dto.getJogadoresAzul());
        t.setJogadoresVermelho(dto.getJogadoresVermelho());
        t.setDataSorteio(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(t));
    }
}
