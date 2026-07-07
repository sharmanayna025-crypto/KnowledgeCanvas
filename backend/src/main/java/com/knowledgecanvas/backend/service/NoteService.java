package com.knowledgecanvas.backend.service;

import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.exception.ResourceNotFoundException;
import com.knowledgecanvas.backend.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }


    private NoteResponse convertToResponse(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getTitle(),
                note.getContent()
        );
    }


    private Note convertToEntity(NoteRequest request) {
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        return note;
    }


    public List<NoteResponse> searchNotes(String keyword) {

        return noteRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    public List<NoteResponse> getAllNotes() {

        return noteRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    public NoteResponse getNoteById(Long id) {

        Note note = noteRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Note not found with id: " + id)
                );

        return convertToResponse(note);
    }


    public NoteResponse saveNote(NoteRequest request) {

        Note note = convertToEntity(request);

        Note savedNote = noteRepository.save(note);

        return convertToResponse(savedNote);
    }


    public NoteResponse updateNote(Long id, NoteRequest request) {

        Note note = noteRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Note not found with id: " + id)
                );

        note.setTitle(request.getTitle());
        note.setContent(request.getContent());

        Note updated = noteRepository.save(note);

        return convertToResponse(updated);
    }


    public void deleteNote(Long id) {

        Note note = noteRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Note not found with id: " + id)
                );

        noteRepository.delete(note);
    }
}