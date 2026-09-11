package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.dto.PaginationQueryDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.entity.vo.ApplicationVo;
import com.TinyPro.jpa.ApplicationRepository;
import com.TinyPro.service.ApplicationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

  private final ApplicationRepository applicationRepository;
  private final MessageSource messageSource;
  private final ObjectMapper objectMapper;

  // 分页查询
  public ApplicationVo findAllApplication(PaginationQueryDto searchInfo) {
    int page = searchInfo.getPage();
    int limit = searchInfo.getLimit();
    String keywords = searchInfo.getKeywords();
    String classify = searchInfo.getClassify();
    Pageable pageable = PageRequest.of(page - 1, limit);

    Specification<Application> spec = (root, query, cb) -> {
      List<Predicate> predicates = new ArrayList<>();

      if (keywords != null && !keywords.isEmpty()) {
        String pattern = "%" + keywords + "%";
        Predicate namePred = cb.like(root.get("name"), pattern);
        Predicate descPred = cb.like(root.get("description"), pattern);
        Predicate tagPred = cb.like(root.get("tag"), pattern);
        predicates.add(cb.or(namePred, descPred, tagPred));
      }

      if (classify != null && !classify.isBlank() && !"all".equalsIgnoreCase(classify)) {
        predicates.add(cb.equal(root.get("classify"), classify));
      }

      return cb.and(predicates.toArray(new Predicate[0]));
    };

    Page<Application> pageResult = applicationRepository.findAll(spec, pageable);

    List<ApplicationVo.ApplicationItem> items = pageResult.getContent().stream()
      .map(app -> new ApplicationVo.ApplicationItem(
        app.getId(),
        app.getName(),
        app.getDescription(),
        app.parseTagSafely(),
        app.getIcon(),
        app.getClassify()
      ))
      .toList();

    return new ApplicationVo(items, pageResult.getTotalElements());
  }

  // 创建应用（支持 isInit）
  @Transactional
  public Application createApplication(@Valid CreateApplicationDto dto, boolean isInit) {
    String name = dto.getName();
    Application existing = applicationRepository.findByName(name);
    Locale locale = LocaleContextHolder.getLocale();

    if (isInit && existing != null) {
      return existing;
    }

    if (!isInit && existing != null) {
      String msg = messageSource.getMessage(
        "exception.applicationInfo.exists",
        new Object[]{name},
        "应用已存在",
        locale
      );
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    Application newApp = new Application(
      dto.getName(),
      dto.getDescription(),
      serializeTag(dto.getTag()),
      dto.getIcon(),
      dto.getClassify()
    );
    return applicationRepository.save(newApp);
  }

  private String serializeTag(JsonNode tag) {
    if (tag == null || tag.isNull()) {
      return null;
    }
    if (tag.isTextual()) {
      return tag.textValue();
    }
    try {
      return objectMapper.writeValueAsString(tag);
    } catch (JsonProcessingException ex) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid tag format", ex);
    }
  }
}
