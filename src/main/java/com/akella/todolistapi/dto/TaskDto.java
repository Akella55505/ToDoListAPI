package com.akella.todolistapi.dto;

import java.time.LocalDateTime;

public record TaskDto(
        Long id,
        String description,
        LocalDateTime deadlineDateTime,
        Boolean isCompleted
) {}
