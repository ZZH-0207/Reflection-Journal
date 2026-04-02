# Reflection Journal - 个人习题复习工具

一个基于SM-2算法的个人习题复习管理系统，支持Markdown和LaTeX公式渲染。

## ✨ 功能特性

- **Capture（录入）** - 快速录入习题，支持Markdown和LaTeX公式
- **Review（复习）** - 基于SM-2算法的间隔重复复习
- **Insights（分析）** - 学习数据可视化，薄弱知识点分析
- **Browse（浏览）** - 搜索、筛选、管理所有习题

## 🚀 在线访问

访问地址：https://zzh-0207.github.io/Reflection-Journal/

## 📦 本地使用

1. 克隆仓库
```bash
git clone https://github.com/ZZH-0207/Reflection-Journal.git
```

2. 打开 `index.html` 即可使用

## 🔧 GitHub Pages 配置

如果需要自己部署：

1. Fork 本仓库
2. 进入仓库 Settings → Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，Folder 选择 "/ (root)"
5. 点击 Save
6. 等待几分钟后访问 `https://你的用户名.github.io/Reflection-Journal/`

## 💾 数据存储

- 所有数据存储在浏览器的 localStorage 中
- 支持数据导出（JSON格式）
- 支持数据导入

## 📝 技术栈

- 纯前端实现，无需后端
- Tailwind CSS - 样式框架
- Marked.js - Markdown渲染
- KaTeX - LaTeX公式渲染
- Chart.js - 数据可视化
- SM-2 Algorithm - 间隔重复算法

## 📖 使用说明

### 录入题目
1. 切换到 Capture 标签
2. 填写科目、来源、知识点、题干、答案等信息
3. 选择录入原因（思路错误、解法不会、难题、好题）
4. 点击保存

### 复习题目
1. 系统会自动显示今天需要复习的题目
2. 查看题干，思考解答
3. 点击"显示答案"查看正确答案
4. 根据回忆情况选择：Again（忘记）、Hard（困难）、Good（良好）、Easy（简单）
5. 系统会根据反馈调整下次复习时间

### 查看统计
- Insights 标签显示学习数据统计
- 科目分布、录入原因分析
- 掌握趋势图
- 薄弱知识点提醒

## 📄 License

MIT License
