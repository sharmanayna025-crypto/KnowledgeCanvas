package com.knowledgecanvas.backend.repository;

import com.knowledgecanvas.backend.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}