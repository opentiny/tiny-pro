package com.TinyPro.entity.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Partial update request for an editor document.
 *
 * The patch fields are nullable so omitted fields keep their existing values.
 */
@Data
public class EditorUpdateRequest {

    private Long id;

    private Patch patch;

    @Data
    public static class Patch {

        private String name;

        private String content;

        private String department;

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime time;

        /**
         * Collaborative member names. Null means keep the existing members;
         * an empty list clears all members.
         */
        private List<String> members;
    }
}
