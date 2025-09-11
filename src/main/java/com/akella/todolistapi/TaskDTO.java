package com.akella.todolistapi;

import java.time.LocalDateTime;

public record TaskDTO(
        Long id,
        String description,
        LocalDateTime deadlineDateTime,
        Boolean isCompleted
) {}
