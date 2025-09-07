package com.akella.todolistapi;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class ListController {

    @GetMapping("/test")
    public String returnString() {
        return "This is a test string";
    }
}
