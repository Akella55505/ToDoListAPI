package com.akella.todolistapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication()
@RestController
public class ToDoListApiApplication {

    @GetMapping("/hi")
    public String testMethod()
    {
        return "Hello World";
    }

    public static void main(String[] args) {
        SpringApplication.run(ToDoListApiApplication.class, args);
    }

}
