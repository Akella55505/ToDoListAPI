package com.akella.todolistapi;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @PostMapping("/tasks")
    public ResponseEntity<?> saveTask(@RequestBody Task task) {
        try {
            taskRepository.save(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tasks")
    public List<Task> getAllTasks() {
        return taskRepository.findAll(Sort.by(Sort.Direction.ASC, "deadlineDateTime"));
    }

    @PatchMapping("/tasks/{id}")
    public Task completeTask(@PathVariable("id") Long id) {
        Task task = taskRepository.getReferenceById(id);
        task.setIsCompleted(Boolean.TRUE);
        return taskRepository.save(task);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long id) {
        taskRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
