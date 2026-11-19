package com.TinyPro.controller;

import com.TinyPro.annotation.Reject;
import com.TinyPro.entity.dto.EditorDocumentDto;
import com.TinyPro.entity.dto.CollaborationDocumentDto;
import com.TinyPro.entity.dto.EditorUpdateRequest;
import com.TinyPro.entity.vo.EditorVo;
import com.TinyPro.entity.vo.CollaborationEditorVo;
import com.TinyPro.service.EditorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/editor")
@RestController
public class EditorController {

    private final EditorService editorService;

    public EditorController(EditorService editorService) {
        this.editorService = editorService;
    }

    @GetMapping("/documents")
    public ResponseEntity<List<EditorVo>> getDocuments() {
        return editorService.getDocuments();
    }

    @GetMapping("/collaboration-documents")
    public ResponseEntity<List<CollaborationEditorVo>> getCollaborationDocuments() {
        return editorService.getCollaborationDocuments();
    }
    @Reject
    @PostMapping("/document")
    public EditorVo postDocument(@Valid @RequestBody EditorDocumentDto documentDto) {
        return editorService.postDocument(documentDto);
    }
    @Reject
    @PostMapping("/collaboration-document")
    public CollaborationEditorVo postCollaborationDocument(
            @RequestBody CollaborationDocumentDto documentDto) {
        return editorService.postCollaborationDocument(documentDto);
    }

    @Reject
    @PostMapping({"/document/update", "/collaboration-document/update"})
    public boolean updateDocument(@RequestBody EditorUpdateRequest request) {
        return editorService.updateDocument(request);
    }
    @Reject
    @DeleteMapping("/document")
    public boolean deleteDocument(@RequestParam Long id) {
        return editorService.deleteDocument(id);
    }
    @Reject
    @DeleteMapping("/collaboration-document")
    public boolean deleteCollaborationDocument(@RequestParam Long id) {
        return editorService.deleteCollaborationDocument(id);
    }
}
