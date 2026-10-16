package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.CreateApplicationDto;
import com.TinyPro.entity.po.Application;
import com.TinyPro.jpa.ApplicationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApplicationServiceImplTest {

    @Test
    void serializesTagArrayBeforeSaving() throws Exception {
        ApplicationRepository repository = repositoryStub();
        ObjectMapper objectMapper = new ObjectMapper();
        ApplicationServiceImpl service = new ApplicationServiceImpl(repository, null, objectMapper);

        CreateApplicationDto dto = new CreateApplicationDto();
        dto.setName("Tag array application");
        dto.setTag(objectMapper.readTree("[{\"type\":\"success\",\"value\":\"dev\"}]"));

        Application saved = service.createApplication(dto, false);

        assertEquals("[{\"type\":\"success\",\"value\":\"dev\"}]", saved.getTag());
    }

    @Test
    void keepsJsonStringTagCompatible() throws Exception {
        ApplicationRepository repository = repositoryStub();
        ObjectMapper objectMapper = new ObjectMapper();
        ApplicationServiceImpl service = new ApplicationServiceImpl(repository, null, objectMapper);

        CreateApplicationDto dto = new CreateApplicationDto();
        dto.setName("String tag application");
        dto.setTag(objectMapper.readTree("\"[{\\\"type\\\":\\\"success\\\"}]\""));

        Application saved = service.createApplication(dto, false);

        assertEquals("[{\"type\":\"success\"}]", saved.getTag());
    }

    private ApplicationRepository repositoryStub() {
        return (ApplicationRepository) Proxy.newProxyInstance(
                ApplicationRepository.class.getClassLoader(),
                new Class<?>[]{ApplicationRepository.class},
                (proxy, method, args) -> {
                    if ("findByName".equals(method.getName())) {
                        return null;
                    }
                    if ("save".equals(method.getName())) {
                        return args[0];
                    }
                    return null;
                });
    }
}
