package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.UserProfileResponse;
import com.motosnap.workshop.dto.VehicleRequest;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.entity.Vehicle;
import com.motosnap.workshop.repository.UserRepository;
import com.motosnap.workshop.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Optional<UserProfileResponse> getUserProfile(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToProfileResponse);
    }

    public List<Vehicle> getVehiclesByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getVehicles();
    }

    public Vehicle addVehicle(String userEmail, VehicleRequest vehicleRequest) {
        logger.info("Adding vehicle for user: {} with plate: {}", userEmail, vehicleRequest.getPlateNo());

        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> {
                        logger.error("User not found for email: {}", userEmail);
                        return new RuntimeException("User not found");
                    });

            // Check if plate number already exists
            if (vehicleRepository.findByPlateNo(vehicleRequest.getPlateNo()).isPresent()) {
                logger.warn("Vehicle with plate number {} already exists", vehicleRequest.getPlateNo());
                throw new RuntimeException("Vehicle with plate number " + vehicleRequest.getPlateNo() + " already exists");
            }

            Vehicle vehicle = new Vehicle();
            vehicle.setPlateNo(vehicleRequest.getPlateNo());
            vehicle.setModel(vehicleRequest.getModel());
            vehicle.setBrand(vehicleRequest.getBrand());
            vehicle.setYear(vehicleRequest.getYear());
            vehicle.setColor(vehicleRequest.getColor());
            vehicle.setEngineCapacity(vehicleRequest.getEngineCapacity());
            vehicle.setUser(user);

            Vehicle savedVehicle = vehicleRepository.save(vehicle);
            logger.info("Successfully added vehicle with ID: {} for user: {}", savedVehicle.getId(), userEmail);
            return savedVehicle;

        } catch (Exception e) {
            logger.error("Error adding vehicle for user {}: {}", userEmail, e.getMessage(), e);
            throw e;
        }
    }

    private UserProfileResponse convertToProfileResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        response.setVehicles(user.getVehicles());
        return response;
    }
}