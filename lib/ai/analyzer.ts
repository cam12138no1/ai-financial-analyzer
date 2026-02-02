import { openrouter } from '../openrouter'

// 公司类型
export type CompanyType = 'ai_application' | 'ai_supply_chain'

export interface ReportMetadata {
  company: string
  symbol: string
  period: string
  fiscalYear: number
  fiscalQuarter?: number
  companyType: CompanyType
  consensus?: {
    revenue?: number
    eps?: number
    operatingIncome?: number
  }
}

// 结果层表格数据结构
export interface ResultsTableRow {
  metric: string
  actual: string
  consensus: string
  delta: string
  assessment: string
}

// 驱动层详细数据
export interface DriverDetail {
  category: string
  title: string
  change: string
  magnitude: string
  reason: string
}

// 完整分析结果
export interface AnalysisResult {
  one_line_conclusion: string
  results_summary: string
  results_table: ResultsTableRow[]
  results_explanation: string
  drivers_summary: string
  drivers: {
    demand: DriverDetail
    monetization: DriverDetail
    efficiency: DriverDetail
  }
  investment_roi: {
    capex_change: string
    opex_change: string
    investment_direction: string
    roi_evidence: string[]
    management_commitment: string
  }
  sustainability_risks: {
    sustainable_drivers: string[]
    main_risks: string[]
    checkpoints: string[]
  }
  model_impact: {
    revenue_adjustment: string
    capex_adjustment: string
    valuation_change: string
    logic_chain: string
  }
  final_judgment: {
    confidence: string
    concerns: string
    net_impact: string
    recommendation: string
  }
}

// ==================== AI 应用公司 Prompt ====================
const AI_APPLICATION_PROMPT = `角色与目标
你是一名顶级美股/科技股研究分析师（sell-side 写作风格），要产出一份可给投委会/董事会阅读的财报分析。你的目标不是复述财报，而是回答：
"本次财报是否改变了我们对未来 2–3 年现金流与竞争力的判断？"

重要说明：年报(10-K)通常与Q4合并发布，请正确识别报告期类型。

输出格式（必须严格按此JSON结构，每个字段都必须填写完整内容）

请返回以下JSON格式的完整分析：

{
  "one_line_conclusion": "一句话结论：Beat/Miss + 最关键驱动 + 最大风险。例：核心收入/指引超预期，增长由{驱动A}+{驱动B}带动；但{风险点}可能在未来{时间窗口}压制利润/FCF。",
  
  "results_summary": "结果层概述，如：业绩强劲，指引炸裂，CapEx震惊市场。",
  
  "results_table": [
    {"metric": "Revenue", "actual": "$59.89B", "consensus": "~$58.45B", "delta": "+2.5%", "assessment": "Beat (广告需求强劲)"},
    {"metric": "EPS (Diluted)", "actual": "$8.88", "consensus": "~$8.20", "delta": "+8.3%", "assessment": "Beat (运营杠杆显现)"},
    {"metric": "Operating Income", "actual": "$24.75B", "consensus": "~$23.5B", "delta": "+5.3%", "assessment": "Beat (核心业务利润率稳健)"},
    {"metric": "Q1 指引", "actual": "$53.5-56.5B", "consensus": "~$51.3B", "delta": "+7%", "assessment": "Strong Beat (增长加速信号)"},
    {"metric": "FY CapEx", "actual": "$115-135B", "consensus": "~$110B", "delta": "+13.6%", "assessment": "Shock (远超预期)"}
  ],
  
  "results_explanation": "关键解释：收入超预期源于...；CapEx激增因为...",
  
  "drivers_summary": "驱动概述，如：增长逻辑已从'用户红利'完全切换为'AI提效'",
  
  "drivers": {
    "demand": {
      "category": "A",
      "title": "需求/量：用户/使用量/订单量",
      "change": "变化描述，如：DAP达3.58亿，同比增长+6.9%",
      "magnitude": "幅度，如：+6.9% YoY",
      "reason": "原因，如：推荐算法优化使用户停留时间延长"
    },
    "monetization": {
      "category": "B",
      "title": "变现/单价：ARPU/价格/转化率",
      "change": "变化描述",
      "magnitude": "幅度",
      "reason": "原因"
    },
    "efficiency": {
      "category": "C",
      "title": "内部效率：人效/算力效率/成本",
      "change": "变化描述",
      "magnitude": "幅度",
      "reason": "原因"
    }
  },
  
  "investment_roi": {
    "capex_change": "CapEx变化描述",
    "opex_change": "Opex变化描述",
    "investment_direction": "投入指向：算力/人才/渠道/供应链/并购",
    "roi_evidence": ["ROI证据1", "ROI证据2", "ROI证据3"],
    "management_commitment": "管理层底线承诺"
  },
  
  "sustainability_risks": {
    "sustainable_drivers": ["可持续驱动1", "可持续驱动2", "可持续驱动3"],
    "main_risks": ["主要风险1", "主要风险2", "主要风险3"],
    "checkpoints": ["检查点1", "检查点2", "检查点3"]
  },
  
  "model_impact": {
    "revenue_adjustment": "收入假设调整",
    "capex_adjustment": "CapEx假设调整",
    "valuation_change": "估值变化",
    "logic_chain": "逻辑链：财报信号 → 假设变化 → 估值变化"
  },
  
  "final_judgment": {
    "confidence": "我们更有信心的是...",
    "concerns": "我们更担心的是...",
    "net_impact": "更强/更弱/不变",
    "recommendation": "建议"
  }
}

写作风格约束（强制）
- 必须 vs 预期（没有预期就用"隐含预期/历史区间"替代）
- 必须把 AI/技术从"故事"落到 指标→机制→财务变量
- 必须识别并剥离 一次性因素（罚款、诉讼、重组、资产减值等）
- 不允许空泛形容词（"强劲""亮眼"）不带指标
- results_table必须包含至少5-7行关键指标`

// ==================== AI 供应链公司 Prompt ====================
const AI_SUPPLY_CHAIN_PROMPT = `角色与目标
你是一名顶级半导体/AI基础设施研究分析师（sell-side 写作风格），要产出一份可给投委会/董事会阅读的财报分析。你的目标不是复述财报，而是回答：
"本次财报是否改变了我们对AI算力供需格局及公司竞争地位的判断？"

重要说明：
- AI供应链公司的核心在于：产能、良率、客户集中度、库存周期、ASP趋势
- 关注GPU/AI芯片、HBM、CoWoS封装、网络设备、服务器等关键环节
- 年报(10-K)通常与Q4合并发布，请正确识别报告期类型

输出格式（必须严格按此JSON结构，每个字段都必须填写完整内容）

请返回以下JSON格式的完整分析：

{
  "one_line_conclusion": "一句话结论：Beat/Miss + 最关键供需信号 + 最大产能/技术风险。例：数据中心收入创纪录，AI芯片供不应求持续至{时间}；但{竞争对手/产能瓶颈}可能在{时间窗口}影响市场份额。",
  
  "results_summary": "结果层概述，如：数据中心收入爆发，毛利率创新高，产能扩张加速。",
  
  "results_table": [
    {"metric": "Revenue", "actual": "$35.1B", "consensus": "~$33.2B", "delta": "+5.7%", "assessment": "Beat (数据中心需求超预期)"},
    {"metric": "Data Center Revenue", "actual": "$30.8B", "consensus": "~$28.5B", "delta": "+8.1%", "assessment": "Strong Beat (AI训练+推理双驱动)"},
    {"metric": "Gross Margin", "actual": "76.0%", "consensus": "~74.5%", "delta": "+1.5pp", "assessment": "Beat (产品组合优化)"},
    {"metric": "EPS (Diluted)", "actual": "$0.89", "consensus": "~$0.84", "delta": "+6.0%", "assessment": "Beat"},
    {"metric": "Next Q Guidance", "actual": "$37.5B±2%", "consensus": "~$36.0B", "delta": "+4.2%", "assessment": "Beat (供给改善信号)"},
    {"metric": "Inventory", "actual": "$8.5B", "consensus": "~$7.8B", "delta": "+9.0%", "assessment": "Above (为需求增长备货)"}
  ],
  
  "results_explanation": "关键解释：数据中心超预期源于...；毛利率改善因为...；库存增加反映...",
  
  "drivers_summary": "驱动概述，如：AI训练需求持续爆发，推理场景开始贡献增量",
  
  "drivers": {
    "demand": {
      "category": "A",
      "title": "需求端：订单/出货量/客户扩张",
      "change": "变化描述，如：云厂商CapEx指引合计上调15%，数据中心GPU出货量+40% QoQ",
      "magnitude": "幅度，如：+40% QoQ",
      "reason": "原因，如：GPT-5训练集群部署加速，CSP扩大采购"
    },
    "monetization": {
      "category": "B",
      "title": "供给端：产能/良率/ASP",
      "change": "变化描述，如：CoWoS产能环比+25%，HBM3e良率达85%",
      "magnitude": "幅度，如：ASP +10% QoQ",
      "reason": "原因，如：高端产品占比提升，供不应求支撑定价权"
    },
    "efficiency": {
      "category": "C",
      "title": "技术迭代：制程/架构/成本",
      "change": "变化描述，如：新架构推出领先竞争对手6个月",
      "magnitude": "幅度",
      "reason": "原因，如：研发投入转化为产品代际优势"
    }
  },
  
  "investment_roi": {
    "capex_change": "CapEx变化描述，如：产能扩张投资+50%，主要用于先进封装",
    "opex_change": "研发投入变化，如：研发费用占比维持25%，聚焦下一代架构",
    "investment_direction": "投入指向：先进制程/封装产能/HBM/网络芯片/软件生态",
    "roi_evidence": ["ROI证据1：产能利用率维持95%+", "ROI证据2：新产品毛利率高于上代5pp", "ROI证据3"],
    "management_commitment": "管理层承诺，如：2026年产能翻倍，毛利率维持75%+"
  },
  
  "sustainability_risks": {
    "sustainable_drivers": ["可持续驱动1：AI训练需求3年CAGR 50%+", "可持续驱动2：推理场景逐步放量", "可持续驱动3：技术领先优势"],
    "main_risks": ["风险1：客户集中度（前3大客户占比>50%）", "风险2：地缘政治/出口管制", "风险3：竞争对手追赶/替代方案"],
    "checkpoints": ["检查点1：下季度产能利用率", "检查点2：新产品良率爬坡", "检查点3：客户CapEx指引变化"]
  },
  
  "model_impact": {
    "revenue_adjustment": "收入假设调整，如：上调2026年数据中心收入预期15%",
    "capex_adjustment": "CapEx假设调整，如：上调产能扩张投资预期",
    "valuation_change": "估值变化，如：维持高估值倍数，上调目标价",
    "logic_chain": "逻辑链：AI需求持续超预期 → 供不应求延长 → ASP和毛利率维持高位 → 上调盈利预期"
  },
  
  "final_judgment": {
    "confidence": "我们更有信心的是：AI算力需求的持续性和公司的技术领先地位",
    "concerns": "我们更担心的是：客户集中度风险和地缘政治不确定性",
    "net_impact": "更强/更弱/不变",
    "recommendation": "建议：如维持超配，关注产能扩张进度"
  }
}

写作风格约束（强制）
- 必须关注供需平衡：产能、良率、库存、交货周期
- 必须量化客户结构：前N大客户占比、CSP vs 企业客户
- 必须跟踪技术路线图：制程节点、封装技术、产品代际
- 必须识别周期性因素：库存周期、CapEx周期、更换周期
- 不允许空泛形容词（"强劲""亮眼"）不带指标
- results_table必须包含至少5-7行关键指标`

// 根据公司类型获取对应的 prompt
function getPromptByType(companyType: CompanyType): string {
  return companyType === 'ai_application' ? AI_APPLICATION_PROMPT : AI_SUPPLY_CHAIN_PROMPT
}

// JSON Schema（两种类型共用）
const ANALYSIS_JSON_SCHEMA = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'financial_analysis',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        one_line_conclusion: { type: 'string' },
        results_summary: { type: 'string' },
        results_table: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              metric: { type: 'string' },
              actual: { type: 'string' },
              consensus: { type: 'string' },
              delta: { type: 'string' },
              assessment: { type: 'string' },
            },
            required: ['metric', 'actual', 'consensus', 'delta', 'assessment'],
          },
        },
        results_explanation: { type: 'string' },
        drivers_summary: { type: 'string' },
        drivers: {
          type: 'object',
          properties: {
            demand: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                title: { type: 'string' },
                change: { type: 'string' },
                magnitude: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['category', 'title', 'change', 'magnitude', 'reason'],
            },
            monetization: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                title: { type: 'string' },
                change: { type: 'string' },
                magnitude: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['category', 'title', 'change', 'magnitude', 'reason'],
            },
            efficiency: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                title: { type: 'string' },
                change: { type: 'string' },
                magnitude: { type: 'string' },
                reason: { type: 'string' },
              },
              required: ['category', 'title', 'change', 'magnitude', 'reason'],
            },
          },
          required: ['demand', 'monetization', 'efficiency'],
        },
        investment_roi: {
          type: 'object',
          properties: {
            capex_change: { type: 'string' },
            opex_change: { type: 'string' },
            investment_direction: { type: 'string' },
            roi_evidence: { type: 'array', items: { type: 'string' } },
            management_commitment: { type: 'string' },
          },
          required: ['capex_change', 'opex_change', 'investment_direction', 'roi_evidence', 'management_commitment'],
        },
        sustainability_risks: {
          type: 'object',
          properties: {
            sustainable_drivers: { type: 'array', items: { type: 'string' } },
            main_risks: { type: 'array', items: { type: 'string' } },
            checkpoints: { type: 'array', items: { type: 'string' } },
          },
          required: ['sustainable_drivers', 'main_risks', 'checkpoints'],
        },
        model_impact: {
          type: 'object',
          properties: {
            revenue_adjustment: { type: 'string' },
            capex_adjustment: { type: 'string' },
            valuation_change: { type: 'string' },
            logic_chain: { type: 'string' },
          },
          required: ['revenue_adjustment', 'capex_adjustment', 'valuation_change', 'logic_chain'],
        },
        final_judgment: {
          type: 'object',
          properties: {
            confidence: { type: 'string' },
            concerns: { type: 'string' },
            net_impact: { type: 'string' },
            recommendation: { type: 'string' },
          },
          required: ['confidence', 'concerns', 'net_impact', 'recommendation'],
        },
      },
      required: [
        'one_line_conclusion',
        'results_summary',
        'results_table',
        'results_explanation',
        'drivers_summary',
        'drivers',
        'investment_roi',
        'sustainability_risks',
        'model_impact',
        'final_judgment',
      ],
    },
  },
}

export async function analyzeFinancialReport(
  reportText: string,
  metadata: ReportMetadata
): Promise<AnalysisResult> {
  const prompt = getPromptByType(metadata.companyType)
  const companyTypeLabel = metadata.companyType === 'ai_application' ? 'AI应用公司' : 'AI供应链公司'
  
  console.log(`[Analyzer] Using prompt for: ${companyTypeLabel}`)
  console.log(`[Analyzer] Model: google/gemini-3-pro-preview`)
  
  const response = await openrouter.chat({
    model: 'google/gemini-3-pro-preview',
    messages: [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: `公司类型: ${companyTypeLabel}
公司: ${metadata.company} (${metadata.symbol})
报告期: ${metadata.period}
市场预期基准: ${JSON.stringify(metadata.consensus || {}, null, 2)}

财报内容:
${reportText}

请严格按照JSON格式输出完整分析，确保每个字段都有详细内容。results_table必须包含5-7行关键财务指标对比。`,
      },
    ],
    response_format: ANALYSIS_JSON_SCHEMA,
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  console.log(`[Analyzer] Analysis complete for ${metadata.company}`)
  return JSON.parse(content)
}
