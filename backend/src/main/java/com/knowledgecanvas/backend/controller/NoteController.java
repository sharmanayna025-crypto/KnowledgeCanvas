package com.knowledgecanvas.backend.controller;

import com.knowledgecanvas.backend.dto.NoteRequest;
import com.knowledgecanvas.backend.dto.NoteResponse;
import com.knowledgecanvas.backend.security.CustomUserDetails;
import com.knowledgecanvas.backend.service.NoteService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public List<NoteResponse> getAllNotes(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return noteService.getAllNotes(
                userDetails.getUsername()
        );
    }



    @PostMapping
    public NoteResponse createNote(
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return noteService.saveNote(
                request,
                userDetails.getUsername()
        );
    }



    @GetMapping("/search")
    public List<NoteResponse> searchNotes(
            @RequestParam String keyword,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return noteService.searchNotes(
                keyword,
                userDetails.getUsername()
        );
    }



    @GetMapping("/{id}")
    public NoteResponse getNoteById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return noteService.getNoteById(
                id,
                userDetails.getUsername()
        );
    }



    @PutMapping("/{id}")
    public NoteResponse updateNote(
            @PathVariable Long id,
            @Valid @RequestBody NoteRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return noteService.updateNote(
                id,
                request,
                userDetails.getUsername()
        );
    }



    @DeleteMapping("/{id}")
    public void deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        noteService.deleteNote(
                id,
                userDetails.getUsername()
        );
    }

}