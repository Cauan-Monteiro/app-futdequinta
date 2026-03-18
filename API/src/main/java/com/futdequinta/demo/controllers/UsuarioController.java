package com.futdequinta.demo.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.futdequinta.demo.entities.Company;
import com.futdequinta.demo.entities.Membership;
import com.futdequinta.demo.entities.Usuario;
import com.futdequinta.demo.enums.RoleUsuario;
import com.futdequinta.demo.repositories.CompanyRepository;
import com.futdequinta.demo.repositories.JogadorRepository;
import com.futdequinta.demo.repositories.MembershipRepository;
import com.futdequinta.demo.repositories.UsuarioRepository;
import com.futdequinta.demo.security.TokenService;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {
    private UsuarioRepository repo;

    @Autowired
    TokenService tokenService;
    
    @Autowired
    private Argon2PasswordEncoder passwordEncoder;

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

    record VincularJogadorRequest(Long jogadorId) {}

    record AlterarRoleRequest(String role, Long companyId) {}

    @PutMapping("/{id}/vincular-jogador")
    public ResponseEntity<?> vincularJogador(@PathVariable Long id, @RequestBody VincularJogadorRequest req) {
        return repo.findById(id)
                .map(u -> {
                    if (req.jogadorId() == null) {
                        u.setIdJogador(null);
                    } else {
                        jogadorRepo.findById(req.jogadorId()).ifPresent(u::setIdJogador);
                    }
                    return ResponseEntity.ok(repo.save(u));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/alterar-role")
    public ResponseEntity<?> alterarRole(@PathVariable Long id, @RequestBody AlterarRoleRequest req) {
        RoleUsuario novaRole;
        try {
            novaRole = RoleUsuario.valueOf(req.role());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Role inválida.");
        }
        return membershipRepo.findByUsuarioIdAndTimeId(id, req.companyId())
                .map(m -> {
                    m.setRole(novaRole);
                    return ResponseEntity.ok(membershipRepo.save(m));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario user) {
        Usuario usuarioEncontrado = repo.findByEmail(user.getEmail());

        if (usuarioEncontrado == null) {
            return ResponseEntity.status(404).body("Não Encontrado");
        }
        
        String senhaInformada = user.getSenha();
        String senhaArmazenada = usuarioEncontrado.getSenha();
        boolean autenticado = false;

        if (senhaArmazenada.startsWith("$argon2")) {
            // Senha já hasheada — comparação normal
            autenticado = passwordEncoder.matches(senhaInformada, senhaArmazenada);
        } else {
            // Senha ainda em plaintext — migração transparente
            if (senhaArmazenada.equals(senhaInformada)) {
                autenticado = true;
                usuarioEncontrado.setSenha(passwordEncoder.encode(senhaInformada));
                repo.save(usuarioEncontrado);
            }
        }

        if (!autenticado) {
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
        usuario.setSenha(passwordEncoder.encode(req.senha()));
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
