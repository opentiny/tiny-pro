package com.TinyPro.jpa;

import com.TinyPro.entity.po.EditorMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface EditorMemberRepository extends JpaRepository<EditorMember, Long> {

    boolean existsByEditorIdAndUserId(Long editorId, Integer userId);

    List<EditorMember> findAllByEditorIdInOrderByEditorIdAscIdAsc(Collection<Long> editorIds);
}
