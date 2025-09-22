package com.akella.todolistapi.controller;

import com.akella.todolistapi.model.Task;
import com.akella.todolistapi.model.User;
import com.akella.todolistapi.repository.TaskRepository;
import com.akella.todolistapi.repository.UserRepository;
import com.akella.todolistapi.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
@AutoConfigureMockMvc(addFilters = false)
public class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskRepository taskRepository;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("test@email.com");

        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn(mockUser.getEmail());
        SecurityContext securityContext = Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
    }

    @Test
    void saveTask_shouldReturnTaskDto() throws Exception {
        Task task = new Task();
        task.setId(10L);
        task.setDescription("Test description");
        task.setDeadlineDateTime(LocalDateTime.now());
        task.setUser(mockUser);

        when(taskRepository.save(any(Task.class))).thenReturn(task);

        mockMvc.perform(post("/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"description\":\"Test description\",\"deadlineDateTime\":\"2025-09-22T12:00:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(task.getId()))
                .andExpect(jsonPath("$.description").value("Test description"));
    }

    @Test
    void completeTask_shouldMarkCompleted() throws Exception {
        Task task = new Task();
        task.setId(5L);
        task.setDescription("Test description");
        task.setIsCompleted(false);
        task.setUser(mockUser);

        when(taskRepository.findByIdAndUser(5L, mockUser)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/tasks/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isCompleted").value(true));
    }

    @Test
    void completeTask_notFoundReturn404() throws Exception {
        when(taskRepository.findByIdAndUser(999L, mockUser)).thenReturn(Optional.empty());

        mockMvc.perform(patch("/tasks/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_shouldDeleteAndReturn200() throws Exception {
        Task task = new Task();
        task.setId(3L);
        task.setUser(mockUser);

        when(taskRepository.findByIdAndUser(3L, mockUser)).thenReturn(Optional.of(task));

        mockMvc.perform(delete("/tasks/3"))
                .andExpect(status().isOk());
    }

    @Test
    void deleteTask_notFoundShouldReturn404() throws Exception {
        when(taskRepository.findByIdAndUser(77L, mockUser)).thenReturn(Optional.empty());

        mockMvc.perform(delete("/tasks/77"))
                .andExpect(status().isNotFound());
    }
}
