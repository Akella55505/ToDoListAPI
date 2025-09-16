package com.akella.todolistapi.controller;

import com.akella.todolistapi.model.User;
import com.akella.todolistapi.repository.TaskRepository;
import com.akella.todolistapi.dto.TaskDto;
import com.akella.todolistapi.dto.TaskMapper;
import com.akella.todolistapi.model.Task;
import com.akella.todolistapi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class TaskController {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDto> saveTask(@RequestBody TaskDto taskDto) {
        try {
            User currentUser = getCurrentUser();

            Task task = TaskMapper.toEntity(taskDto);
            task.setUser(currentUser);

            Task saved = taskRepository.save(task);
            return ResponseEntity.ok(TaskMapper.toDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tasks")
    public List<TaskDto> getAllTasks() {
        User currentUser = getCurrentUser();
        return taskRepository.findByUserOrderByDeadlineDateTimeAsc(currentUser)
                .stream()
                .map(TaskMapper::toDto)
                .toList();
    }

    @PatchMapping("/tasks/{id}")
    public ResponseEntity<TaskDto> completeTask(@PathVariable("id") Long id) {
        try {
            User currentUser = getCurrentUser();

            Task task = taskRepository.findByIdAndUser(id, currentUser)
                    .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

            task.setIsCompleted(Boolean.TRUE);
            Task updated = taskRepository.save(task);
            return ResponseEntity.ok(TaskMapper.toDto(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long id) {
        try {
            User currentUser = getCurrentUser();

            Task task = taskRepository.findByIdAndUser(id, currentUser)
                    .orElseThrow(() -> new IllegalArgumentException("Task not found or access denied"));

            taskRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
