package com.TinyPro.entity.dto;

import com.TinyPro.entity.po.Menu;
import lombok.Data;

import java.util.List;
@Data
public class InitMenuDto extends Menu {
    private List<InitMenuDto> children;
}
