package com.knowledgecanvas.backend.repository;

import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUser(User user);

    List<Note> findByUserAndTitleContainingIgnoreCase(
            User user,
            String keyword
    );

    @Query("select n from Note n where n.user = :user and ("
            + "lower(n.title) like lower(concat('%', :keyword, '%')) or "
            + "lower(n.content) like lower(concat('%', :keyword, '%')))")
    List<Note> searchByTitleOrContent(
            @Param("user") User user,
            @Param("keyword") String keyword
    );

    Optional<Note> findByIdAndUser(
            Long id,
            User user
    );
}
