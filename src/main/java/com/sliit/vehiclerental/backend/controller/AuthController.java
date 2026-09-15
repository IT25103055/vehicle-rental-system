package com.sliit.vehiclerental.backend.controller;

import com.sliit.vehiclerental.backend.dto.AuthResponse;
import com.sliit.vehiclerental.backend.dto.LoginRequest;
import com.sliit.vehiclerental.backend.dto.RegisterRequest;
import com.sliit.vehiclerental.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public static final String SESSION_USER_ID = "AUTH_USER_ID";
    public static final String SESSION_USER_ROLE = "AUTH_USER_ROLE";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerCustomer(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.registerCustomer(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        try {
            AuthResponse response = authService.loginCustomer(request);
            HttpSession previousSession = servletRequest.getSession(false);
            if (previousSession != null) {
                previousSession.invalidate();
            }
            HttpSession session = servletRequest.getSession(true);
            session.setAttribute(SESSION_USER_ID, response.getUserId());
            session.setAttribute(SESSION_USER_ROLE, response.getRole());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(SESSION_USER_ID);
        if (userId == null) {
            return ResponseEntity.status(401).body("Authentication required.");
        }
        return ResponseEntity.ok(authService.getUserResponse(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().body("Logged out successfully.");
    }
}
