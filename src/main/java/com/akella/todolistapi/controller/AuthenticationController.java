package com.akella.todolistapi.controller;

import com.akella.todolistapi.dto.UserDto;
import com.akella.todolistapi.security.AuthenticationResponse;
import com.akella.todolistapi.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> registerUser(@RequestBody UserDto registrationData) {
        return ResponseEntity.ok(authenticationService.register(registrationData));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> loginUser(@RequestBody UserDto loginData) {
        return ResponseEntity.ok(authenticationService.login(loginData));
    }
}
