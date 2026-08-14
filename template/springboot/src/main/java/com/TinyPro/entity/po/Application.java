package com.TinyPro.entity.po;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Entity
@Table(name = "application")
@Data
public class Application {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  private String description;

  @Column(columnDefinition = "TEXT")
  private String tag;

  private String icon;

  private String classify;

  @CreationTimestamp
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public Application(String name, String description, String tag, String icon, String classify) {
    this.name = name;
    this.description = description;
    this.tag = tag;
    this.icon = icon;
    this.classify = classify;
  }



  // 安全解析 tag（非持久化方法）
  public Object parseTagSafely() {
    if (tag == null || tag.isBlank()) return new Object[0];
    try {
      return new ObjectMapper().readValue(tag, Object.class);
    } catch (Exception e) {
      return new Object[0];
    }
  }
}
