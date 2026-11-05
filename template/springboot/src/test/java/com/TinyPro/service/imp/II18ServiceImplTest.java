package com.TinyPro.service.imp;

import com.TinyPro.jpa.I18Repository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class II18ServiceImplTest {

    @Mock
    private I18Repository i18Repository;

    private II18ServiceImpl i18Service;

    @BeforeEach
    void setUp() {
        i18Service = new II18ServiceImpl();
        ReflectionTestUtils.setField(i18Service, "i18Repository", i18Repository);
    }

    @Test
    void validPaginationTakesPrecedenceOverAllRequest() {
        stubEmptyPage();

        i18Service.findAll(1, 10, true, null, null, null);

        Pageable pageable = capturedPageable();
        assertTrue(pageable.isPaged());
        assertEquals(0, pageable.getPageNumber());
        assertEquals(10, pageable.getPageSize());
    }

    @Test
    void allRequestReturnsUnpagedResultWhenLimitIsInvalid() {
        stubEmptyPage();

        i18Service.findAll(1, 0, true, null, null, null);

        assertFalse(capturedPageable().isPaged());
    }

    private void stubEmptyPage() {
        when(i18Repository.findAll(any(Specification.class), any(Pageable.class)))
                .thenAnswer(invocation -> Page.empty(invocation.getArgument(1)));
    }

    private Pageable capturedPageable() {
        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(i18Repository).findAll(any(Specification.class), captor.capture());
        return captor.getValue();
    }
}
