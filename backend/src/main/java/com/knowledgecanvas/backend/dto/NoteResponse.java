package com.knowledgecanvas.backend.dto;

import java.time.LocalDateTime;

public class NoteResponse {

    private Long id;

    private String title;

    private String content;

    private String color;

    private String category;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public NoteResponse() {
    }

    public NoteResponse(
            Long id,
            String title,
            String content,
            String color,
            String category,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {

        this.id = id;
        this.title = title;
        this.content = content;
        this.color = color;
        this.category = category;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}