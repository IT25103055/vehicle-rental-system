package com.sliit.vehiclerental.backend.config;

import com.sliit.vehiclerental.backend.entity.Role;
import com.sliit.vehiclerental.backend.entity.Branch;
import com.sliit.vehiclerental.backend.entity.User;
import com.sliit.vehiclerental.backend.entity.Vehicle;
import com.sliit.vehiclerental.backend.entity.VehicleCategory;
import com.sliit.vehiclerental.backend.repository.BranchRepository;
import com.sliit.vehiclerental.backend.repository.RoleRepository;
import com.sliit.vehiclerental.backend.repository.UserRepository;
import com.sliit.vehiclerental.backend.repository.VehicleCategoryRepository;
import com.sliit.vehiclerental.backend.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.math.BigDecimal;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BranchRepository branchRepository;
    private final VehicleCategoryRepository categoryRepository;
    private final VehicleRepository vehicleRepository;

    public DatabaseSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder,
                          BranchRepository branchRepository, VehicleCategoryRepository categoryRepository,
                          VehicleRepository vehicleRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.branchRepository = branchRepository;
        this.categoryRepository = categoryRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Roles based on the SQL script & your custom roles
        createRoleIfNotFound("ROLE_CUSTOMER");
        createRoleIfNotFound("ROLE_ADMIN");
        createRoleIfNotFound("ROLE_RENTAL_OFFICER");
        createRoleIfNotFound("ROLE_MAINTENANCE_SUPERVISOR");
        createRoleIfNotFound("ROLE_FINANCE_OFFICER");
        createRoleIfNotFound("ROLE_BRANCH_MANAGER");

        // NEW: Specific role for Harshani's module
        createRoleIfNotFound("ROLE_BOOKING_MANAGER");

        // 2. Create the 6 Staff Accounts for the Group Members

        // Harshani (Nimashi) - Bookings
        createUserIfNotFound("Nimashi", "Harshani", "Nimashi@rental.com", "Nimashi123", "0771111111", "ROLE_BOOKING_MANAGER");

        // Sanjula - Contracts
        createUserIfNotFound("Sanjula", "S", "Sanjula@rental.com", "Sanjula123", "0772222222", "ROLE_RENTAL_OFFICER");

        // Sumanawansha - Fleet/Admin
        createUserIfNotFound("Sumanawansha", "D", "Sumanawansha@rental.com", "Sumana123", "0773333333", "ROLE_ADMIN");

        // Kasthurisingha - Maintenance
        createUserIfNotFound("Kasthurisingha", "K", "Kasthuri@rental.com", "Kasthuri123", "0774444444", "ROLE_MAINTENANCE_SUPERVISOR");

        // Victor - Finance & Promotions
        createUserIfNotFound("Victor", "K", "Victor@rental.com", "Victor123", "0775555555", "ROLE_FINANCE_OFFICER");

        // Kumara - Branches
        createUserIfNotFound("Kumara", "A", "Kumara@rental.com", "Kumara123", "0776666666", "ROLE_BRANCH_MANAGER");

        // Minimum useful catalogue for a fresh database and the home-page search.
        Branch colombo = createBranchIfNotFound("Colombo City Centre", "No. 10, Galle Road, Colombo 03", "0112345678", 40);
        Branch airport = createBranchIfNotFound("Bandaranaike Airport", "Katunayake, Sri Lanka", "0112252861", 30);

        VehicleCategory cars = createCategoryIfNotFound("Cars", "Comfortable city and long-distance passenger cars");
        VehicleCategory jeeps = createCategoryIfNotFound("Jeeps", "SUV and off-road vehicles");
        VehicleCategory vans = createCategoryIfNotFound("Vans", "Passenger and cargo vans");
        VehicleCategory bikes = createCategoryIfNotFound("Motor Bikes", "Two-wheeled vehicles for quick travel");

        createVehicleIfNotFound("WP-CAR-1001", "Toyota", "Corolla", 2024, "9500", cars, colombo);
        createVehicleIfNotFound("WP-SUV-2001", "Nissan", "X-Trail", 2023, "15500", jeeps, airport);
        createVehicleIfNotFound("WP-VAN-3001", "Toyota", "KDH", 2022, "18500", vans, colombo);
        createVehicleIfNotFound("WP-BIK-4001", "Honda", "Dio", 2024, "3500", bikes, airport);
    }

    // --- HELPER METHODS (These were missing!) ---

    private void createRoleIfNotFound(String name) {
        Optional<Role> role = roleRepository.findByName(name);
        if (role.isEmpty()) {
            Role newRole = new Role();
            newRole.setName(name);
            roleRepository.save(newRole);
        }
    }

    private void createUserIfNotFound(String fName, String lName, String email, String password, String phone, String roleName) {
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            User user = new User();
            user.setFirstName(fName);
            user.setLastName(lName);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password)); // Safely hashes the password!
            user.setPhone(phone);

            Role role = roleRepository.findByName(roleName).orElseThrow();
            user.setRole(role);

            userRepository.save(user);
            System.out.println("Created Staff User: " + email + " with role: " + roleName);
        }
    }

    private Branch createBranchIfNotFound(String name, String address, String contact, int capacity) {
        return branchRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Branch branch = new Branch();
            branch.setName(name);
            branch.setAddress(address);
            branch.setContactNumber(contact);
            branch.setOperatingHours("Open daily: 8:00 AM - 8:00 PM");
            branch.setVehicleCapacity(capacity);
            return branchRepository.save(branch);
        });
    }

    private VehicleCategory createCategoryIfNotFound(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            VehicleCategory category = new VehicleCategory();
            category.setName(name);
            category.setDescription(description);
            return categoryRepository.save(category);
        });
    }

    private void createVehicleIfNotFound(String registration, String make, String model, int year,
                                         String dailyRate, VehicleCategory category, Branch branch) {
        if (!vehicleRepository.existsByRegistrationNumberIgnoreCase(registration)) {
            Vehicle vehicle = new Vehicle();
            vehicle.setRegistrationNumber(registration);
            vehicle.setMake(make);
            vehicle.setModel(model);
            vehicle.setYear(year);
            vehicle.setDailyRate(new BigDecimal(dailyRate));
            vehicle.setCategory(category);
            vehicle.setBranch(branch);
            vehicle.setStatus("AVAILABLE");
            vehicleRepository.save(vehicle);
        }
    }
}
