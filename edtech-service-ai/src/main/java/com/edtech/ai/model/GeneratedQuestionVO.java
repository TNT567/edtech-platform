package com.edtech.ai.model;

import lombok.Data;
import java.util.List;

@Data
public class GeneratedQuestionVO {
    private String stem;           // 题干
    private List<String> options;  // 选项列表 (A, B, C, D)
    private String correctAnswer;  // 正确答案 (e.g., "A")
    private String analysis;       // 解析
    private String difficulty;     // 难度标签
}
