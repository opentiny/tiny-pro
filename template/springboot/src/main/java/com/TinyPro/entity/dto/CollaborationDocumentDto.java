package com.TinyPro.entity.dto;

import lombok.Data;

import java.util.List;

/**
 * Create request for a collaborative editor document.
 */
@Data
public class CollaborationDocumentDto {

    private String name;

    private String content;

    /** User names submitted by the frontend. */
    private List<String> members;
}
