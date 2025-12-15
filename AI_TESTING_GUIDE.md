# 🤖 AI动态出题功能测试指南

## 🚀 快速验证步骤

### 1. 环境配置检查
```bash
# 1. 确保.env文件存在并配置了API密钥
cp .env.example .env
# 编辑.env文件，设置你的通义千问API密钥：
# AI_API_KEY=sk-your-actual-qwen-plus-key

# 2. 启动系统
docker-compose up -d --build

# 3. 检查服务状态
curl http://localhost:8080/actuator/health
```

### 2. AI服务连接测试
```bash
# 测试AI配置和连接
curl -X GET "http://localhost:8080/api/ai/test/connection"

# 预期返回：
{
  "status": "SUCCESS",
  "message": "AI服务连接正常",
  "configValid": true,
  "testQuestion": "实际生成的题目内容..."
}
```

### 3. 不同难度题目生成测试
```bash
# 生成各难度样本题目
curl -X POST "http://localhost:8080/api/ai/test/generate-samples"

# 预期返回包含Easy/Medium/Hard三个难度的完整题目
```

### 4. 前端练习页面测试

#### 4.1 访问练习页面
- 打开 http://localhost:5173/practice
- 应该看到"🤖 AI智能出题"配置卡片

#### 4.2 测试不同配置组合
1. **基础测试**：
   - 科目：数学
   - 难度：基础巩固
   - 点击"🎯 生成专属题目"
   - 验证：题目简单，包含基础概念

2. **进阶测试**：
   - 科目：数学  
   - 难度：挑战进阶
   - 点击"🎯 生成专属题目"
   - 验证：题目复杂，需要综合分析

3. **指定知识点测试**：
   - 展开"高级选项"
   - 选择"函数与导数"
   - 难度：稳步提升
   - 生成题目
   - 验证：题目专门针对函数导数知识点

### 5. LaTeX公式渲染验证
- 生成的题目应该正确显示数学公式
- 检查 $\frac{a}{b}$, $\sqrt{x}$, $\sin\theta$ 等公式是否正确渲染
- 选项中的公式也应该正确显示

### 6. 错误处理测试
```bash
# 测试无效API密钥的情况
# 临时修改.env中的AI_API_KEY为无效值，重启服务
# 访问练习页面，应该看到友好的错误提示
```

## 🎯 验证要点

### ✅ 成功标准
1. **AI连接正常**：测试接口返回SUCCESS状态
2. **题目质量高**：生成的题目有实际数学内容，不是占位符
3. **难度区分明显**：Easy题目简单直接，Hard题目需要深度思考
4. **LaTeX正确渲染**：数学公式显示正常
5. **个性化体现**：相同配置多次生成的题目内容不同
6. **错误处理优雅**：网络异常时显示友好提示

### ❌ 问题排查

#### 问题1：AI_API_KEY配置错误
**现象**：测试接口返回CONFIG_ERROR
**解决**：
```bash
# 检查.env文件
cat .env | grep AI_API_KEY
# 确保格式正确：AI_API_KEY=sk-your-actual-key
```

#### 问题2：题目仍然是占位符内容
**现象**：生成的题目显示"选项A的内容"等
**解决**：
```bash
# 检查ENABLE_MOCK设置
# 确保前端request.ts中ENABLE_MOCK = false
```

#### 问题3：LaTeX公式不显示
**现象**：公式显示为原始LaTeX代码
**解决**：
- 检查KaTeX CSS是否正确加载
- 确认Latex组件正确导入

#### 问题4：AI服务超时
**现象**：请求长时间无响应
**解决**：
```bash
# 检查网络连接
curl -I https://dashscope.aliyuncs.com
# 增加超时时间配置
```

## 📊 性能基准

### 响应时间期望
- AI题目生成：2-8秒
- 题目显示：<500ms
- 公式渲染：<200ms

### 成功率期望
- AI生成成功率：>95%
- 公式渲染成功率：>99%
- 重试机制触发：<5%

## 🔍 调试技巧

### 后端日志查看
```bash
# 查看AI服务调用日志
docker logs edtech-backend | grep "AI动态出题"

# 查看详细错误信息
docker logs edtech-backend | grep "ERROR"
```

### 前端调试
```javascript
// 浏览器控制台查看AI请求
// 应该看到类似输出：
// 🎯 发起AI出题请求: {subject: "数学", difficulty: "Easy"}
// ✅ AI题目生成成功: {data: {...}, strategy: "🤖 AI智能出题 (Easy)"}
```

### 网络请求监控
- 打开浏览器开发者工具 → Network
- 筛选XHR请求
- 查看 `/api/ai/generate-question` 请求详情
- 检查请求参数和响应内容

## 🎉 成功验证截图要求

请提供以下截图证明功能正常：

1. **AI连接测试成功**：`/api/ai/test/connection` 返回SUCCESS
2. **Easy难度题目**：简单的基础概念题
3. **Medium难度题目**：适中难度的计算题  
4. **Hard难度题目**：复杂的综合应用题
5. **LaTeX公式渲染**：包含分数、根号、三角函数的题目
6. **不同知识点**：函数、几何、概率等不同领域题目
7. **个性化差异**：相同配置生成的不同题目
8. **错误处理**：网络异常时的友好提示
9. **Loading状态**：AI思考中的加载动画
10. **完整流程**：从配置到生成到答题的完整截图

---

**🎯 目标达成标准**：用户在练习页面选择不同难度后，能够看到完全不同的、高质量的、包含正确LaTeX公式的真实数学题目，且题目针对性强，体现个性化特征。