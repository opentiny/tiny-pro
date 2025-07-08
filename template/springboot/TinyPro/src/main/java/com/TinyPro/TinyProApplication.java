package com.TinyPro;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@MapperScan(basePackages = {"com.TinyPro.mappers"})
@EntityScan(basePackages = "com.TinyPro.entity.po")
public class TinyProApplication {
    public static void main(String[] args) {
        SpringApplication.run(TinyProApplication.class,args);
    }
}
