package com.knowledgecanvas.backend.dto;


public class NoteResponse {


    private Long id;

    private String title;

    private String content;

    private String color;


    public NoteResponse() {
    }


    public NoteResponse(
            Long id,
            String title,
            String content,
            String color
    ) {

        this.id = id;
        this.title = title;
        this.content = content;
        this.color = color;

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
}