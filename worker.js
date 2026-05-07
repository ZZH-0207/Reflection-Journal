// Cloudflare Worker - 纯代理，API Key 由前端传入
// 部署: npx wrangler deploy

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: corsHeaders()
      });
    }

    try {
      const { tags, apiKey } = await request.json();

      if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        return new Response(JSON.stringify({
          error: '请先设置有效的 DeepSeek API Key'
        }), { status: 401, headers: corsHeaders() });
      }

      if (!Array.isArray(tags) || tags.length < 2) {
        return new Response(JSON.stringify({
          error: '需要至少2个知识点才能分析关联关系'
        }), { status: 400, headers: corsHeaders() });
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(tags) }
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: 'json_object' }
        })
      });

      if (response.status === 401) {
        return new Response(JSON.stringify({
          error: 'API Key 无效，请检查后重试'
        }), { status: 401, headers: corsHeaders() });
      }

      if (!response.ok) {
        const errText = await response.text();
        return new Response(JSON.stringify({
          error: 'LLM API 调用失败',
          detail: errText.slice(0, 200)
        }), { status: 502, headers: corsHeaders() });
      }

      const result = await response.json();
      const content = result.choices[0].message.content;

      return new Response(content, {
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: '分析失败，请稍后重试',
        detail: error.message
      }), { status: 500, headers: corsHeaders() });
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function buildUserPrompt(tags) {
  const tagList = tags.map(t =>
    `- ${t.name}（${t.questionCount}题，正确率${t.accuracy !== null ? Math.round(t.accuracy * 100) + '%' : '无数据'}，科目: ${t.subjects.join('/')}）`
  ).join('\n');

  return `请分析以下知识点的关联关系：\n\n${tagList}`;
}

const SYSTEM_PROMPT = `你是一个数学/计算机科学知识点关联分析专家。用户会提供一系列知识点及其统计信息（题目数量、掌握正确率、所属科目），你需要分析这些知识点之间的内在关联。

## 关联类型定义：
1. **prerequisite** (前置依赖): A是学习B的前置基础，必须先掌握A才能理解B
   例: "极限" -> "导数", "概率论" -> "数理统计"
2. **parallel** (平行关联): A和B属于同一知识领域的不同分支，常一起出现
   例: "洛必达法则" <-> "泰勒展开"（都是极限计算的工具）
3. **containment** (包含关系): A是B的子知识点，B包含A
   例: "定积分" 包含 "牛顿-莱布尼茨公式"
4. **application** (应用关联): A的理论被应用于B
   例: "特征值" -> "主成分分析（PCA）"
5. **comparison** (对比关联): A和B容易混淆或常被对比学习
   例: "条件概率" <-> "贝叶斯公式"

## 输出格式：
{
  "nodes": [
    { "id": "知识点名称", "group": "core|intermediate|peripheral" }
  ],
  "edges": [
    {
      "from": "源知识点",
      "to": "目标知识点",
      "relation": "prerequisite|parallel|containment|application|comparison",
      "strength": "strong|medium|weak",
      "description": "不超过20字的中文解释"
    }
  ]
}

## 分析原则：
- group 判定：questionCount>=8 且关联>=3个 → "core"；questionCount>=3 → "intermediate"；其余 → "peripheral"
- 不要强行关联不相关的知识点
- 每个核心知识点应至少有1-2条关联
- 避免冗余边（如果A→B→C已经表达了传递关系，不需要A→C的传递边，除非有独立于B的强关联）
- description要简明、准确、有教学意义

请严格输出JSON，不要添加任何其他文字。`;
