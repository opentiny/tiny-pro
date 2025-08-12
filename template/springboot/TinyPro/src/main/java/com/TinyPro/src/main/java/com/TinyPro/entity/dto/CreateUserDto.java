package com.TinyPro.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class CreateUserDto {
    @NotEmpty(message = "{NOT_EMPTY}")
    private String name;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    @Email
    private String email;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String password;
    
    private List<Long> roleIds = new ArrayList<>();
    
    private String department;
    
    private String employeeType;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String probationStart;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String probationEnd;
    private String probationDuration;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String protocolStart;
    @NotEmpty(message = "{NOT_EMPTY}")
    private String protocolEnd;
    
    private String address;
    
    private Integer status;
}