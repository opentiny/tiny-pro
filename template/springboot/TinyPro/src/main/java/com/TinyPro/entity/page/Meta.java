package com.TinyPro.entity.page;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Meta {
    private long totalItems;    // 总条数
    private int itemCount;     // 当前页条数
    private int itemsPerPage;  // 每页条数
    private int totalPages;    // 总页数
    private int currentPage;   // 当前页号（从 1 开始）
}