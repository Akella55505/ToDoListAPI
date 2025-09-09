package com.akella.todolistapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication()
public class ToDoListApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ToDoListApiApplication.class, args);
    }

}
