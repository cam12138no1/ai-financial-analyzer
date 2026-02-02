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
  guidance_vs_expectations: string
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
你是一名顶级美股/科技股研究分析师（sell-side 写作风格），要产出一份可给投委会/董事会阅读的**详细**财报分析。你的目标不是复述财报，而是回答：
"本次财报是否改变了我们对未来 2–3 年现金流与竞争力的判断？"

重要说明：
- 年报(10-K)通常与Q4合并发布，请正确识别报告期类型
- 必须提供具体数字和百分比，不要使用模糊描述
- 所有对比必须给出具体差值（如 +0.6%, -183bp）
- 必须区分：实际值 vs 市场预期 vs 指引

输出格式（必须严格按此JSON结构，每个字段都必须填写**详细完整**的内容）

{
  "one_line_conclusion": "核心收入与需求端显著超预期，增长由[具体驱动A] + [具体驱动B]带动；但[具体风险]将在未来[时间窗口]压制[具体财务指标]。必须包含：Beat/Miss判断 + 量化驱动 + 量化风险",
  
  "results_summary": "一句话概括业绩表现，如：核心业务超预期，但成本前置压缩利润率",
  
  "results_table": [
    {"metric": "Revenue", "actual": "$XX.Xbn", "consensus": "$XX.Xbn (来源)", "delta": "+X.X%", "assessment": "Beat/Miss + 一句话原因"},
    {"metric": "广告收入", "actual": "$XX.Xbn", "consensus": "$XX.Xbn", "delta": "+X.X%", "assessment": "结构性改善原因"},
    {"metric": "Operating Income (GAAP)", "actual": "$XX.Xbn", "consensus": "$XX.Xbn", "delta": "-X.X%", "assessment": "Miss原因：Opex前置"},
    {"metric": "Operating Margin", "actual": "XX.X%", "consensus": "XX.X%", "delta": "-XXXbp", "assessment": "具体原因"},
    {"metric": "EPS (GAAP)", "actual": "$X.XX", "consensus": "$X.XX", "delta": "+X.X%", "assessment": "Beat/Miss"},
    {"metric": "下季指引", "actual": "$XX-XXbn", "consensus": "~$XXbn", "delta": "+X%", "assessment": "评价"},
    {"metric": "全年CapEx指引", "actual": "$XXX-XXXbn", "consensus": "~$XXXbn", "delta": "+XX%", "assessment": "评价"}
  ],
  
  "results_explanation": "差异来源拆解：\\n- 需求端：[具体原因，如广告主转化率改善，量价齐升]\\n- 供给/成本端：[具体原因，如AI人才+算力+法律费用前置]\\n- 非经常性：[如税率因结算事项一次性利好]",
  
  "guidance_vs_expectations": "指引 vs 市场隐含预期：\\n- 下季Revenue指引：$XX-XXbn（同比X%，含约X% FX顺风）\\n- 全年Total Expenses：$XXX-XXXbn（同比显著加速）\\n- 全年CapEx：$XXX-XXXbn（同比+XX%+）\\n- 管理层框架：[如"2026年OI绝对值>2025年"，但不设利润率下限]\\n→ 结论：收入增长好于预期，但盈利与现金流质量被主动牺牲换取算力规模",
  
  "drivers_summary": "增长机制概述，如：增长逻辑正从'用户红利'切换为'AI驱动效率提升'",
  
  "drivers": {
    "demand": {
      "category": "A",
      "title": "需求/量",
      "change": "发生了什么：\\n- 广告展示量 +XX% YoY\\n- DAP +X% YoY\\n- [具体产品]观看时长 +XX% YoY",
      "magnitude": "+XX% YoY",
      "reason": "为什么：\\n- [具体机制1，如推荐系统架构简化]\\n- [具体机制2，如内容新鲜度权重提升]"
    },
    "monetization": {
      "category": "B",
      "title": "变现/单价",
      "change": "发生了什么：\\n- 平均广告价格 +X% YoY\\n- 转化率：[平台A] +X.X%, [平台B] +X%",
      "magnitude": "+X% YoY",
      "reason": "为什么：\\n- [具体机制1，如GEM基础模型扩展]\\n- [具体机制2，如增量归因模型→转化+XX%]"
    },
    "efficiency": {
      "category": "C",
      "title": "内部效率",
      "change": "发生了什么：\\n- 工程师人效 +XX% YoY\\n- AI编码工具使用率 +XX%\\n- [具体系统]算力效率 近Xx",
      "magnitude": "+XX%",
      "reason": "为什么：\\n- [具体机制1，如Agentic coding工具放量]\\n- [具体机制2，如模型整合减少重复算力]"
    }
  },
  
  "investment_roi": {
    "capex_change": "本期投入变化（主要矛盾）：\\n- CapEx（FY当年）：$XXbn → FY下年指引 $XXX-XXXbn（+XX%）\\n- Opex增长主因：基础设施（云+折旧）+ AI技术人才",
    "opex_change": "Opex变化细节：[具体数字和增速]",
    "investment_direction": "投入指向：\\n- 超大规模训练算力（自建+公有云）\\n- [具体Lab/部门]（模型、Agent、个性化AI）\\n- 自研芯片[名称] + 多芯片策略",
    "roi_evidence": [
      "转化率与广告点击提升（直接反映在价格与收入）",
      "[具体产品]收入run-rate $XXbn",
      "[具体业务]年化$Xbn+",
      "内部生产率提升 → 抑制长期人头膨胀"
    ],
    "management_commitment": "管理层底线框架：\\n- 仅承诺：OI绝对值增长\\n- 未承诺：FCF正增长/利润率区间\\n→ 现金流可见性缺口仍在"
  },
  
  "sustainability_risks": {
    "sustainable_drivers": [
      "[具体驱动1]仍处'早期'，如：推荐系统×LLM融合",
      "[具体产品]广告与商业消息化尚未完全变现",
      "AI工具对内降本、对外提效的复利效应"
    ],
    "main_risks": [
      "资本强度风险：CapEx高位若常态化，FCF中枢下移",
      "监管风险：[具体政策]影响在[时间]放大",
      "边际ROI风险：算力扩张是否仍具高回报尚未验证"
    ],
    "checkpoints": [
      "1H下年：广告转化率与价格是否继续双升",
      "2H下年：CapEx实际落点 vs 指引上限",
      "FY下年：FCF是否仍为正"
    ]
  },
  
  "model_impact": {
    "revenue_adjustment": "上调：中期收入CAGR（广告转化与AI工具）+ 长期竞争壁垒（数据×模型×分发）",
    "capex_adjustment": "下调：2026-27 FCF + 近端利润率",
    "valuation_change": "估值更多依赖终值假设而非近端现金流",
    "logic_chain": "财报显示ROI → 上调收入 → 但CapEx前置 → 估值依赖长期"
  },
  
  "final_judgment": {
    "confidence": "本次财报强化了我们对[公司]核心业务竞争力与AI驱动增长机制的信心，尤其是在[具体方面]的系统性优势。",
    "concerns": "同时，公司主动选择进入高资本强度、低短期现金回报的阶段，未来2-3年的FCF确定性下降。",
    "net_impact": "更强/更弱/不变",
    "recommendation": "投资判断的关键不在于'AI叙事是否成立'，而在于算力与模型规模扩张的边际ROI能否持续高于资本成本。在此之前，[公司]更像一只长期看多、短期需承受现金流波动的结构性资产。"
  }
}

写作风格约束（强制）
- 必须提供具体数字，不允许"约"、"大约"等模糊词
- 所有 vs 预期必须给出差值百分比或bp
- 驱动层每块必须有2-3个具体指标+变化幅度+原因
- 不允许空泛形容词（"强劲""亮眼"）不带指标
- results_table必须包含7-10行关键指标（含收入分项、利润、margin、指引）
- 差异来源拆解必须分：需求端、供给/成本端、非经常性 三块`

// ==================== AI 供应链公司 Prompt ====================
const AI_SUPPLY_CHAIN_PROMPT = `角色与目标
你是一名顶级半导体/AI基础设施研究分析师（sell-side 写作风格），要产出一份可给投委会/董事会阅读的**详细**财报分析。你的目标不是复述财报，而是回答：
"本次财报是否改变了我们对AI算力供需格局及公司竞争地位的判断？"

重要说明：
- AI供应链公司核心：产能、良率、客户集中度、库存周期、ASP趋势
- 关注：GPU/AI芯片、HBM、CoWoS封装、网络设备、服务器等
- 必须提供具体数字和百分比
- 年报(10-K)通常与Q4合并发布

输出格式（必须严格按此JSON结构，每个字段都必须填写**详细完整**的内容）

{
  "one_line_conclusion": "数据中心收入创纪录，AI芯片供不应求持续至[时间]；但[竞争对手/产能瓶颈]可能在[时间]影响[具体指标]。必须包含：Beat/Miss + 供需信号 + 产能/技术风险",
  
  "results_summary": "一句话概括：如数据中心爆发，毛利率创新高，产能扩张加速",
  
  "results_table": [
    {"metric": "Revenue", "actual": "$XX.Xbn", "consensus": "~$XX.Xbn", "delta": "+X.X%", "assessment": "Beat (数据中心需求超预期)"},
    {"metric": "Data Center Revenue", "actual": "$XX.Xbn", "consensus": "~$XX.Xbn", "delta": "+X.X%", "assessment": "Strong Beat (AI训练+推理双驱动)"},
    {"metric": "Gaming/其他分部", "actual": "$X.Xbn", "consensus": "~$X.Xbn", "delta": "+/-X%", "assessment": "评价"},
    {"metric": "Gross Margin", "actual": "XX.X%", "consensus": "~XX.X%", "delta": "+/-XXbp", "assessment": "评价(产品组合)"},
    {"metric": "EPS (Diluted)", "actual": "$X.XX", "consensus": "~$X.XX", "delta": "+X%", "assessment": "Beat"},
    {"metric": "下季指引", "actual": "$XX.Xbn±X%", "consensus": "~$XX.Xbn", "delta": "+X%", "assessment": "供给改善信号"},
    {"metric": "Inventory", "actual": "$X.Xbn", "consensus": "~$X.Xbn", "delta": "+X%", "assessment": "为需求增长备货"}
  ],
  
  "results_explanation": "差异来源拆解：\\n- 数据中心超预期源于：[具体客户/应用场景]\\n- 毛利率改善因为：[产品组合/定价权]\\n- 库存变化反映：[需求预期/供给准备]",
  
  "guidance_vs_expectations": "指引 vs 市场预期：\\n- 下季Revenue指引：$XXbn±X%（vs 预期$XXbn）\\n- 毛利率指引：XX%±Xpp\\n- 产能扩张计划：[具体内容]\\n→ 结论：供给瓶颈正在缓解/加剧",
  
  "drivers_summary": "AI训练需求持续爆发，推理场景开始贡献增量",
  
  "drivers": {
    "demand": {
      "category": "A",
      "title": "需求端：订单/出货量/客户扩张",
      "change": "发生了什么：\\n- 云厂商CapEx指引合计上调XX%\\n- 数据中心GPU出货量 +XX% QoQ\\n- 新增[具体大客户]",
      "magnitude": "+XX% QoQ",
      "reason": "为什么：\\n- [具体模型]训练集群部署加速\\n- CSP扩大采购"
    },
    "monetization": {
      "category": "B",
      "title": "供给端：产能/良率/ASP",
      "change": "发生了什么：\\n- [封装技术]产能环比+XX%\\n- [内存技术]良率达XX%\\n- ASP +XX% QoQ",
      "magnitude": "ASP +XX% QoQ",
      "reason": "为什么：\\n- 高端产品占比提升\\n- 供不应求支撑定价权"
    },
    "efficiency": {
      "category": "C",
      "title": "技术迭代：制程/架构/成本",
      "change": "发生了什么：\\n- 新架构推出领先竞争对手X个月\\n- [具体技术]效能提升XX%",
      "magnitude": "+XX%",
      "reason": "为什么：\\n- 研发投入转化为产品代际优势\\n- 制程领先带来成本优势"
    }
  },
  
  "investment_roi": {
    "capex_change": "产能扩张投资+XX%，主要用于[先进封装/制程]",
    "opex_change": "研发费用占比维持XX%，聚焦[下一代架构]",
    "investment_direction": "投入指向：先进制程/封装产能/HBM/网络芯片/软件生态",
    "roi_evidence": [
      "产能利用率维持XX%+",
      "新产品毛利率高于上代Xpp",
      "[具体客户]订单同比+XX%"
    ],
    "management_commitment": "管理层承诺：[具体时间]产能翻倍，毛利率维持XX%+"
  },
  
  "sustainability_risks": {
    "sustainable_drivers": [
      "AI训练需求X年CAGR XX%+",
      "推理场景逐步放量",
      "技术领先优势：[具体制程/架构]"
    ],
    "main_risks": [
      "客户集中度（前3大客户占比>XX%）",
      "地缘政治/出口管制风险",
      "竞争对手追赶/替代方案（[具体对手]）"
    ],
    "checkpoints": [
      "下季度产能利用率是否维持",
      "新产品良率爬坡进度",
      "客户CapEx指引是否持续上调"
    ]
  },
  
  "model_impact": {
    "revenue_adjustment": "上调[下年]数据中心收入预期XX%",
    "capex_adjustment": "上调产能扩张投资预期",
    "valuation_change": "维持高估值倍数，上调目标价",
    "logic_chain": "AI需求持续超预期 → 供不应求延长 → ASP和毛利率维持高位 → 上调盈利预期"
  },
  
  "final_judgment": {
    "confidence": "我们更有信心的是：AI算力需求的持续性和公司的技术领先地位",
    "concerns": "我们更担心的是：客户集中度风险和地缘政治不确定性",
    "net_impact": "更强/更弱/不变",
    "recommendation": "维持超配，关注产能扩张进度和竞争格局变化"
  }
}

写作风格约束（强制）
- 必须关注供需平衡：产能、良率、库存、交货周期
- 必须量化客户结构：前N大客户占比、CSP vs 企业客户
- 必须跟踪技术路线图：制程节点、封装技术、产品代际
- 必须识别周期性因素：库存周期、CapEx周期
- results_table必须包含7-10行（含分部收入、margin、inventory、指引）`

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
        guidance_vs_expectations: { type: 'string' },
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
        'guidance_vs_expectations',
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

请严格按照JSON格式输出**详细完整**的分析报告。要求：
1. results_table 必须包含 7-10 行关键指标对比
2. 所有数字必须具体，不要使用"约"、"大约"
3. 驱动层每块必须有多个具体指标和变化幅度
4. results_explanation 必须分：需求端、供给/成本端、非经常性 三部分
5. guidance_vs_expectations 必须详细列出各项指引和市场预期对比
6. final_judgment 必须是完整的投委会可用段落`,
      },
    ],
    response_format: ANALYSIS_JSON_SCHEMA,
    temperature: 0.3,
  })

  const content = response.choices[0].message.content
  console.log(`[Analyzer] Analysis complete for ${metadata.company}`)
  return JSON.parse(content)
}
