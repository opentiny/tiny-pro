package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.Editor;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Collaborative editor document with its member names.
 */
@Data
@AllArgsConstructor
public class CollaborationEditorVo {

    private Long id;
    private String name;
    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime time;

    private List<String> members;

    public static CollaborationEditorVo from(Editor editor, List<String> members) {
        return new CollaborationEditorVo(
                editor.getId(),
                editor.getName(),
                editor.getContent(),
                editor.getTime(),
                members
        );
    }
}
