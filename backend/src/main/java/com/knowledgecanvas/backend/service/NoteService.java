package com.knowledgecanvas.backend.service;


import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.entity.User;
import com.knowledgecanvas.backend.exception.ResourceNotFoundException;
import com.knowledgecanvas.backend.repository.NoteRepository;
import com.knowledgecanvas.backend.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class NoteService {


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
                note.getColor()
        );
    }




    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }





    public List<NoteResponse> getAllNotes(String email) {


        User user = getUser(email);


        return noteRepository.findByUser(user)
                .stream()
                .map(this::convertToResponse)
                .toList();

    }





    public NoteResponse saveNote(
            NoteRequest request,
            String email
    ) {


        User user = getUser(email);


        Note note = new Note();

        note.setTitle(request.getTitle());

        note.setContent(request.getContent());

        note.setColor(
                request.getColor() == null
                        ? "white"
                        : request.getColor()
        );


        note.setUser(user);


        Note saved =
                noteRepository.save(note);


        return convertToResponse(saved);

    }





    public List<NoteResponse> searchNotes(
            String keyword,
            String email
    ) {


        User user = getUser(email);


        return noteRepository
                .findByUserAndTitleContainingIgnoreCase(
                        user,
                        keyword
                )
                .stream()
                .map(this::convertToResponse)
                .toList();

    }





    public NoteResponse getNoteById(
            Long id,
            String email
    ) {


        User user = getUser(email);


        Note note =
                noteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );


        if (!note.getUser().equals(user)) {
            throw new RuntimeException("Unauthorized");
        }


        return convertToResponse(note);

    }





    public NoteResponse updateNote(
            Long id,
            NoteRequest request,
            String email
    ) {


        Note note =
                noteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );


        note.setTitle(request.getTitle());

        note.setContent(request.getContent());

        note.setColor(
                request.getColor() == null
                        ? "white"
                        : request.getColor()
        );


        return convertToResponse(
                noteRepository.save(note)
        );

    }





    public void deleteNote(
            Long id,
            String email
    ) {


        Note note =
                noteRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );


        noteRepository.delete(note);

    }

}