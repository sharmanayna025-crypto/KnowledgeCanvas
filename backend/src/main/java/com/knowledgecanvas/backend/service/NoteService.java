package com.knowledgecanvas.backend.service;

import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

        return noteRepository.findById(id)
                .map(this::convertToResponse)
                .orElse(null);
    }

    public NoteResponse saveNote(NoteRequest request) {

        Note note = convertToEntity(request);

        Note savedNote = noteRepository.save(note);

        return convertToResponse(savedNote);
    }
    public NoteResponse updateNote(Long id, NoteRequest request) {

        return noteRepository.findById(id)
                .map(note -> {

                    note.setTitle(request.getTitle());
                    note.setContent(request.getContent());

                    Note updated = noteRepository.save(note);

                    return convertToResponse(updated);

                })
                .orElse(null);
    }
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}