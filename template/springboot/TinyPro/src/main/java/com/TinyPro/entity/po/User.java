package com.TinyPro.entity.po;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import jakarta.persistence.*;


import java.security.SecureRandom;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private String email;
    private String password;
    @ManyToMany
    @JoinTable(
            name = "user_role",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> role;
    private String department;
    private String employeeType;
    private Timestamp probationStart;
    private Timestamp probationEnd;
    private String probationDuration;
    private Timestamp protocolStart;
    private Timestamp protocolEnd;
    private String address;
    private Integer status;
    @Column(name = "create_time")
    @TableField("`create_time`")
    private Date createTime;
    @Column(name = "update_time")
    @TableField("`update_time`")
    private Date updateTime;
    @Column(insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp create_time;
    private String salt;
    @Column(insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private Timestamp update_time;

    @PrePersist
    public void beforeInsert() {
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[4];
        random.nextBytes(saltBytes);
        this.salt = Base64.getEncoder().encodeToString(saltBytes);
        this.password = encry(this.password, this.salt);
    }

    public static String encry(String value, String salt) {
        // Java 实现加密逻辑，这里简化示例
        return value + salt;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Role> getRole() {
        return role;
    }

    public void setRole(List<Role> role) {
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmployeeType() {
        return employeeType;
    }

    public void setEmployeeType(String employeeType) {
        this.employeeType = employeeType;
    }

    public Timestamp getProbationStart() {
        return probationStart;
    }

    public void setProbationStart(Timestamp probationStart) {
        this.probationStart = probationStart;
    }

    public Timestamp getProbationEnd() {
        return probationEnd;
    }

    public void setProbationEnd(Timestamp probationEnd) {
        this.probationEnd = probationEnd;
    }

    public String getProbationDuration() {
        return probationDuration;
    }

    public void setProbationDuration(String probationDuration) {
        this.probationDuration = probationDuration;
    }

    public Timestamp getProtocolStart() {
        return protocolStart;
    }

    public void setProtocolStart(Timestamp protocolStart) {
        this.protocolStart = protocolStart;
    }

    public Timestamp getProtocolEnd() {
        return protocolEnd;
    }

    public void setProtocolEnd(Timestamp protocolEnd) {
        this.protocolEnd = protocolEnd;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public Timestamp getCreate_time() {
        return create_time;
    }

    public void setCreate_time(Timestamp create_time) {
        this.create_time = create_time;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public Timestamp getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(Timestamp update_time) {
        this.update_time = update_time;
    }
}