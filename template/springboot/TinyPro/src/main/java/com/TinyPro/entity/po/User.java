package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.TableField;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Entity
@Table(name = "user")
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
    @TableField(select = false)
    private List<Role> role;

    private String department;
    private String employeeType;

    private LocalDateTime probationStart;
    private LocalDateTime probationEnd;
    private String probationDuration;

    private LocalDateTime protocolStart;
    private LocalDateTime protocolEnd;

    private String address;
    private Integer status;

    @CreatedDate
    @Column(name = "createTime", updatable = false)
    private LocalDateTime createTime;
    @Column(name = "create_time", updatable = false)
    private LocalDateTime create_time;
    @LastModifiedDate
    @Column(name = "updateTime")
    private LocalDateTime updateTime;
    @Column(name = "update_time")
    private LocalDateTime update_time;

    /* 密码盐 */
    @Column(name = "salt", length = 64)
    private String salt;

    /* 加密钩子 */
    @PrePersist
    public void onCreate() {
        // 这里调用加密工具给 password 加盐
    }
}