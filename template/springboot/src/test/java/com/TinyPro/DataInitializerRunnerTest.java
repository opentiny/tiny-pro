package com.TinyPro;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.po.Role;
import com.TinyPro.jpa.ApplicationRepository;
import com.TinyPro.jpa.I18Repository;
import com.TinyPro.jpa.IMenuRepository;
import com.TinyPro.jpa.IPermissionRepository;
import com.TinyPro.jpa.IRoleRepository;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.jpa.LangRepository;
import com.TinyPro.redis.RedisLockService;
import com.TinyPro.redis.RedisUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.function.Supplier;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerRunnerTest {

    @Mock
    private RedisLockService redisLockService;
    @Mock
    private RedisUtil redisUtil;
    @Mock
    private IUserRepository userRepository;
    @Mock
    private IRoleRepository roleRepository;
    @Mock
    private IPermissionRepository permissionRepository;
    @Mock
    private IMenuRepository menuRepository;
    @Mock
    private LangRepository langRepository;
    @Mock
    private I18Repository i18Repository;
    @Mock
    private ApplicationRepository applicationRepository;

    private DataInitializer initializer;

    @BeforeEach
    void setUp() {
        initializer = new DataInitializer();
        ReflectionTestUtils.setField(initializer, "redisLockService", redisLockService);
        ReflectionTestUtils.setField(initializer, "redisUtil", redisUtil);
        ReflectionTestUtils.setField(initializer, "userRepository", userRepository);
        ReflectionTestUtils.setField(initializer, "roleRepository", roleRepository);
        ReflectionTestUtils.setField(initializer, "permissionRepository", permissionRepository);
        ReflectionTestUtils.setField(initializer, "menuRepository", menuRepository);
        ReflectionTestUtils.setField(initializer, "langRepository", langRepository);
        ReflectionTestUtils.setField(initializer, "i18Repository", i18Repository);
        ReflectionTestUtils.setField(initializer, "applicationRepository", applicationRepository);

        doAnswer(invocation -> ((Supplier<?>) invocation.getArgument(3)).get())
                .when(redisLockService)
                .execute(eq("install"), anyLong(), anyLong(), any());

        when(redisUtil.exists(Contants.INSTALL_FLAG)).thenReturn(true);
        when(permissionRepository.existsByName(Contants.ADMIN_SUPE_POWER)).thenReturn(true);
        when(roleRepository.findFirstByNameOrderByIdAsc(Contants.ADMIN))
                .thenReturn(Optional.of(new Role()));
        when(menuRepository.count()).thenReturn(1L);
        when(langRepository.count()).thenReturn(1L);
        when(i18Repository.count()).thenReturn(1L);
        when(applicationRepository.count()).thenReturn(1L);
    }

    // 已完成初始化且数据库中存在其他用户时，补种流程不能重新创建默认管理员。
    @Test
    void doesNotRecreateDefaultAdminWhenAnotherUserExists() throws Exception {
        lenient().when(userRepository.count()).thenReturn(1L);

        initializer.run();

        verify(userRepository, never()).saveAndFlush(any());
    }

    // 默认管理员被主动删除且没有其他用户时，后续启动也不能凭空恢复固定账号。
    @Test
    void doesNotRecreateDefaultAdminAfterItWasIntentionallyDeleted() throws Exception {
        lenient().when(userRepository.count()).thenReturn(0L);

        initializer.run();

        verify(userRepository, never()).saveAndFlush(any());
    }
}
