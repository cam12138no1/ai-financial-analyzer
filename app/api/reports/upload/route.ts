import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromDocument } from '@/lib/document-parser'
import { analyzeFinancialReport, CompanyType } from '@/lib/ai/analyzer'
import { extractMetadataFromReport } from '@/lib/ai/extractor'
import { analysisStore } from '@/lib/store'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  let processingId: string | null = null
  
  try {
    // 不再需要 session 验证，通过浏览器 ID 识别用户

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

    // Extract text from PDF
    console.log('[Upload] Extracting text from PDF...')
    const reportText = await extractTextFromDocument(buffer, file.type)

    if (!reportText || reportText.length < 100) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    // Extract metadata using AI
    console.log('[Upload] Extracting metadata with AI...')
    const metadata = await extractMetadataFromReport(reportText)
    console.log('[Upload] Extracted metadata:', metadata)

    // Create processing entry
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
      processing: true,
    })
    processingId = processingEntry.id
    console.log('[Upload] Created processing entry:', processingId)

    // Analyze the report with the selected company type
    console.log(`[Upload] Analyzing report as ${companyType}...`)
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

    // Update record as completed
    const storedAnalysis = analysisStore.update(processingId, {
      processed: true,
      processing: false,
      ...analysis,
    })

    console.log('[Upload] Analysis complete:', processingId)

    return NextResponse.json({
      success: true,
      analysis_id: processingId,
      company_type: companyType,
      metadata,
      analysis: storedAnalysis,
    })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    
    if (processingId) {
      analysisStore.update(processingId, {
        processing: false,
        processed: false,
        error: error.message || 'Analysis failed',
      })
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to process report' },
      { status: 500 }
    )
  }
}
