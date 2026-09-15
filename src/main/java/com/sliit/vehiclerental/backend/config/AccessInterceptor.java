package com.sliit.vehiclerental.backend.config;

import com.sliit.vehiclerental.backend.controller.AuthController;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Component
public class AccessInterceptor implements HandlerInterceptor {

    private static final Set<String> BOOKING_ROLES = Set.of(
            "ROLE_CUSTOMER", "ROLE_BOOKING_MANAGER", "ROLE_RENTAL_OFFICER", "ROLE_ADMIN", "ROLE_BRANCH_MANAGER");

    private static final Map<String, Set<String>> STAFF_PAGES = Map.of(
            "/pages/booking-manager.html", Set.of("ROLE_BOOKING_MANAGER", "ROLE_ADMIN", "ROLE_RENTAL_OFFICER"),
            "/pages/fleet-manager.html", Set.of("ROLE_RENTAL_OFFICER", "ROLE_ADMIN"),
            "/pages/vehicle-management.html", Set.of("ROLE_RENTAL_OFFICER", "ROLE_ADMIN"),
            "/pages/maintenance.html", Set.of("ROLE_MAINTENANCE_SUPERVISOR", "ROLE_ADMIN", "ROLE_RENTAL_OFFICER"),
            "/pages/promotions.html", Set.of("ROLE_FINANCE_OFFICER", "ROLE_ADMIN"),
            "/pages/branches.html", Set.of("ROLE_BRANCH_MANAGER", "ROLE_ADMIN"),
            "/pages/contracts.html", Set.of("ROLE_RENTAL_OFFICER", "ROLE_FINANCE_OFFICER", "ROLE_ADMIN")
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method) || path.startsWith("/api/auth/") || path.equals("/api/health")) {
            return true;
        }

        HttpSession session = request.getSession(false);
        String role = session == null ? null : (String) session.getAttribute(AuthController.SESSION_USER_ROLE);

        if (path.startsWith("/api/")) {
            if (isPublicRead(path, method)) {
                return true;
            }
            if (role == null) {
                return apiError(response, 401, "Authentication required.");
            }
            if (!isAllowedApi(path, method, role)) {
                return apiError(response, 403, "You do not have permission to perform this action.");
            }
            return true;
        }

        Set<String> allowedRoles = STAFF_PAGES.get(path);
        if (allowedRoles != null) {
            if (role == null || !allowedRoles.contains(role)) {
                response.sendRedirect("/?login=required");
                return false;
            }
        } else if ((path.equals("/pages/booking.html") || path.equals("/pages/reservations.html"))
                && (role == null || !BOOKING_ROLES.contains(role))) {
            response.sendRedirect("/?login=required");
            return false;
        }
        return true;
    }

    private boolean isPublicRead(String path, String method) {
        return "GET".equalsIgnoreCase(method) && (path.startsWith("/api/vehicles")
                || path.startsWith("/api/categories") || path.startsWith("/api/branches")
                || path.startsWith("/api/promotions"));
    }

    private boolean isAllowedApi(String path, String method, String role) {
        if (path.startsWith("/api/bookings")) {
            if ("POST".equalsIgnoreCase(method)) {
                return "ROLE_CUSTOMER".equals(role);
            }
            if ("PUT".equalsIgnoreCase(method)) {
                return Set.of("ROLE_BOOKING_MANAGER", "ROLE_RENTAL_OFFICER", "ROLE_ADMIN", "ROLE_BRANCH_MANAGER").contains(role);
            }
            return BOOKING_ROLES.contains(role);
        }
        if (path.startsWith("/api/vehicles") || path.startsWith("/api/categories")) {
            return Set.of("ROLE_RENTAL_OFFICER", "ROLE_ADMIN").contains(role);
        }
        if (path.startsWith("/api/branches")) {
            return Set.of("ROLE_BRANCH_MANAGER", "ROLE_ADMIN").contains(role);
        }
        if (path.startsWith("/api/maintenance")) {
            return Set.of("ROLE_MAINTENANCE_SUPERVISOR", "ROLE_RENTAL_OFFICER", "ROLE_BRANCH_MANAGER", "ROLE_ADMIN").contains(role);
        }
        if (path.startsWith("/api/promotions")) {
            return Set.of("ROLE_FINANCE_OFFICER", "ROLE_ADMIN").contains(role);
        }
        if (path.startsWith("/api/contracts")) {
            return Set.of("ROLE_RENTAL_OFFICER", "ROLE_FINANCE_OFFICER", "ROLE_ADMIN").contains(role);
        }
        return "ROLE_ADMIN".equals(role);
    }

    private boolean apiError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"message\":\"" + message + "\"}");
        return false;
    }
}
