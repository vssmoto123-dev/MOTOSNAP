package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.UserProfileResponse;
import com.motosnap.workshop.dto.VehicleRequest;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.entity.Vehicle;
import com.motosnap.workshop.repository.UserRepository;
import com.motosnap.workshop.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class CustomerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Optional<UserProfileResponse> getUserProfile(String email) {
        return userRepository.findByEmail(email)
                .map(this::convertToProfileResponse);
    }

    public Vehicle addVehicle(String userEmail, VehicleRequest vehicleRequest) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if plate number already exists
        if (vehicleRepository.findByPlateNo(vehicleRequest.getPlateNo()).isPresent()) {
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

        return vehicleRepository.save(vehicle);
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