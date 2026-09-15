package com.sliit.vehiclerental.backend.service;

import com.sliit.vehiclerental.backend.entity.Booking;
import com.sliit.vehiclerental.backend.entity.Branch;
import com.sliit.vehiclerental.backend.entity.Promotion;
import com.sliit.vehiclerental.backend.entity.User;
import com.sliit.vehiclerental.backend.entity.Vehicle;
import com.sliit.vehiclerental.backend.repository.BranchRepository;
import com.sliit.vehiclerental.backend.repository.BookingRepository;
import com.sliit.vehiclerental.backend.repository.PromotionRepository;
import com.sliit.vehiclerental.backend.repository.UserRepository;
import com.sliit.vehiclerental.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.time.Duration;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PromotionRepository promotionRepository;

    public BookingService(BookingRepository bookingRepository, VehicleRepository vehicleRepository,
                          UserRepository userRepository, BranchRepository branchRepository,
                          PromotionRepository promotionRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.branchRepository = branchRepository;
        this.promotionRepository = promotionRepository;
    }

    // CREATE Booking & Update Vehicle Status
    @Transactional
    public Booking createBooking(Booking booking, Long customerId) {
        validateDates(booking.getPickupDatetime(), booking.getReturnDatetime());
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer account not found."));
        Vehicle vehicle = vehicleRepository.findById(booking.getVehicle().getId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found."));

        if (!"AVAILABLE".equalsIgnoreCase(vehicle.getStatus())) {
            throw new RuntimeException("This vehicle is currently not available.");
        }

        boolean conflict = bookingRepository.countConflictingBookings(
                vehicle.getId(), booking.getReturnDatetime(), booking.getPickupDatetime()) > 0;
        if (conflict) {
            throw new RuntimeException("This vehicle is already reserved for the selected dates.");
        }

        Branch pickupBranch = branchRepository.findById(booking.getPickupBranch().getId())
                .orElseThrow(() -> new RuntimeException("Pickup branch not found."));
        if (!vehicle.getBranch().getId().equals(pickupBranch.getId())) {
            throw new RuntimeException("This vehicle must be collected from " + vehicle.getBranch().getName() + ".");
        }
        Branch returnBranch = booking.getReturnBranch() == null
                ? pickupBranch
                : branchRepository.findById(booking.getReturnBranch().getId())
                    .orElseThrow(() -> new RuntimeException("Return branch not found."));

        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setPickupBranch(pickupBranch);
        booking.setReturnBranch(returnBranch);
        booking.setStatus("PENDING");

        if (booking.getPromotion() != null && booking.getPromotion().getId() != null) {
            Promotion promotion = promotionRepository.findById(booking.getPromotion().getId())
                    .orElseThrow(() -> new RuntimeException("Promotion not found."));
            booking.setPromotion(promotion);
        } else {
            booking.setPromotion(null);
        }

        long rentalDays = Math.max(1, (long) Math.ceil(Duration.between(
                booking.getPickupDatetime(), booking.getReturnDatetime()).toMinutes() / 1440.0));
        booking.setTotalAmount(vehicle.getDailyRate().multiply(BigDecimal.valueOf(rentalDays)));

        return bookingRepository.save(booking);
    }

    // READ
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getCustomerBookings(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByPickupDatetimeDesc(customerId);
    }

    // UPDATE: Restored this method for your Controller!
    public Booking updateBookingStatus(Long id, String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (!Set.of("PENDING", "CONFIRMED", "COMPLETED", "CANCELLED").contains(normalizedStatus)) {
            throw new RuntimeException("Invalid booking status.");
        }
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(normalizedStatus);
        return bookingRepository.save(booking);
    }

    // DELETE: Renamed to cancelBooking to match your Controller!
    @Transactional
    public void cancelBooking(Long id, Long requesterId, String requesterRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        boolean isOwner = booking.getCustomer().getId().equals(requesterId);
        boolean isStaff = !"ROLE_CUSTOMER".equals(requesterRole);
        if (!isOwner && !isStaff) {
            throw new RuntimeException("You can only cancel your own booking.");
        }
        if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
            throw new RuntimeException("A completed booking cannot be cancelled.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    private void validateDates(LocalDateTime pickup, LocalDateTime returned) {
        if (pickup == null || returned == null) {
            throw new RuntimeException("Pickup and return dates are required.");
        }
        if (!returned.isAfter(pickup)) {
            throw new RuntimeException("Return date must be after the pickup date.");
        }
        if (pickup.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new RuntimeException("Pickup date cannot be in the past.");
        }
    }
}
