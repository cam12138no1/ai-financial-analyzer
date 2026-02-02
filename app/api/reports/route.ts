import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllCompanies, getReportsByCompany, getAnalysisByReportId } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await getAllCompanies()
    
    const companiesWithReports = await Promise.all(
      companies.map(async (company) => {
        const reports = await getReportsByCompany(company.id)
        
        const reportsWithAnalysis = await Promise.all(
          reports.map(async (report) => {
            const analysis = await getAnalysisByReportId(report.id)
            return {
              ...report,
              analysis: analysis?.analysis_content || null,
            }
          })
        )
        
        return {
          ...company,
          reports: reportsWithAnalysis,
        }
      })
    )

    return NextResponse.json({ companies: companiesWithReports })
  } catch (error: any) {
    console.error('Get reports error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
