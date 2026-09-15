package com.sliit.vehiclerental.backend.service;

import com.sliit.vehiclerental.backend.entity.MaintenanceRecord;
import com.sliit.vehiclerental.backend.entity.Vehicle;
import com.sliit.vehiclerental.backend.repository.MaintenanceRecordRepository;
import com.sliit.vehiclerental.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceRecordService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceRecordService(MaintenanceRecordRepository maintenanceRepository, VehicleRepository vehicleRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public MaintenanceRecord createRecord(MaintenanceRecord record) {
        if (record.getVehicle() == null || record.getVehicle().getId() == null) {
            throw new RuntimeException("A valid vehicle is required.");
        }
        Vehicle vehicle = vehicleRepository.findById(record.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found."));
        record.setVehicle(vehicle);
        updateVehicleAvailability(vehicle, record.getStatus());
        return maintenanceRepository.save(record);
    }

    public List<MaintenanceRecord> getAllRecords() {
        return maintenanceRepository.findAll();
    }

    public MaintenanceRecord updateRecord(Long id, MaintenanceRecord updatedData) {
        MaintenanceRecord existing = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Maintenance record not found."));

        existing.setServiceDate(updatedData.getServiceDate());
        existing.setCost(updatedData.getCost());
        existing.setStatus(updatedData.getStatus());
        existing.setOdometerReading(updatedData.getOdometerReading()); // Added here!
        updateVehicleAvailability(existing.getVehicle(), updatedData.getStatus());

        return maintenanceRepository.save(existing);
    }

    public void deleteRecord(Long id) {
        maintenanceRepository.deleteById(id);
    }

    private void updateVehicleAvailability(Vehicle vehicle, String maintenanceStatus) {
        vehicle.setStatus("COMPLETED".equalsIgnoreCase(maintenanceStatus) ? "AVAILABLE" : "MAINTENANCE");
        vehicleRepository.save(vehicle);
    }
}
