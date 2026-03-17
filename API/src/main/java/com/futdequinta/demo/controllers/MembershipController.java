package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.Membership;
import com.futdequinta.demo.repositories.MembershipRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership")
public class MembershipController {
    private MembershipRepository repo;

    public MembershipController(MembershipRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Membership> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Membership salvar(@RequestBody Membership membership) {
        return repo.save(membership);
    }


}
