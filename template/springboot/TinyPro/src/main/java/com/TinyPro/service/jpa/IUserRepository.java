package com.TinyPro.service.jpa;

import com.TinyPro.entity.po.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IUserRepository extends JpaRepository<User, Long> {
}
