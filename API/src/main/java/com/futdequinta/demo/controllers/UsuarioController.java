package com.futdequinta.demo.controllers;

import com.futdequinta.demo.entities.Company;
import com.futdequinta.demo.entities.Jogador;
import com.futdequinta.demo.entities.Membership;
import com.futdequinta.demo.entities.Usuario;
import com.futdequinta.demo.enums.RoleUsuario;
import com.futdequinta.demo.repositories.CompanyRepository;
import com.futdequinta.demo.repositories.JogadorRepository;
import com.futdequinta.demo.repositories.MembershipRepository;
import com.futdequinta.demo.repositories.UsuarioRepository;
import com.futdequinta.demo.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private UsuarioRepository repo;

    @Autowired
    TokenService tokenService;

    @Autowired
    private JogadorRepository jogadorRepo;

    @Autowired
    private CompanyRepository companyRepo;

    @Autowired
    private MembershipRepository membershipRepo;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.repo = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> findAll() {
        return repo.findAll();
    }

    @PostMapping
    public Usuario save(@RequestBody Usuario usuario) {
        return repo.save(usuario);
    }

    @PutMapping("/{id}")
    public Usuario atualizar(@PathVariable Long id, @RequestBody Usuario atualizado) {
        return repo.findById(id)
                .map(u -> {
                    u.setNome(atualizado.getNome());
                    u.setEmail(atualizado.getEmail());
                    u.setSenha(atualizado.getSenha());
                    u.setIdJogador(atualizado.getIdJogador());
                    return repo.save(u);
                })
                .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario user) {
        Usuario usuarioEncontrado = repo.findByEmail(user.getEmail());

        if (usuarioEncontrado == null) {
            return ResponseEntity.status(404).body("Não Encontrado");
        }
        if (!(usuarioEncontrado.getSenha().equals(user.getSenha()))) {
            return ResponseEntity.status(401).body("Login Invalido");
        }

        String token = tokenService.gerarToken(usuarioEncontrado);

        return ResponseEntity.status(200).body(token);
    }

    @GetMapping("/verificar-email")
    public ResponseEntity<?> verificarEmail(@RequestParam String email) {
        if (repo.findByEmail(email) != null) {
            return ResponseEntity.status(409).body("Email já cadastrado.");
        }
        return ResponseEntity.ok().build();
    }

    record RegistroRequest(String nome, String email, String senha, Long companyId) {}

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody RegistroRequest req) {
        if (repo.findByEmail(req.email()) != null) {
            return ResponseEntity.status(409).body("Email já cadastrado.");
        }

        Long companyId = req.companyId() != null ? req.companyId() : 1L;
        Optional<Company> companyOpt = companyRepo.findById(companyId);
        if (companyOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Grupo não encontrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(req.nome());
        usuario.setEmail(req.email());
        usuario.setSenha(req.senha());
        usuario.setIdJogador(null);
        Usuario usuarioSalvo = repo.save(usuario);

        Membership membership = new Membership();
        membership.setUsuario(usuarioSalvo);
        membership.setTime(companyOpt.get());
        membership.setRole(RoleUsuario.JOGADOR);
        membershipRepo.save(membership);

        // Re-fetch para carregar memberships antes de gerar o token
        //Usuario usuarioFinal = repo.findById(usuarioSalvo.getId()).orElseThrow();
        //String token = tokenService.gerarToken(usuarioFinal);
        return ResponseEntity.ok().build();
    }
}
