package com.sliit.vehiclerental.backend.repository;

import com.sliit.vehiclerental.backend.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    // Custom query to find a promotion by its discount code
    Optional<Promotion> findByCode(String code);
}