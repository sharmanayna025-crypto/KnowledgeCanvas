package com.knowledgecanvas.backend.repository;

import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByTitleContainingIgnoreCase(String keyword);

    List<Note> findByUser(User user);

    List<Note> findByUserAndTitleContainingIgnoreCase(User user, String keyword);
}