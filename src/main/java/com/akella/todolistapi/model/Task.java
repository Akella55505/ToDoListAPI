package com.akella.todolistapi.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {
    @Id
    @GeneratedValue
    private Long id;
    @Column
    private LocalDateTime deadlineDateTime;
    @Column(nullable = false)
    private String description;
    @Column(nullable = false)
    private Boolean isCompleted = false;
}
