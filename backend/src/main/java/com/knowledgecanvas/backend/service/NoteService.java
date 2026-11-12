package com.knowledgecanvas.backend.service;


import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.exception.ResourceNotFoundException;
import com.knowledgecanvas.backend.repository.NoteRepository;
import com.knowledgecanvas.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;


@Service
public class NoteService {

    // Pinned notes first, then most recently updated.
    private static final Comparator<NoteResponse> PINNED_THEN_NEWEST =
            Comparator
                    .comparing((NoteResponse n) ->
                            Boolean.TRUE.equals(n.getPinned()) ? 0 : 1)
                    .thenComparing(
                            NoteResponse::getUpdatedAt,
                            Comparator.nullsLast(
                                    Comparator.<LocalDateTime>reverseOrder()
                            )
                    );


    private final NoteRepository noteRepository;
    private final UserRepository userRepository;


    public NoteService(
            NoteRepository noteRepository,
            UserRepository userRepository
    ) {

        this.noteRepository = noteRepository;
        this.userRepository = userRepository;

    }



    private NoteResponse convertToResponse(Note note) {

        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent(),
                note.getColor() == null
                        ? "#FFFFFF"
                        : note.getColor(),
                note.getCategory() == null
                        ? "General"
                        : note.getCategory(),
                Boolean.TRUE.equals(note.getPinned()),
                note.getCreatedAt(),
                note.getUpdatedAt()
        );

    }



    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

    }



    private Note getOwnedNote(Long id, User user) {

        return noteRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Note not found")
                );

    }



    private void copyFields(NoteRequest request, Note note) {

        note.setTitle(request.getTitle().trim());

        note.setContent(request.getContent());

        note.setColor(
                request.getColor() == null || request.getColor().isBlank()
                        ? "#FFFFFF"
                        : request.getColor()
        );

        note.setCategory(
                request.getCategory() == null || request.getCategory().isBlank()
                        ? "General"
                        : request.getCategory().trim()
        );

        if (request.getPinned() != null) {
            note.setPinned(request.getPinned());
        }

    }



    public List<NoteResponse> getAllNotes(String email) {

        User user = getUser(email);

        return noteRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .sorted(PINNED_THEN_NEWEST)
                .toList();

    }



    public NoteResponse saveNote(
            NoteRequest request,
            String email
    ) {

        User user = getUser(email);

        Note note = new Note();

        copyFields(request, note);

        note.setUser(user);

        return convertToResponse(noteRepository.save(note));

    }



    public List<NoteResponse> searchNotes(
            String keyword,
            String email
    ) {

        User user = getUser(email);

        return noteRepository
                .searchByTitleOrContent(user, keyword)
                .stream()
                .map(this::convertToResponse)
                .sorted(PINNED_THEN_NEWEST)
                .toList();

    }



    public NoteResponse getNoteById(
            Long id,
            String email
    ) {

        return convertToResponse(
                getOwnedNote(id, getUser(email))
        );

    }



    public NoteResponse updateNote(
            Long id,
            NoteRequest request,
            String email
    ) {

        Note note = getOwnedNote(id, getUser(email));

        copyFields(request, note);

        return convertToResponse(noteRepository.save(note));

    }



    public NoteResponse togglePin(
            Long id,
            String email
    ) {

        Note note = getOwnedNote(id, getUser(email));

        note.setPinned(!Boolean.TRUE.equals(note.getPinned()));

        return convertToResponse(noteRepository.save(note));

    }



    public void deleteNote(
            Long id,
            String email
    ) {

        noteRepository.delete(
                getOwnedNote(id, getUser(email))
        );

    }

}
