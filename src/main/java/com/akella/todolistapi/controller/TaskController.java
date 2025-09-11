package com.akella.todolistapi.controller;

import com.akella.todolistapi.repository.TaskRepository;
import com.akella.todolistapi.dto.TaskDTO;
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
    public ResponseEntity<TaskDTO> saveTask(@RequestBody TaskDTO taskDto) {
        try {
            Task task = TaskMapper.toEntity(taskDto);
            Task saved = taskRepository.save(task);
            return ResponseEntity.ok(TaskMapper.toDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tasks")
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.ASC, "deadlineDateTime"))
                .stream()
                .map(TaskMapper::toDTO)
                .toList();
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<TaskDTO> completeTask(@PathVariable("id") Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setIsCompleted(Boolean.TRUE);
        Task updated = taskRepository.save(task);
        return ResponseEntity.ok(TaskMapper.toDTO(updated));
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
