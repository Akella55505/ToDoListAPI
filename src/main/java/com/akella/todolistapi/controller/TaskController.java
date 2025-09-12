package com.akella.todolistapi.controller;

import com.akella.todolistapi.repository.TaskRepository;
import com.akella.todolistapi.dto.TaskDto;
import com.akella.todolistapi.dto.TaskMapper;
import com.akella.todolistapi.model.Task;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDto> saveTask(@RequestBody TaskDto taskDto) {
        try {
            Task task = TaskMapper.toEntity(taskDto);
            Task saved = taskRepository.save(task);
            return ResponseEntity.ok(TaskMapper.toDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tasks")
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.ASC, "deadlineDateTime"))
                .stream()
                .map(TaskMapper::toDto)
                .toList();
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> completeTask(@PathVariable("id") Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setIsCompleted(Boolean.TRUE);
        Task updated = taskRepository.save(task);
        return ResponseEntity.ok(TaskMapper.toDto(updated));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
