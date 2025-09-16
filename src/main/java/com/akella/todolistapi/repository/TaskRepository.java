package com.akella.todolistapi.repository;

import com.akella.todolistapi.model.Task;
import com.akella.todolistapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserOrderByDeadlineDateTimeAsc(User user);

    Optional<Task> findByIdAndUser(Long id, User user);
}
