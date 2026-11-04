package com.TinyPro.service.imp;

import com.TinyPro.entity.dto.UpdateMenuDto;
import com.TinyPro.entity.po.Menu;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.jpa.IMenuRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IMenuServiceImplTest {

    @Mock
    private IMenuRepository menuRepository;

    @InjectMocks
    private IMenuServiceImpl menuService;

    @Test
    void rejectsAnUpdateThatMatchesAnotherMenuIdentity() {
        Menu current = menu(1);
        Menu conflicting = menu(2);
        UpdateMenuDto update = update(1);

        when(menuRepository.findById(1L)).thenReturn(Optional.of(current));
        when(menuRepository.findByMenuIdentity(
                update.getName(), update.getOrder(), update.getMenuType(), update.getParentId(),
                update.getPath(), update.getIcon(), update.getComponent(), update.getLocale()))
                .thenReturn(List.of(conflicting));

        BusinessException exception = assertThrows(BusinessException.class,
                () -> menuService.updateMenu(update));

        assertEquals("exception.menu.exists", exception.getErrorCode());
        verify(menuRepository, never()).saveAndFlush(any(Menu.class));
    }

    @Test
    void allowsAnUpdateWhenTheIdentityMatchIsTheSameMenu() {
        Menu current = menu(1);
        UpdateMenuDto update = update(1);

        when(menuRepository.findById(1L)).thenReturn(Optional.of(current));
        when(menuRepository.findByMenuIdentity(
                update.getName(), update.getOrder(), update.getMenuType(), update.getParentId(),
                update.getPath(), update.getIcon(), update.getComponent(), update.getLocale()))
                .thenReturn(List.of(current));
        when(menuRepository.saveAndFlush(current)).thenReturn(current);

        ResponseEntity<Boolean> response = menuService.updateMenu(update);

        assertEquals(Boolean.TRUE, response.getBody());
        verify(menuRepository).saveAndFlush(current);
    }

    private Menu menu(int id) {
        Menu menu = new Menu();
        menu.setId(id);
        return menu;
    }

    private UpdateMenuDto update(int id) {
        UpdateMenuDto update = new UpdateMenuDto();
        update.setId(id);
        update.setName("Dashboard");
        update.setOrder(1);
        update.setMenuType("MENU");
        update.setParentId(null);
        update.setPath("/dashboard");
        update.setIcon("icon-dashboard");
        update.setComponent("DashboardComponent");
        update.setLocale("zh_CN");
        return update;
    }
}
