package com.sliit.vehiclerental.backend.repository;

import com.sliit.vehiclerental.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByPickupDatetimeDesc(Long customerId);

    @Query("select count(b) from Booking b " +
            "where b.vehicle.id = :vehicleId and upper(b.status) <> 'CANCELLED' " +
            "and b.pickupDatetime < :requestedReturn and b.returnDatetime > :requestedPickup")
    long countConflictingBookings(@Param("vehicleId") Long vehicleId,
                                  @Param("requestedReturn") LocalDateTime requestedReturn,
                                  @Param("requestedPickup") LocalDateTime requestedPickup);
}
