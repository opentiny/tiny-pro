package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateLangDto;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Lang;
import com.TinyPro.exception.BusinessException;
;
import com.TinyPro.service.ILangService;
import com.TinyPro.jpa.I18Repository;
import com.TinyPro.jpa.LangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ILangSerivceImp  implements ILangService {
    @Autowired
    private LangRepository langRepository;
    @Autowired
    private I18Repository i18Repository;

    @Override
    public ResponseEntity<Lang> create(CreateLangDto createLangDto) {
        Optional<Lang> byName = langRepository.findByName(createLangDto.getName());
        if (!byName.isEmpty()) {
            throw new BusinessException("exception.lang.exists", HttpStatus.CONFLICT, null);
        }
        Lang lang = new Lang();
        lang.setName(createLangDto.getName());
        Lang save = langRepository.save(lang);
        return ResponseEntity.ok(save);
    }

    @Override
    public ResponseEntity<List<Lang>> findAll() {
        return ResponseEntity.ok(langRepository.findAll());
    }

    @Override
    public ResponseEntity<Lang> update(Integer id, CreateLangDto createLangDto) {
        Optional<Lang> byId = langRepository.findById(Long.valueOf(id));
        if (byId.isEmpty()) {
            throw new BusinessException("exception.lang.notExistsCommon", HttpStatus.NOT_FOUND, null);
        }
        Lang lang = new Lang();
        lang.setName(createLangDto.getName());
        Lang save = langRepository.save(lang);
        return ResponseEntity.ok(save);
    }

    @Override
    @Transactional
    public ResponseEntity<Lang> remove(Integer id) {
        Optional<Lang> byId = langRepository.findById(Long.valueOf(id));
        Lang lang = byId.orElseThrow(() -> new BusinessException("exception.lang.notExistsCommon", HttpStatus.NOT_FOUND, null));
        i18Repository.deleteByLangId(lang.getId());
        langRepository.deleteById(Long.valueOf(id));
        return ResponseEntity.ok(lang);
    }
}
