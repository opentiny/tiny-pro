package com.TinyPro.service.imp;

import com.TinyPro.entity.po.FormOption;
import com.TinyPro.jpa.IFormOptionRepository;
import com.TinyPro.service.FormDemoService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class FormDemoServiceImpl implements FormDemoService {

    private static final List<String> OBJECT_OPTION_TYPES = List.of(
            "POSITION", "HR", "DEPARTMENT"
    );
    private static final List<String> STRING_OPTION_TYPES = List.of(
            "MENTOR", "DIRECTOR", "STATUS"
    );

    private final IFormOptionRepository formOptionRepository;

    public FormDemoServiceImpl(IFormOptionRepository formOptionRepository) {
        this.formOptionRepository = formOptionRepository;
    }
    @Override
    public Map<String, Object> getFormData() {
        Map<String, Object> result = new LinkedHashMap<>();
        Map<String, List<FormOption>> optionsByType = new LinkedHashMap<>();

        for (FormOption option : formOptionRepository.findByEnabledTrueOrderByOptionTypeAscSortOrderAscIdAsc()) {
            optionsByType.computeIfAbsent(option.getOptionType(), ignored -> new ArrayList<>()).add(option);
        }

        for (String type : OBJECT_OPTION_TYPES) {
            result.put(apiKey(type), toObjectOptions(optionsByType.getOrDefault(type, List.of())));
        }
        for (String type : STRING_OPTION_TYPES) {
            result.put(apiKey(type), toStringOptions(optionsByType.getOrDefault(type, List.of())));
        }
        return result;
    }

    private List<Map<String, String>> toObjectOptions(List<FormOption> options) {
        return options.stream()
                .map(option -> Map.of(
                        "value", option.getOptionValue(),
                        "label", option.getOptionLabel()))
                .toList();
    }

    private List<String> toStringOptions(List<FormOption> options) {
        return options.stream()
                .map(FormOption::getOptionValue)
                .toList();
    }

    private String apiKey(String type) {
        return switch (type) {
            case "POSITION" -> "position";
            case "HR" -> "HR";
            case "MENTOR" -> "mentor";
            case "DIRECTOR" -> "director";
            case "STATUS" -> "status";
            case "DEPARTMENT" -> "department";
            default -> throw new IllegalArgumentException("Unsupported form option type: " + type);
        };
    }
}
