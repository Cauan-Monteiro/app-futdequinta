package com.futdequinta.demo.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.futdequinta.demo.entities.Membership;

public interface MembershipRepository extends JpaRepository<Membership,Long> {
    Optional<Membership> findByUsuarioIdAndTimeId(Long usuarioId, Long timeId);
}
