package com.TinyPro.entity.page;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageWrapper<T> {
    private List<T> items;      // 当前页数据
    private Meta    meta;
    public static <T> PageWrapper<T> of(Page<T> springPage) {
        return new PageWrapper<>(
                springPage.getContent(),
                new Meta(
                        springPage.getTotalElements(),
                        springPage.getNumberOfElements(),
                        springPage.getSize(),
                        springPage.getTotalPages(),
                        springPage.getNumber() + 1   // 从 0 → 1
                )
        );
    }
}