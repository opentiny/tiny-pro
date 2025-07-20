package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateUserDto {

    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String name;

    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String email;

    @NotBlank(message = "{validation.NOT_EMPTY}")
    private String password;

    /** 角色 ID 列表，默认为空 */
    @NotEmpty(message = "{validation.NOT_EMPTY}")
    private List<Integer> roleIds = List.of();

    /** 可选字段 */
    private String department;
    private String employeeType;

    /** 日期字段建议用 LocalDate 或 LocalDateTime，视业务需要而定 */
    private LocalDate probationStart;
    private LocalDate probationEnd;
    private String probationDuration;

    private LocalDate protocolStart;
    private LocalDate protocolEnd;

    private String address;
    private Integer status;
}