package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.TableField;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "user")
@DynamicUpdate
@EntityListeners(AuditingEntityListener.class)   // 自动填充创建/更新时间
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;
    private String password;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<Role> role;

    private String department;

    private String employee_type;

    private LocalDate probation_start;
    private LocalDate  probation_end;
    private String probation_duration;

    private LocalDate  protocol_start;
    private LocalDate  protocol_end;

    private String address;
    private Integer status;

    @CreatedDate
    @Column(name = "createTime", updatable = false)
    private LocalDate createTime;
    @CreatedDate
    @Column(name = "create_time", updatable = false)
    private LocalDate create_time;
    @LastModifiedDate
    @Column(name = "updateTime")
    private LocalDate updateTime;
    @LastModifiedDate
    @Column(name = "update_time")
    private LocalDate update_time;

    /* 密码盐 */
    @Column(name = "salt", length = 64)
    private String salt;

    /* 加密钩子 */
    @PrePersist
    public void onCreate() {
        // 这里调用加密工具给 password 加盐
    }
}