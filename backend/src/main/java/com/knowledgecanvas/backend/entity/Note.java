package com.knowledgecanvas.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;


@Entity
public class Note {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @NotBlank(message = "Title cannot be empty")
    @Size(
            max = 100,
            message = "Title cannot exceed 100 characters"
    )
    private String title;



    @NotBlank(message = "Content cannot be empty")
    @Column(columnDefinition = "TEXT")
    private String content;



    private String color = "#FFFFFF";


    private String category = "General";


    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;



    public Note() {
    }



    @PrePersist
    public void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

    }



    @PreUpdate
    public void onUpdate() {

        updatedAt = LocalDateTime.now();

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




    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }

}