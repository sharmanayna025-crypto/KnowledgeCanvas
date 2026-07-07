package com.knowledgecanvas.backend.controller;

import jakarta.validation.Valid;
import com.knowledgecanvas.backend.entity.Note;
import com.knowledgecanvas.backend.service.NoteService;
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
    public List<Note> getAllNotes() {
        return noteService.getAllNotes();
    }

    @PostMapping
    public Note createNote(@Valid @RequestBody Note note) {
        return noteService.saveNote(note);
    }
    @GetMapping("/search")
    public List<Note> searchNotes(@RequestParam String keyword) {
        return noteService.searchNotes(keyword);
    }
    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id,
                           @Valid @RequestBody Note note) {
        return noteService.updateNote(id, note);
    }

    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
    }
}