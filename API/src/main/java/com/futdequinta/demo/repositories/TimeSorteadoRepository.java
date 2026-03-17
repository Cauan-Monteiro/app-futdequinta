package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.TimeSorteado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TimeSorteadoRepository extends JpaRepository<TimeSorteado, Long> {
    Optional<TimeSorteado> findByCompanyId(Long companyId);
}
