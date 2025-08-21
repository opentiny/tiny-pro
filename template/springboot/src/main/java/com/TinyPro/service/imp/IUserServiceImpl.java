package com.TinyPro.service.imp;

import com.TinyPro.entity.contants.Contants;
import com.TinyPro.entity.dto.*;
import com.TinyPro.entity.page.PageWrapper;
import com.TinyPro.entity.po.I18;
import com.TinyPro.entity.po.Permission;
import com.TinyPro.entity.po.Role;
import com.TinyPro.entity.po.User;
import com.TinyPro.entity.vo.RoleSimpleVo;
import com.TinyPro.entity.vo.UserVo;
import com.TinyPro.exception.BusinessException;
import com.TinyPro.redis.RedisUtil;
import com.TinyPro.service.IAuthService;
import com.TinyPro.service.IUserService;
import com.TinyPro.jpa.IRoleRepository;
import com.TinyPro.jpa.IUserRepository;
import com.TinyPro.utils.Sha256Utils;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IUserServiceImpl implements IUserService {
    @Autowired
    private IUserRepository iUserRepository;
    @Autowired
    private IRoleRepository iRoleRepository;
    @Autowired
    private RedisUtil redisUtil;
    @Autowired
    private IAuthService authService;

    @Transactional
    @Override
    public ResponseEntity<UserVo> create(CreateUserDto createUserDto, boolean isInit) {
        // 1. 检查用户是否已存在
        Optional<User> existingUser = iUserRepository.findByEmail(createUserDto.getEmail());

        if (isInit && existingUser.isPresent()) {
            return ResponseEntity.ok(UserVo.fromEntity(existingUser.get()));
        }

        if (!existingUser.isEmpty()) {
            throw new BusinessException("exception.user.userExists", HttpStatus.BAD_REQUEST, null);
        }

        // 2. 获取关联角色
        List<Role> roles = iRoleRepository.findAllById(createUserDto.getRoleIds());

        // 3. 创建并保存用户
        try {
            User user = new User();
            user.setEmail(createUserDto.getEmail());
            user.setPassword(Sha256Utils.encry(createUserDto.getPassword(), Contants.PUBLICK_SALT));
            user.setName(createUserDto.getName());
            user.setRole(roles);
            user.setSalt(Contants.PUBLICK_SALT);
            user.setDepartment(createUserDto.getDepartment());
            user.setEmployee_type(createUserDto.getEmployeeType());
            if (StringUtils.isNotEmpty(createUserDto.getProbationStart())) {
                user.setProbation_start(toStandardDateFormat(createUserDto.getProbationStart()));
            }
            if (StringUtils.isNotEmpty(createUserDto.getProbationEnd())) {
                user.setProbation_end(toStandardDateFormat(createUserDto.getProbationEnd()));
            }
            user.setProbation_duration(createUserDto.getProbationDuration());
            if (StringUtils.isNotEmpty(createUserDto.getProtocolStart())) {
                user.setProtocol_start(toStandardDateFormat(createUserDto.getProtocolStart()));
            }
            if (StringUtils.isNotEmpty(createUserDto.getProtocolEnd())) {
                user.setProtocol_end(toStandardDateFormat(createUserDto.getProtocolEnd()));
            }
            user.setAddress(createUserDto.getAddress());
            user.setStatus(createUserDto.getStatus());

            return ResponseEntity.ok(UserVo.fromEntity(iUserRepository.save(user)));
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage()
            );
        }
    }

    @Override
    public List<Permission> getRoleByUserId(User user) {
        Optional<User> userOpt = iUserRepository.findByIdWithRoles(user.getId());
        User result = userOpt.get();
        List<Permission> resultList = new ArrayList<>();
        result.getRole()
                .stream()
                .map(item -> {
                    Set<Permission> permission = item.getPermission();
                    resultList.addAll(permission.stream().toList());
                    return item;
                })
                .collect(Collectors.toList());
        return resultList;
    }

    @Override
    public ResponseEntity<User> getUserInfo(String email) {
        Optional<User> byEmail = iUserRepository.findByEmail(email);
        if (byEmail.isEmpty()) {
            throw new BusinessException("exception.common.unauth");
        }
        User user = byEmail.get();
        return ResponseEntity.ok(user);
    }

    @Override
    @Transactional
    public ResponseEntity<UserVo> removeUserInfo(String email) {
        Optional<User> byEmail = iUserRepository.findByEmail(email);
        if (byEmail.isEmpty()) {
            throw new BusinessException("exception.user.userNumberNull");
        }
        iUserRepository.delete(byEmail.get());
        User user = byEmail.get();
        UserVo result = UserVo.fromEntity(user);

        return ResponseEntity.ok(result);
    }

    @Override
    @Transactional
    public ResponseEntity<UserVo> updateUserInfo(UpdateUserDto updateUserDto) {
        // 1. 获取用户信息并加载角色关联
        User user = iUserRepository.findByEmail(updateUserDto.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));

        // 2. 获取原有角色ID字符串（用于比较）
        String originalRoleIds = user.getRole().stream()
                .map(role -> role.getId().toString())
                .collect(Collectors.joining());

        // 3. 获取新角色
        List<Role> newRoles = iRoleRepository.findAllById(updateUserDto.getRoleIds());
        // 转换为 RoleSimpleVo 列表
        List<RoleSimpleVo> roleSimpleVos = newRoles.stream()
                .map(RoleSimpleVo::fromEntity)
                .collect(Collectors.toList());
        // 4. 更新用户信息
        user.setName(updateUserDto.getName());
        user.setDepartment(updateUserDto.getDepartment());
        user.setEmployee_type(updateUserDto.getEmployeeType());
        if (!StringUtils.equals(updateUserDto.getProbationStart(), "NaN-NaN-NaN") && StringUtils.isNotEmpty(updateUserDto.getProbationStart())) {
            user.setProbation_start(toStandardDateFormat(updateUserDto.getProbationStart()));
        }
        if (!StringUtils.equals(updateUserDto.getProbationEnd(), "NaN-NaN-NaN") && StringUtils.isNotEmpty(updateUserDto.getProbationEnd())) {
            user.setProbation_end(toStandardDateFormat(updateUserDto.getProbationEnd()));
        }
        user.setProbation_duration(updateUserDto.getProbationDuration());
        if (!StringUtils.equals(updateUserDto.getProtocolStart(), "NaN-NaN-NaN") && StringUtils.isNotEmpty(updateUserDto.getProtocolStart()) && !StringUtils.equals(updateUserDto.getProtocolStart(), "NaN-NaN-NaN")) {
            user.setProtocol_start(toStandardDateFormat(updateUserDto.getProtocolStart()));
        }
        if (!StringUtils.equals(updateUserDto.getProtocolEnd(), "NaN-NaN-NaN") && StringUtils.isNotEmpty(updateUserDto.getProtocolEnd())) {
            user.setProtocol_end(toStandardDateFormat(updateUserDto.getProtocolEnd()));
        }
        user.setAddress(updateUserDto.getAddress());
        user.setStatus(updateUserDto.getStatus());
        user.setRole(newRoles);

        // 5. 保存用户
        User updatedUser = iUserRepository.save(user);
        UserVo result = UserVo.fromEntity(updatedUser);

        // 6. 检查角色是否变更，若变更则踢出用户
        String newRoleIds = updateUserDto.getRoleIds().stream()
                .map(Object::toString)
                .collect(Collectors.joining());

        if (!originalRoleIds.equals(newRoleIds)) {
            authService.logout(updateUserDto.getEmail());
        }

        return ResponseEntity.ok(result);
    }

    @Override
    public PageWrapper<UserVo> getAllUser(PaginationQueryDto paginationQuery, String name, Integer[] role, String email) {
        // 1. 构建分页参数
        Pageable pageable = PageRequest.of(
                paginationQuery.getPage() - 1, // Spring Data 页码从0开始
                paginationQuery.getLimit(),
                Sort.by("id").ascending()
        );


        Specification<User> spec = (Root<User> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 名称模糊查询，支持不同的匹配模式
            if (StringUtils.isNoneBlank(name)) {
                Predicate namePredicate = buildLikePredicate(root, cb, "name", name);
                predicates.add(namePredicate);
            }

            // 2. 角色ID数组查询
            if (role != null && role.length > 0) {
                Join<User, Role> roleJoin = root.join("role", JoinType.INNER);
                predicates.add(roleJoin.get("id").in((Object[]) role));
            }

            // 3. 邮箱模糊查询，支持不同的匹配模式
            if (StringUtils.isNoneBlank(email)) {
                Predicate emailPredicate = buildLikePredicate(root, cb, "email", email);
                predicates.add(emailPredicate);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 3. 执行查询
        Page<User> page = iUserRepository.findAll(spec, pageable);

        // 4. 处理日期格式化（如果需要）
        page.getContent().forEach(user -> {
            user.setProbation_start(user.getProbation_start());
            user.setProbation_end(user.getProbation_end());
            user.setProtocol_start(user.getProtocol_start());
            user.setProtocol_end(user.getProtocol_end());
        });
        Page<UserVo> result = convertToUserVoPage(page);

        return PageWrapper.of(result);
    }

    @Override
    public ResponseEntity<?> updatePwdAdmin(UpdatePwdAdminDto dto) {
        // 1. 查询用户
        Optional<User> userOpt = iUserRepository.findByEmail(dto.getEmail()); // 使用投影只查询必要字段

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            // 2. 更新密码
            String encryptedPwd = encryptPassword(dto.getNewPassword(), user.getSalt());
            user.setPassword(encryptedPwd);
            iUserRepository.save(user);

            // 3. 强制登出该用户
            redisUtil.deleteValue(Contants.UserJwtTop + user.getEmail() + Contants.UserJwtbt);
        } else {
            throw new BusinessException("用户不存在");
        }
        return ResponseEntity.ok(null);
    }

    @Override
    public void updatePwdUser(UpdatePwdUserDto dto) {
        // 1. 查询用户（使用投影只获取必要字段）
        User user = iUserRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("exception.user.notFound"));

        // 2. 验证旧密码
        if (!verifyPassword(dto.getOldPassword(), user.getPassword(), user.getSalt())) {
            throw new BusinessException("exception.user.oldPasswordError");
        }

        // 3. 更新密码
        String encryptedPwd = encryptPassword(dto.getNewPassword(), user.getSalt());
        user.setPassword(encryptedPwd);
        iUserRepository.save(user);

        // 4. 删除redis的信息
        redisUtil.deleteValue(Contants.UserJwtTop + user.getEmail() + Contants.UserJwtbt);
    }

    @Override
    @Transactional
    public ResponseEntity<List<UserVo>> batchDeleteUser(List<String> emails) {
        List<UserVo> result = new ArrayList<>();
        iUserRepository.finByEmailBatch(emails).stream().map(item -> {
            UserVo userVo = new UserVo();
            BeanUtils.copyProperties(item, userVo);
            result.add(userVo);
            return item;
        }).collect(Collectors.toList());
        iUserRepository.deleteByEmailIn(emails);
        return ResponseEntity.ok(result);
    }

    private boolean verifyPassword(String inputPassword, String storedPassword, String salt) {
        String encryptedInput = encryptPassword(inputPassword, salt);
        return encryptedInput.equals(storedPassword);
    }

    private String encryptPassword(String rawPassword, String salt) {
        // 实现与TypeScript相同的加密逻辑
        try {
            return Sha256Utils.encry(rawPassword, salt);
        } catch (Exception e) {
            throw new BusinessException("加密错误");
        }
    }

    private LocalDate toStandardDateFormat(String dateTime) {
        // 支持宽松解析（单数字或双数字的月/日）
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-M-d");
        return LocalDate.parse(dateTime, formatter);
    }

    private Page<UserVo> convertToUserVoPage(Page<User> userPage) {
        // 将Page<User>的内容转换为List<UserVo>
        List<UserVo> userVoList = userPage.getContent()
                .stream()
                .map(UserVo::fromEntity) // 使用静态方法转换
                .collect(Collectors.toList());

        // 创建新的Page<UserVo>对象
        return new PageImpl<>(
                userVoList,               // 转换后的内容
                userPage.getPageable(),   // 保持原有的分页信息
                userPage.getTotalElements() // 总记录数
        );
    }
    private Predicate buildLikePredicate(Root<User> root, CriteriaBuilder cb, String field, String input) {
        if (input.contains("%")) {
            if (input.startsWith("%") && input.endsWith("%")) {
                // 包含匹配 LIKE '%value%'
                String value = input.substring(1, input.length() - 1);
                return cb.like(root.get(field), "%" + value + "%");
            } else if (input.startsWith("%")) {
                // 后缀匹配 LIKE '%value'
                String value = input.substring(1);
                return cb.like(root.get(field), "%" + value);
            } else if (input.endsWith("%")) {
                // 前缀匹配 LIKE 'value%'
                String value = input.substring(0, input.length() - 1);
                return cb.like(root.get(field), value + "%");
            } else {
                // 如果包含 % 但不以 % 开头或结尾，可以根据需求处理
                // 这里简单地将所有 % 视为通配符，您可以根据需要调整
                return cb.like(root.get(field), input);
            }
        } else {
            // 精确匹配 =
            return cb.equal(root.get(field), input);
        }
    }
}
