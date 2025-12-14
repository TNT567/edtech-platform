# Spring Boot + AI 知识追踪平台架构规划

作为架构师，我为您设计了基于 **模块化单体 (Modular Monolith)** 的架构。这种架构在初期开发效率最高，且结构清晰，未来可以零成本拆分为 Spring Cloud 微服务。

## 1. Maven 多模块项目结构 (Multi-module Structure)

项目根目录 `edtech-platform` 将包含以下模块：

```text
edtech-platform (Root POM)
├── edtech-common           # 公共模块：工具类(Utils)、全局异常、通用响应对象(Result)
├── edtech-model            # 数据模型：MyBatis-Plus Entity, DTO, VO
├── edtech-service-kt       # 核心模块A：知识追踪服务 (DKT逻辑, 状态计算)
├── edtech-service-ai       # 核心模块B：AI推荐服务 (Spring AI集成, 路径规划)
├── edtech-service-core     # 核心模块C：业务服务 (用户, 错题本, 报表, RabbitMQ消费者)
└── edtech-web              # 启动模块：Controller层, 聚合所有服务, 配置文件
```

## 2. 核心依赖 (pom.xml)

我们将使用 **Spring Boot 3.2.x** 和 **JDK 17+**。

### 父工程 (Root) 管理版本

* **Spring Boot:** `3.2.4`

* **Spring AI:** `0.8.1` (或最新 Snapshot)

* **MyBatis-Plus:** `3.5.5`

* **Cloud (可选):** Spring Cloud 2023.0.0 (仅在 dependencyManagement 中声明，备用)

### 核心依赖列表

1. **Web & 基础:** `spring-boot-starter-web`, `spring-boot-starter-aop`, `lombok`
2. **数据存储:**

   * `mybatis-plus-boot-starter` (ORM)

   * `mysql-connector-j` (驱动)

   * `spring-boot-starter-data-redis` (缓存/状态存储)
3. **消息队列:** `spring-boot-starter-amqp` (RabbitMQ)
4. **AI 能力:** `spring-ai-openai-spring-boot-starter` (连接 LLM)
5. **工具:** `hutool-all` (通用工具), `fastjson2` (序列化)

## 3. 核心数据库表设计 (ER概念)

### A. 题库与知识点 (基础数据)

* **`knowledge_concept`** **(知识点表)**

  * `id`: BIGINT (PK)

  * `name`: VARCHAR (知识点名称, 如 "二次函数")

  * `code`: VARCHAR (编码)

  * `parent_id`: BIGINT (父级ID，构建知识图谱树)

* **`question`** **(题目表)**

  * `id`: BIGINT (PK)

  * `content`: TEXT (题目题干，支持 Markdown/LaTeX)

  * `type`: INT (1:单选, 2:填空, 3:简答)

  * `difficulty`: DOUBLE (0.0-1.0 难度系数)

  * `correct_answer`: TEXT (标准答案)

  * `analysis`: TEXT (解析)

* **`question_concept_rel`** **(题目-知识点关联)**

  * `question_id`: BIGINT

  * `concept_id`: BIGINT

  * *说明: 一道题可能对应多个知识点*

### B. 学习记录与状态 (动态数据)

* **`exercise_log`** **(练习记录表 - DKT输入)**

  * `id`: BIGINT (PK)

  * `user_id`: BIGINT (学生ID)

  * `question_id`: BIGINT (题目ID)

  * `is_correct`: TINYINT (0:错, 1:对)

  * `cost_time`: INT (耗时，秒)

  * `answer_content`: TEXT (学生提交的答案)

  * `created_at`: DATETIME (答题时间)

* **`student_knowledge_state`** **(知识状态表 - DKT输出)**

  * `id`: BIGINT (PK)

  * `user_id`: BIGINT (索引)

  * `concept_id`: BIGINT (知识点ID)

  * `proficiency`: DECIMAL(5,4) (掌握概率 0.0000 - 1.0000)

  * `stability`: DECIMAL (可选：记忆稳定性/遗忘曲线参数)

  * `update_source`: VARCHAR (更新来源: "DKT\_MODEL", "MANUAL")

  * `updated_at`: DATETIME

### C. 业务与推荐

* **`mistake_book`** **(智能错题本)**

  * `id`, `user_id`, `question_id`, `error_count`, `mastered_status` (是否已消灭)

* **`learning_path`** **(个性化路径)**

  * `id`, `user_id`, `concept_list` (JSON, 推荐的学习顺序), `generated_reason` (AI生成的推荐理由)

## 执行步骤

确认计划后，我将按以下顺序执行：

1. **创建项目骨架**：初始化 Maven 多模块结构。
2. **配置基础设施**：编写 `pom.xml` 引入依赖。
3. **数据库建模**：创建 SQL 脚本并初始化 MySQL 表结构。

