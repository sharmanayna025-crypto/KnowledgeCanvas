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
                note.getColor() == null
                        ? "#FFFFFF"
                        : note.getColor(),
                note.getCategory() == null
                        ? "General"
                        : note.getCategory(),
                note.getCreatedAt(),
                note.getUpdatedAt()
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

        List<Note> notes = noteRepository.findByUser(user);

        System.out.println("TOTAL NOTES = " + notes.size());

        for(Note note : notes){

            System.out.println(
                    "ID: " + note.getId()
                            + " TITLE: " + note.getTitle()
                            + " CONTENT: " + note.getContent()
            );

        }


        return notes.stream()
                .map(note -> {

                    System.out.println(
                            "CONVERTING NOTE ID = "
                                    + note.getId()
                    );

                    return convertToResponse(note);

                })
                .toList();

    }







    public NoteResponse saveNote(
            NoteRequest request,
            String email
    ) {


        User user = getUser(email);



        Note note = new Note();


        note.setTitle(
                request.getTitle()
        );


        note.setContent(
                request.getContent()
        );



        note.setColor(
                request.getColor() == null
                        ? "#FFFFFF"
                        : request.getColor()
        );



        note.setCategory(
                request.getCategory() == null
                        ? "General"
                        : request.getCategory()
        );



        note.setUser(user);



        Note savedNote =
                noteRepository.save(note);



        return convertToResponse(savedNote);

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
                noteRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );



        return convertToResponse(note);

    }









    public NoteResponse updateNote(
            Long id,
            NoteRequest request,
            String email
    ) {


        User user = getUser(email);



        Note note =
                noteRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );



        note.setTitle(
                request.getTitle()
        );


        note.setContent(
                request.getContent()
        );


        note.setColor(
                request.getColor() == null
                        ? "#FFFFFF"
                        : request.getColor()
        );


        note.setCategory(
                request.getCategory() == null
                        ? "General"
                        : request.getCategory()
        );



        Note updatedNote =
                noteRepository.save(note);



        return convertToResponse(updatedNote);

    }









    public void deleteNote(
            Long id,
            String email
    ) {


        User user = getUser(email);



        Note note =
                noteRepository.findByIdAndUser(id, user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Note not found"
                                )
                        );



        noteRepository.delete(note);

    }


}