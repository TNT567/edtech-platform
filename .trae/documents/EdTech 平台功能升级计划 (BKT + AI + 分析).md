# EdTech 平台核心功能升级计划

## 1. 🧠 知识状态追踪 (BKT 算法升级)

目前系统使用的是 **Elo 评分 (IRT 变体)**，我们需要将其替换为标准的 **BKT (贝叶斯知识追踪)** 模型。

### 1.1 数据模型扩展

* **KnowledgePoint 表**：新增 BKT 参数列 `P(L0)` (初始掌握率), `P(T)` (学习转移率), `P(G)` (猜对率), `P(S)` (失误率)。

* **默认参数策略**：为简化初期冷启动，设置默认值：`L0=0.1`, `T=0.1`, `G=0.2`, `S=0.1`。

### 1.2 算法实现 (`KnowledgeTracingService`)

* 废弃现有的 Elo 计算逻辑。

* 实现 BKT 核心公式：

  1. **后验概率更新**: 根据答题结果 (0/1) 和 G/S 参数，计算 $P(L\_t | Result)$。
  2. **状态转移**: 计算下一时刻掌握率 $P(L\_{t+1}) = P(L\_t | Result) + (1 - P(L\_t | Result)) \times P(T)$。

* **双层存储策略**：

  * **L1 (Redis)**: `Map<StudentId, Map<KpId, Probability>>`，实现 O(1) 读写。

  * **L2 (MySQL)**: 异步或定时回写 `knowledge_state` 表，保证数据持久化。

## 2. 🤖 个性化内容生成 (接入 Qwen-Plus)

### 2.1 基础设施配置

* **Spring AI 配置**：配置 `spring-ai-alibaba` 或通用 OpenAI 兼容客户端适配 **Qwen-Plus**。

* **API Key 管理**：将您的 Key 安全配置在 `application.yml` 或环境变量中。

### 2.2 功能实现 (`ContentGenerationService`)

* **智能出题**：

  * 输入：知识点 + 当前 BKT 掌握度。

  * Prompt 优化：要求输出标准 JSON 格式（题干、选项、正确答案、解析），支持 LaTeX。

* **智能讲解**：

  * 新增接口 `/ai/explain`。

  * 输入：错题内容 + 学生错误选项。

  * Prompt 策略：要求 AI 扮演耐心老师，分步推导，并生成一道相似的简单例题。

* **推荐引擎**：

  * 基于知识图谱（父子/前后继关系）+ BKT 概率（<0.6 阈值）生成推荐列表。

## 3. 📊 学习分析与预测

### 3.1 智能错题本 (`MistakeBookService`)

* **自动归纳**：监听答题事件，`Result=0` 时自动写入/更新 `mistake_book` 表，记录 `error_count`。

* **归因分析**：关联知识点，统计高频错误点。

### 3.2 成绩预测 (`PredictionService`)

* **线性回归模型 (简易版)**：

  * 公式：`Predicted_Score = α * Avg_Mastery + β * Practice_Count + ε`

  * 实现：统计学生所有知识点的 BKT 概率加权平均值，映射到 0-100 分制。

### 3.3 成长报告 (`ReportService`)

* **数据聚合**：聚合最近 7 天的 `StudentExerciseLog`。

* **可视化数据**：生成“能力雷达图”（基于 BKT）和“进步趋势图”（每日掌握度均值变化）。

## 执行步骤

1. **后端 - BKT 核心**: 修改 `KnowledgePoint` 实体，重写 `KnowledgeTracingService`。
2. **后端 - AI 接入**: 配置 Qwen-Plus，实现出题与讲解接口。
3. **后端 - 分析模块**: 实现错题本逻辑与成绩预测接口。
4. **前端 - 对接**: 升级刷题页面支持 AI 解析，完善仪表盘展示预测分。

