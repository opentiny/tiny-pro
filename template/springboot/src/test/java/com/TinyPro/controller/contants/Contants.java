package com.TinyPro.controller.contants;

import com.TinyPro.utils.JwtUtil;

public class Contants {
    private static JwtUtil jwtUtil = new JwtUtil("0Zi4SA==");
    static {
         String token  = jwtUtil.generateJwt("admin@no-reply.com",999 * 365 * 24 * 60 * 60);
    }
    public final static  String TOKEN = "1ZHA_8oEAOkna5Sdm9Z_OIFEfwzq4kU";
}

