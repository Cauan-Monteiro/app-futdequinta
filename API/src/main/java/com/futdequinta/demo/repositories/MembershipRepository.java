package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipRepository extends JpaRepository<Membership,Long> {
}
