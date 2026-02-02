'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { FileText, ChevronRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ReportListProps {
  onSelectAnalysis: (analysis: any) => void
  onRefresh: () => void
}

export default function ReportList({ onSelectAnalysis, onRefresh }: ReportListProps) {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/reports')
      const data = await response.json()
      
      if (data.companies) {
        const allReports = data.companies.flatMap((company: any) =>
          company.reports.map((report: any) => ({
            ...report,
            company_name: company.name,
            company_symbol: company.symbol,
          }))
        )
        
        setReports(allReports.sort((a: any, b: any) => 
          new Date(b.filing_date).getTime() - new Date(a.filing_date).getTime()
        ))
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
          <p className="text-gray-600">Upload your first financial report to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => {
                if (report.analysis) {
                  onSelectAnalysis({
                    ...report.analysis,
                    company_name: report.company_name,
                    company_symbol: report.company_symbol,
                    report_type: report.report_type,
                    fiscal_year: report.fiscal_year,
                    fiscal_quarter: report.fiscal_quarter,
                  })
                }
              }}
            >
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {report.company_name} ({report.company_symbol})
                  </h4>
                  <p className="text-sm text-gray-600">
                    {report.report_type} • {report.fiscal_quarter ? `Q${report.fiscal_quarter} ` : ''}
                    {report.fiscal_year} • Filed {format(new Date(report.filing_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {report.processed ? (
                  <Badge variant="success">Analyzed</Badge>
                ) : (
                  <Badge variant="outline">Processing</Badge>
                )}
                {report.analysis && (
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
