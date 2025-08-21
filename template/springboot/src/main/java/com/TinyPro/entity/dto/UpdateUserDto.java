package com.TinyPro.entity.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.ArrayList;
import java.util.List;

@Data
@Accessors(chain = true)
public class UpdateUserDto {
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String oldPassword;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String newPassword;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String email;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private List<Long> roleIds = new ArrayList<>();
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String department;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String employeeType;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String probationStart;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String probationEnd;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String probationDuration;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String protocolStart;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String protocolEnd;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String address;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private Integer status;
    
    @NotEmpty(message = "{NOT_EMPTY}")
    private String name;
}