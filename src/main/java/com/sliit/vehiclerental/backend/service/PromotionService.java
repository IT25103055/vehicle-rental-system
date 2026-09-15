package com.sliit.vehiclerental.backend.service;

import com.sliit.vehiclerental.backend.entity.Promotion;
import com.sliit.vehiclerental.backend.repository.PromotionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    public Promotion createPromotion(Promotion promotion) {
        promotion.setCode(promotion.getCode().trim().toUpperCase());
        if (promotion.getStartDate() == null) promotion.setStartDate(LocalDate.now());
        if (promotion.getEndDate() != null && promotion.getEndDate().isBefore(promotion.getStartDate())) {
            throw new RuntimeException("Promotion end date must be after its start date.");
        }
        return promotionRepository.save(promotion);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion updatePromotion(Integer id, Promotion updatedData) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Promotion not found."));

        existing.setCode(updatedData.getCode());
        existing.setDiscountPercentage(updatedData.getDiscountPercentage());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());

        return promotionRepository.save(existing);
    }

    public void deletePromotion(Integer id) {
        promotionRepository.deleteById(id);
    }
}
