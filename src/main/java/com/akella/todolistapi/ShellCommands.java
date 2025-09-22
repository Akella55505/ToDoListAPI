package com.akella.todolistapi;

import com.akella.todolistapi.enums.Role;
import com.akella.todolistapi.model.User;
import com.akella.todolistapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.shell.standard.ShellComponent;
import org.springframework.shell.standard.ShellMethod;
import org.springframework.shell.standard.ShellOption;

import java.util.Optional;

@ShellComponent
@RequiredArgsConstructor
public class ShellCommands {

    private UserRepository userRepository;

    @Autowired
    public ShellCommands(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @ShellMethod(key = "make-admin", value = "Make user admin by email")
    public String makeAdmin(@ShellOption(help = "User email") String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        optionalUser.ifPresent(user -> {
            user.setRole(Role.ADMIN);
            userRepository.save(user);
        });
        return "Done!";
    }
}
