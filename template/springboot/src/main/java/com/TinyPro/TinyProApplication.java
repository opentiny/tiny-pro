package com.TinyPro;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {"com.TinyPro"})
@ConfigurationPropertiesScan(basePackages = "com.TinyPro")
@EntityScan(basePackages = "com.TinyPro.entity.po")
@EnableJpaAuditing
public class TinyProApplication {
    public static void main(String[] args) {
        SpringApplication.run(TinyProApplication.class,args);
    }
}
