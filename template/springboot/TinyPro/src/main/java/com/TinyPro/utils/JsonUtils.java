package com.TinyPro.utils;

import com.TinyPro.entity.dto.InitMenuDto;
import com.TinyPro.entity.po.Menu;
import com.alibaba.fastjson.JSON;

import java.awt.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

public class JsonUtils {
    public static Map<String, Map<String, String>> readJsonFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        String json = new String(Files.readAllBytes(path));
        return JSON.parseObject(json, Map.class);
    }
    public static List<InitMenuDto> readJsonFiletoMenu(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        String json = new String(Files.readAllBytes(path));
        return JSON.parseArray(json, InitMenuDto.class);
    }
}