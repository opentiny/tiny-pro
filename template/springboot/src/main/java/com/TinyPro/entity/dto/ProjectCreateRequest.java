package com.TinyPro.entity.dto;

import lombok.Data;

import java.util.Map;

/**
 * Project create request. The data envelope matches the NestJS project API:
 * { "data": { ...project fields } }.
 */
@Data
public class ProjectCreateRequest {

    private Map<String, Object> data;
}
