# 🎓 EdTech Platform - 个性化智能辅导平台

基于 Spring Boot 和 React 构建的下一代在线教育平台，融合了 **贝叶斯知识追踪 (BKT)** 算法与 **大语言模型 (LLM)**，为学生提供千人千面的个性化学习体验。

## ✨ 核心功能

### 1. 🧠 知识状态追踪 (Knowledge Tracing)
- **核心算法**: 采用标准的 **Bayesian Knowledge Tracing (BKT)** 算法，精准计算学生对每个知识点的掌握概率。
- **实时计算**: 每次答题后毫秒级更新状态，支持 `P(L0)` (初始), `P(T)` (转移), `P(G)` (猜对), `P(S)` (失误) 四大参数配置。
- **双层存储架构**:
  - **L1 缓存 (Redis)**: 保证高并发下的实时读写性能。
  - **L2 持久化 (MySQL)**: 完整记录历史轨迹，确保数据安全。
- **可视化**: 集成 ECharts 雷达图，实时展示知识薄弱点与能力维度。

### 2. 🤖 AI 智能辅导 (Powered by Qwen-Plus)
- **智能出题**: 根据学生的实时掌握度动态生成题目。
  - *掌握度 < 0.4*: 生成基础概念题，侧重定义与理解。
  - *掌握度 >= 0.4*: 生成进阶应用题，侧重综合与分析。
- **智能解析**: 针对错题，AI 自动扮演“耐心导师”角色，生成包含推导步骤和 LaTeX 数学公式的详细解析。
- **自适应反馈**: 解析内容会分析学生的潜在误区，并提供举一反三的例题。

### 3. 📊 学习分析与预测
- **智能错题本**: 自动捕获答题错误，归档至错题本，并记录错误次数与时间。
- **AI 成绩预测**: 基于当前所有知识点的 BKT 掌握度，利用线性回归模型预测最终考试成绩及置信度。
- **成长报告**: 支持生成学习周报（集成 RabbitMQ 异步处理），统计答题正确率与进步最快的知识点。

---

## 🛠️ 技术栈

### 后端 (Backend)
- **Framework**: Spring Boot 3.1.10
- **Database**: MySQL 8.0, Redis (Redisson)
- **ORM**: MyBatis Plus
- **AI Integration**: Spring AI (适配 Qwen-Plus)
- **Message Queue**: RabbitMQ (用于异步报告生成)
- **Build Tool**: Maven

### 前端 (Frontend)
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Components**: Tailwind CSS, Framer Motion
- **Visualization**: Recharts
- **Math Rendering**: Katex / React-Latex

---

## 📂 项目结构

```
edtech-platform2/
├── edtech-frontend/       # React 前端工程
├── edtech-web/            # Spring Boot Web 入口与控制器
├── edtech-service-kt/     # 知识追踪服务 (BKT 算法核心)
├── edtech-service-ai/     # AI 服务 (LLM 集成)
├── edtech-service-core/   # 核心业务逻辑 (MQ, 通用配置)
├── edtech-model/          # 数据库实体与 Mapper
├── edtech-common/         # 通用工具类
└── sql/                   # 数据库初始化脚本
```

---

## 🚀 快速开始

### 1. 环境准备
- JDK 17+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### 2. 数据库初始化
执行 `sql/init.sql` 脚本，创建数据库 `edtech_db` 及相关表结构。

### 3. 后端启动
```bash
cd edtech-web
mvn spring-boot:run
```
*服务默认运行在 `http://localhost:8080`*

### 4. 前端启动
```bash
cd edtech-frontend
npm install
npm run dev
```
*页面默认运行在 `http://localhost:5173`*

---

## 📖 使用指南

1.  **访问仪表盘 (Dashboard)**
    - 登录系统后，首页展示“知识掌握雷达”和“AI 成绩预测”。
    - 观察雷达图了解自己的强弱项。

2.  **开始智能刷题 (Smart Practice)**
    - 点击侧边栏“Smart Practice”。
    - 系统会自动推荐一道题目。
    - **体验 AI 解析**: 故意选择一个错误答案并提交，系统会自动加载 AI 生成的详细解析。

3.  **查看知识图谱 (Knowledge Graph)**
    - 点击“Knowledge Graph”查看各学科知识点的层级关系。

4.  **查看成长报告 (Growth Report)**
    - 点击“Growth Report”查看历史答题记录和统计数据。

---

## 🔌 API 文档
后端启动后，可访问 Swagger UI 查看完整接口文档：
👉 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
