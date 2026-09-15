package com.sliit.vehiclerental.backend.service;

import com.sliit.vehiclerental.backend.entity.Branch;
import com.sliit.vehiclerental.backend.repository.BranchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    // CREATE a new branch
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    // READ all active branches
    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    // UPDATE an existing branch
    public Branch updateBranch(Integer id, Branch updatedData) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Branch not found."));

        existing.setName(updatedData.getName());
        existing.setAddress(updatedData.getAddress());
        existing.setContactNumber(updatedData.getContactNumber());
        existing.setOperatingHours(updatedData.getOperatingHours());
        existing.setVehicleCapacity(updatedData.getVehicleCapacity());
        existing.setIsActive(updatedData.getIsActive());

        return branchRepository.save(existing);
    }

    // SOFT DELETE (Deactivate) a branch
    public void deactivateBranch(Integer id) {
        Branch existing = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Branch not found."));
        existing.setIsActive(false);
        branchRepository.save(existing);
    }
}