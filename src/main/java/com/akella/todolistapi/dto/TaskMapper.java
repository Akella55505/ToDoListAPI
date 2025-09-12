package com.akella.todolistapi.dto;

import com.akella.todolistapi.model.Task;

public class TaskMapper {

    public static TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getDescription(),
                task.getDeadlineDateTime(),
                task.getIsCompleted()
        );
    }

    public static Task toEntity(TaskDto dto) {
        Task task = new Task();
        task.setId(dto.id());
        task.setDescription(dto.description());
        task.setDeadlineDateTime(dto.deadlineDateTime());
        task.setIsCompleted(dto.isCompleted());
        return task;
    }
}
