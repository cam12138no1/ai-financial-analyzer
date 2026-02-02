import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { 
  createCompany, 
  createFinancialReport, 
  createAnalysisResult,
  getCompanyBySymbol,
  updateReportProcessed 
} from '@/lib/db/queries'
import { extractTextFromDocument } from '@/lib/document-parser'
import { analyzeFinancialReport } from '@/lib/ai/analyzer'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const companyName = formData.get('companyName') as string
    const symbol = formData.get('symbol') as string
    const reportType = formData.get('reportType') as string
    const fiscalYear = parseInt(formData.get('fiscalYear') as string)
    const fiscalQuarter = formData.get('fiscalQuarter') ? 
      parseInt(formData.get('fiscalQuarter') as string) : undefined
    const filingDate = new Date(formData.get('filingDate') as string)
    
    // Consensus data (optional)
    const consensusRevenue = formData.get('consensusRevenue') ? 
      parseFloat(formData.get('consensusRevenue') as string) : undefined
    const consensusEPS = formData.get('consensusEPS') ? 
      parseFloat(formData.get('consensusEPS') as string) : undefined
    const consensusOperatingIncome = formData.get('consensusOperatingIncome') ? 
      parseFloat(formData.get('consensusOperatingIncome') as string) : undefined

    if (!file || !companyName || !symbol || !reportType || !fiscalYear || !filingDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload file to Vercel Blob
    const buffer = Buffer.from(await file.arrayBuffer())
    const blob = await put(`reports/${symbol}/${fiscalYear}/${file.name}`, buffer, {
      access: 'public',
    })

    // Get or create company
    let company = await getCompanyBySymbol(symbol)
    if (!company) {
      company = await createCompany({
        symbol,
        name: companyName,
      })
    }

    // Create financial report record
    const report = await createFinancialReport({
      company_id: company.id,
      report_type: reportType,
      fiscal_year: fiscalYear,
      fiscal_quarter: fiscalQuarter,
      filing_date: filingDate,
      document_url: blob.url,
      document_size: buffer.length,
    })

    // Extract text from document
    const reportText = await extractTextFromDocument(buffer, file.type)

    // Analyze with AI
    const analysis = await analyzeFinancialReport(reportText, {
      company: companyName,
      symbol,
      period: fiscalQuarter ? `Q${fiscalQuarter} ${fiscalYear}` : `FY ${fiscalYear}`,
      fiscalYear,
      fiscalQuarter,
      consensus: {
        revenue: consensusRevenue,
        eps: consensusEPS,
        operatingIncome: consensusOperatingIncome,
      },
    })

    // Save analysis result
    const analysisResult = await createAnalysisResult({
      report_id: report.id,
      analysis_type: 'comprehensive',
      analysis_content: analysis,
      key_insights: {
        one_line_conclusion: analysis.one_line_conclusion,
        results_vs_expectations: analysis.results_vs_expectations,
      },
      risk_factors: analysis.sustainability_risks,
      model_impact: analysis.model_impact,
    })

    // Mark report as processed
    await updateReportProcessed(report.id, true)

    return NextResponse.json({
      success: true,
      report_id: report.id,
      analysis_id: analysisResult.id,
      analysis,
    })
  } catch (error: any) {
    console.error('Upload and analyze error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process report' },
      { status: 500 }
    )
  }
}
