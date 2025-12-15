package com.edtech.ai.model;

import java.util.List;

/**
 * AI生成的题目VO
 */
public class GeneratedQuestionVO {
    private String stem;           // 题干
    private List<String> options;  // 选项列表 (A, B, C, D)
    private String correctAnswer;  // 正确答案 (e.g., "A")
    private String analysis;       // 解析
    private String difficulty;     // 难度标签

    // Getters
    public String getStem() { return stem; }
    public List<String> getOptions() { return options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getAnalysis() { return analysis; }
    public String getDifficulty() { return difficulty; }

    // Setters
    public void setStem(String stem) { this.stem = stem; }
    public void setOptions(List<String> options) { this.options = options; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setAnalysis(String analysis) { this.analysis = analysis; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}
