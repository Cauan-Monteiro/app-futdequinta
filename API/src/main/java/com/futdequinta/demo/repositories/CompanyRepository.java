package com.futdequinta.demo.repositories;

import com.futdequinta.demo.entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company,Long> {
}
