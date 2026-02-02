import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromDocument } from '@/lib/document-parser'
import { analyzeFinancialReport, CompanyType } from '@/lib/ai/analyzer'
import { extractMetadataFromReport } from '@/lib/ai/extractor'
import { analysisStore } from '@/lib/store'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

// 后台处理分析（不阻塞响应）
async function processAnalysisInBackground(
  processingId: string,
  reportText: string,
  metadata: any,
  companyType: CompanyType
) {
  try {
    console.log(`[Background] Starting analysis for ${metadata.company_name}...`)
    
    const analysis = await analyzeFinancialReport(reportText, {
      company: metadata.company_name,
      symbol: metadata.company_symbol,
      period: metadata.fiscal_quarter 
        ? `Q${metadata.fiscal_quarter} ${metadata.fiscal_year}` 
        : `FY ${metadata.fiscal_year}`,
      fiscalYear: metadata.fiscal_year,
      fiscalQuarter: metadata.fiscal_quarter || undefined,
      companyType: companyType,
      consensus: {
        revenue: metadata.revenue || undefined,
        eps: metadata.eps || undefined,
        operatingIncome: metadata.operating_income || undefined,
      },
    })

    // 更新记录为已完成
    analysisStore.update(processingId, {
      processed: true,
      processing: false,
      ...analysis,
    })

    console.log(`[Background] Analysis complete: ${processingId}`)
  } catch (error: any) {
    console.error(`[Background] Analysis failed for ${processingId}:`, error)
    
    analysisStore.update(processingId, {
      processing: false,
      processed: false,
      error: error.message || 'Analysis failed',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const companyType = (formData.get('companyType') as CompanyType) || 'ai_application'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    console.log(`[Upload] Company type: ${companyType}`)
    console.log(`[Upload] File: ${file.name}`)

    const buffer = Buffer.from(await file.arrayBuffer())

    // 1. 提取 PDF 文本
    console.log('[Upload] Extracting text from PDF...')
    const reportText = await extractTextFromDocument(buffer, file.type)

    if (!reportText || reportText.length < 100) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    // 2. 提取元数据（快速）
    console.log('[Upload] Extracting metadata with AI...')
    const metadata = await extractMetadataFromReport(reportText)
    console.log('[Upload] Extracted metadata:', metadata)

    // 3. 立即创建"处理中"状态的记录
    const processingEntry = analysisStore.add({
      company_name: metadata.company_name,
      company_symbol: metadata.company_symbol,
      company_type: companyType,
      report_type: metadata.report_type,
      fiscal_year: metadata.fiscal_year,
      fiscal_quarter: metadata.fiscal_quarter || undefined,
      filing_date: metadata.filing_date,
      created_at: new Date().toISOString(),
      processed: false,
      processing: true,  // 标记为处理中
    })
    
    console.log('[Upload] Created processing entry:', processingEntry.id)

    // 4. 在后台启动分析（不等待完成）
    // 使用 setImmediate 确保响应先返回
    setImmediate(() => {
      processAnalysisInBackground(
        processingEntry.id,
        reportText,
        metadata,
        companyType
      )
    })

    // 5. 立即返回响应（不等待分析完成）
    return NextResponse.json({
      success: true,
      analysis_id: processingEntry.id,
      company_type: companyType,
      metadata,
      status: 'processing',
      message: '分析已开始，请稍候刷新查看结果',
    })
    
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Failed to process report' },
      { status: 500 }
    )
  }
}
