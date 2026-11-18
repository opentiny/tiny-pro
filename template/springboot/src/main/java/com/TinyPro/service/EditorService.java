package com.TinyPro.service;

import com.TinyPro.entity.dto.EditorDocumentDto;
import com.TinyPro.entity.dto.CollaborationDocumentDto;
import com.TinyPro.entity.dto.EditorUpdateRequest;
import com.TinyPro.entity.vo.CollaborationEditorVo;
import com.TinyPro.entity.vo.EditorVo;
import com.TinyPro.entity.vo.CollaborationEditorVo;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface EditorService {

    /**
     * Query editor documents ordered by the latest document time first.
     */
    ResponseEntity<List<EditorVo>> getDocuments();

    /**
     * Query documents that have collaborative members and expose their names.
     */
    ResponseEntity<List<CollaborationEditorVo>> getCollaborationDocuments();

    /**
     * Post a new editor document.
     */
    EditorVo postDocument(EditorDocumentDto documentDto);

    /**
     * Create a collaborative document and persist its member relationships.
     */
    CollaborationEditorVo postCollaborationDocument(CollaborationDocumentDto documentDto);

    /**
     * Partially update an editor document.
     *
     * @return true when the document exists and was updated
     */
    boolean updateDocument(EditorUpdateRequest request);
    /**
     * Delete an editor document by its ID.
     *
     * @return true when the document exists and was deleted
     */
    boolean deleteDocument(Long id);

    /**
     * Delete a collaborative editor document by its ID.
     */
    boolean deleteCollaborationDocument(Long id);
}
