package com.knowledgecanvas.backend.controller;

import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public List<NoteResponse> getAllNotes() {
        return noteService.getAllNotes();
    }

    @PostMapping
    public NoteResponse createNote(@Valid @RequestBody NoteRequest request) {
        return noteService.saveNote(request);
    }

    @GetMapping("/search")
    public List<NoteResponse> searchNotes(@RequestParam String keyword) {
        return noteService.searchNotes(keyword);
    }

    @GetMapping("/{id}")
    public NoteResponse getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id);
    }

    @PutMapping("/{id}")
    public NoteResponse updateNote(@PathVariable Long id,
                                   @Valid @RequestBody NoteRequest request) {
        return noteService.updateNote(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
    }
}