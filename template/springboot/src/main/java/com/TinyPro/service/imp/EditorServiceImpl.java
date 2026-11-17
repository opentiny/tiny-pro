package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.EditorDocumentDto;
import com.TinyPro.entity.dto.CollaborationDocumentDto;
import com.TinyPro.entity.dto.EditorUpdateRequest;
import com.TinyPro.entity.po.Editor;
import com.TinyPro.entity.po.EditorMember;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.EditorVo;
import com.TinyPro.entity.vo.CollaborationEditorVo;
import com.TinyPro.jpa.EditorMemberRepository;
import com.TinyPro.jpa.EditorRepository;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.service.EditorService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EditorServiceImpl implements EditorService {

    private final EditorRepository editorRepository;
    private final EditorMemberRepository editorMemberRepository;
    private final IUserRepository userRepository;

    public EditorServiceImpl(
            EditorRepository editorRepository,
            EditorMemberRepository editorMemberRepository,
            IUserRepository userRepository) {
        this.editorRepository = editorRepository;
        this.editorMemberRepository = editorMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ResponseEntity<List<EditorVo>> getDocuments() {
        List<EditorVo> documents = editorRepository.findAllByOrderByTimeDescIdDesc()
                .stream()
                .map(EditorVo::from)
                .toList();
        return ResponseEntity.ok(documents);
    }

    @Override
    public ResponseEntity<List<CollaborationEditorVo>> getCollaborationDocuments() {
        List<Editor> editors = editorRepository.findAllByOrderByTimeDescIdDesc();
        if (editors.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Long> editorIds = editors.stream()
                .map(Editor::getId)
                .toList();
        List<EditorMember> editorMembers = editorMemberRepository
                .findAllByEditorIdInOrderByEditorIdAscIdAsc(editorIds);
        if (editorMembers.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Integer> userIds = editorMembers.stream()
                .map(EditorMember::getUserId)
                .distinct()
                .toList();
        Map<Integer, String> userNames = userRepository.findAllByIdIn(userIds).stream()
                .collect(Collectors.toMap(User::getId, User::getName, (first, ignored) -> first));

        Map<Long, List<String>> membersByEditor = new LinkedHashMap<>();
        for (EditorMember editorMember : editorMembers) {
            String userName = userNames.get(editorMember.getUserId());
            if (userName != null) {
                membersByEditor
                        .computeIfAbsent(editorMember.getEditorId(), ignored -> new ArrayList<>())
                        .add(userName);
            }
        }

        List<CollaborationEditorVo> documents = editors.stream()
                .filter(editor -> membersByEditor.containsKey(editor.getId()))
                .map(editor -> CollaborationEditorVo.from(
                        editor,
                        membersByEditor.get(editor.getId())))
                .toList();
        return ResponseEntity.ok(documents);
    }

    @Override
    @Transactional
    public EditorVo postDocument(EditorDocumentDto documentDto) {
        Editor editor = new Editor();
        editor.setName(documentDto.getName());
        editor.setContent(documentDto.getContent());
        editor.setDepartment(
                documentDto.getDepartment() == null || documentDto.getDepartment().isBlank()
                        ? "未分类"
                        : documentDto.getDepartment()
        );
        return EditorVo.from(editorRepository.save(editor));
    }

    @Override
    @Transactional
    public CollaborationEditorVo postCollaborationDocument(
            CollaborationDocumentDto documentDto) {
        if (documentDto == null || documentDto.getName() == null
                || documentDto.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "文档名称不能为空");
        }

        List<String> memberNames = documentDto.getMembers() == null
                ? List.of()
                : documentDto.getMembers();
        Map<String, User> usersByName = resolveMembers(memberNames);
        if (usersByName == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "协同成员不存在");
        }

        Editor editor = new Editor();
        editor.setName(documentDto.getName());
        editor.setContent(documentDto.getContent() == null ? "" : documentDto.getContent());
        editor.setDepartment("未分类");
        Editor savedEditor = editorRepository.saveAndFlush(editor);

        List<EditorMember> members = usersByName.values().stream()
                .map(user -> {
                    EditorMember member = new EditorMember();
                    member.setEditorId(savedEditor.getId());
                    member.setUserId(user.getId());
                    return member;
                })
                .toList();
        if (!members.isEmpty()) {
            editorMemberRepository.saveAll(members);
        }

        return CollaborationEditorVo.from(savedEditor, new java.util.ArrayList<>(usersByName.keySet()));
    }

    @Override
    @Transactional
    public boolean updateDocument(EditorUpdateRequest request) {
        if (request == null || request.getId() == null || request.getPatch() == null) {
            return false;
        }

        Editor editor = editorRepository.findById(request.getId()).orElse(null);
        if (editor == null) {
            return false;
        }

        EditorUpdateRequest.Patch patch = request.getPatch();
        Map<String, User> usersByName = resolveMembers(patch.getMembers());
        if (patch.getMembers() != null && usersByName == null) {
            return false;
        }

        if (patch.getName() != null) {
            editor.setName(patch.getName());
        }
        if (patch.getContent() != null) {
            editor.setContent(patch.getContent());
        }
        if (patch.getDepartment() != null) {
            editor.setDepartment(patch.getDepartment());
        }
        if (patch.getTime() != null) {
            editor.setTime(patch.getTime());
        }

        editorRepository.save(editor);

        if (patch.getMembers() != null) {
            List<EditorMember> members = usersByName.values().stream()
                    .filter(user -> !editorMemberRepository.existsByEditorIdAndUserId(
                            editor.getId(), user.getId()))
                    .map(user -> {
                        EditorMember member = new EditorMember();
                        member.setEditorId(editor.getId());
                        member.setUserId(user.getId());
                        return member;
                    })
                    .toList();
            if (!members.isEmpty()) {
                editorMemberRepository.saveAll(members);
            }
        }
        return true;
    }

    @Override
    @Transactional
    public boolean deleteDocument(Long id) {
        if (id == null || !editorRepository.existsById(id)) {
            return false;
        }
        editorRepository.deleteById(id);
        return true;
    }

    @Override
    @Transactional
    public boolean deleteCollaborationDocument(Long id) {
        return deleteDocument(id);
    }

    private Map<String, User> resolveMembers(List<String> memberNames) {
        if (memberNames == null) {
            return Map.of();
        }

        List<String> normalizedNames = memberNames.stream()
                .filter(name -> name != null && !name.isBlank())
                .map(String::trim)
                .distinct()
                .toList();
        if (normalizedNames.isEmpty()) {
            return Map.of();
        }
        List<User> users = userRepository.findAllByNameIn(normalizedNames);
        Map<String, User> usersByName = users.stream()
                .collect(Collectors.toMap(User::getName, Function.identity(), (first, ignored) -> first));

        return usersByName.keySet().containsAll(normalizedNames) ? usersByName : null;
    }
}
