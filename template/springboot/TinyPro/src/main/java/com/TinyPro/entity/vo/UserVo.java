package com.TinyPro.entity.vo;

import com.TinyPro.entity.po.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class UserVo {
    private Integer id;
    private String name;
    private String email;
    private String department;
    private String employeeType;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate probationStart;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate probationEnd;
    
    private String probationDuration;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate protocolStart;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate protocolEnd;
    
    private String address;
    private Integer status;
    private List<RoleSimpleVo> role;

    // 可以添加静态转换方法
    public static UserVo fromEntity(User user) {
        UserVo vo = new UserVo();
        vo.setId(user.getId());
        vo.setName(user.getName());
        vo.setEmail(user.getEmail());
        vo.setDepartment(user.getDepartment());
        vo.setEmployeeType(user.getEmployee_type());
        vo.setProbationStart(user.getProbation_start());
        vo.setProbationEnd(user.getProbation_end());
        vo.setProbationDuration(user.getProbation_duration());
        vo.setProtocolStart(user.getProtocol_start());
        vo.setProtocolEnd(user.getProtocol_end());
        vo.setAddress(user.getAddress());
        vo.setStatus(user.getStatus());
        List<RoleSimpleVo> collect = user.getRole().stream().map(item -> {
            RoleSimpleVo roleSimpleVo = new RoleSimpleVo();
            BeanUtils.copyProperties(item, roleSimpleVo);
            return roleSimpleVo;
        }).collect(Collectors.toList());
        vo.setRole(collect);
        return vo;
    }
}