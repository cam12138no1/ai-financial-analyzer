import { openrouter } from './openrouter'

export interface ReportMetadata {
  company: string
  symbol: string
  period: string
  fiscalYear: number
  fiscalQuarter?: number
  consensus?: {
    revenue?: number
    eps?: number
    operatingIncome?: number
  }
}

export interface AnalysisResult {
  one_line_conclusion: string
  results_vs_expectations: {
    revenue: { actual: number; consensus: number; difference: number }
    eps: { actual: number; consensus: number; difference: number }
    operating_income: { actual: number; consensus: number; difference: number }
    guidance: string
  }
  key_drivers: {
    demand: { metrics: string; changes: string; reasons: string }
    monetization: { metrics: string; changes: string; reasons: string }
    efficiency: { metrics: string; changes: string; reasons: string }
  }
  investment_roi: {
    investments: string
    direction: string
    roi_evidence: string
    management_commitment: string
  }
  sustainability_risks: {
    sustainable_drivers: string[]
    main_risks: string[]
    checkpoints: string[]
  }
  model_impact: {
    assumption_changes: string
    logic_chain: string
  }
  final_judgment: string
}

const ANALYSIS_PROMPT = `角色与目标
你是一名顶级美股/科技股研究分析师(sell-side 写作风格),要产出一份可给投委会/董事会阅读的财报分析。你的目标不是复述财报,而是回答:
"本次财报是否改变了我们对未来 2–3 年现金流与竞争力的判断?"

输出格式(必须严格按此结构)
0) 一句话结论(放第一行)
用一句话给出 Beat/Miss + 最关键驱动 + 最大风险。

1) 结果层:业绩与指引 vs 市场预期(只写"差异"和"重要性")
用表格或要点列出:
- Revenue / EPS / Operating Income vs 预期(给差值)
- 指引(收入/利润/CapEx/Opex) vs 预期
- 解释:差异来自哪里?

2) 驱动层:把增长拆成"机制"(必须拆成三块)
A. 需求/量
B. 变现/单价
C. 内部效率

3) 投入与 ROI:这轮重投"买到了什么"(必须量化)
- 本期投入变化
- 投入指向
- ROI 证据
- 管理层"底线承诺/框架"

4) 可持续性与风险(给出"未来 2–3 个季度的检查点")
- 主要可持续驱动(1–3条)
- 主要风险(1–3条)
- 检查点

5) 模型影响
- 这次财报会让你上调/下调哪些假设?
- 变化的逻辑链

6) 结尾:一段"投委会可用"的判断

写作风格约束(强制)
- 必须 vs 预期
- 必须把 AI/技术从"故事"落到 指标→机制→财务变量
- 必须识别并剥离 一次性因素
- 不允许空泛形容词不带指标`

export async function analyzeFinancialReport(
  reportText: string,
  metadata: ReportMetadata
): Promise<AnalysisResult> {
  const response = await openrouter.chat({
    model: 'google/gemini-pro-1.5-exp',
    messages: [
      {
        role: 'system',
        content: ANALYSIS_PROMPT,
      },
      {
        role: 'user',
        content: `公司: ${metadata.company} (${metadata.symbol})
报告期: ${metadata.period}
市场预期基准: ${JSON.stringify(metadata.consensus || {}, null, 2)}

财报内容:
${reportText}

请严格按照输出格式进行分析。`,
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'financial_analysis',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            one_line_conclusion: { type: 'string' },
            results_vs_expectations: {
              type: 'object',
              properties: {
                revenue: {
                  type: 'object',
                  properties: {
                    actual: { type: 'number' },
                    consensus: { type: 'number' },
                    difference: { type: 'number' },
                  },
                  required: ['actual', 'consensus', 'difference'],
                },
                eps: {
                  type: 'object',
                  properties: {
                    actual: { type: 'number' },
                    consensus: { type: 'number' },
                    difference: { type: 'number' },
                  },
                  required: ['actual', 'consensus', 'difference'],
                },
                operating_income: {
                  type: 'object',
                  properties: {
                    actual: { type: 'number' },
                    consensus: { type: 'number' },
                    difference: { type: 'number' },
                  },
                  required: ['actual', 'consensus', 'difference'],
                },
                guidance: { type: 'string' },
              },
              required: ['revenue', 'eps', 'operating_income', 'guidance'],
            },
            key_drivers: {
              type: 'object',
              properties: {
                demand: {
                  type: 'object',
                  properties: {
                    metrics: { type: 'string' },
                    changes: { type: 'string' },
                    reasons: { type: 'string' },
                  },
                  required: ['metrics', 'changes', 'reasons'],
                },
                monetization: {
                  type: 'object',
                  properties: {
                    metrics: { type: 'string' },
                    changes: { type: 'string' },
                    reasons: { type: 'string' },
                  },
                  required: ['metrics', 'changes', 'reasons'],
                },
                efficiency: {
                  type: 'object',
                  properties: {
                    metrics: { type: 'string' },
                    changes: { type: 'string' },
                    reasons: { type: 'string' },
                  },
                  required: ['metrics', 'changes', 'reasons'],
                },
              },
              required: ['demand', 'monetization', 'efficiency'],
            },
            investment_roi: {
              type: 'object',
              properties: {
                investments: { type: 'string' },
                direction: { type: 'string' },
                roi_evidence: { type: 'string' },
                management_commitment: { type: 'string' },
              },
              required: ['investments', 'direction', 'roi_evidence', 'management_commitment'],
            },
            sustainability_risks: {
              type: 'object',
              properties: {
                sustainable_drivers: {
                  type: 'array',
                  items: { type: 'string' },
                },
                main_risks: {
                  type: 'array',
                  items: { type: 'string' },
                },
                checkpoints: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: ['sustainable_drivers', 'main_risks', 'checkpoints'],
            },
            model_impact: {
              type: 'object',
              properties: {
                assumption_changes: { type: 'string' },
                logic_chain: { type: 'string' },
              },
              required: ['assumption_changes', 'logic_chain'],
            },
            final_judgment: { type: 'string' },
          },
          required: [
            'one_line_conclusion',
            'results_vs_expectations',
            'key_drivers',
            'investment_roi',
            'sustainability_risks',
            'model_impact',
            'final_judgment',
          ],
        },
      },
    },
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  return JSON.parse(content)
}
