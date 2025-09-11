package com.akella.todolistapi;

public class TaskMapper {

    public static TaskDTO toDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getDescription(),
                task.getDeadlineDateTime(),
                task.getIsCompleted()
        );
    }

    public static Task toEntity(TaskDTO dto) {
        Task task = new Task();
        task.setId(dto.id());
        task.setDescription(dto.description());
        task.setDeadlineDateTime(dto.deadlineDateTime());
        task.setIsCompleted(dto.isCompleted());
        return task;
    }
}
