package com.TinyPro.entity.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import com.TinyPro.entity.po.Editor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class EditorVo {
    private Long id;
    private String name;
    private String content;
    private String department;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime time;

    public static EditorVo from(Editor editor) {
        if (editor == null) {
            return null;
        }
        return new EditorVo(
                editor.getId(),
                editor.getName(),
                editor.getContent(),
                editor.getDepartment(),
                editor.getTime()
        );
    }
}
