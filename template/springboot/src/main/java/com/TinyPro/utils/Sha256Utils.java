package com.TinyPro.utils;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.spec.KeySpec;
import java.util.Base64;

public class Sha256Utils {
    public static String encry(String value, String salt) throws Exception {
        // 定义 PBKDF2 的参数
        int iterations = 1000; // 迭代次数
        int keyLength = 18; // 输出密钥的长度（以字节为单位）

        // 创建 PBEKeySpec 对象
        KeySpec spec = new PBEKeySpec(value.toCharArray(), salt.getBytes(), iterations, keyLength * 8);

        // 获取 SecretKeyFactory 实例
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");

        // 生成密钥
        byte[] hashedPassword = factory.generateSecret(spec).getEncoded();

        // 将字节数组转换为 Base64 编码的字符串
        return Base64.getEncoder().encodeToString(hashedPassword);
    }
}
