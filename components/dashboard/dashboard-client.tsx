'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, FileText, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import UploadModal from './upload-modal'
import ReportList from './report-list'
import AnalysisView from './analysis-view'

export default function DashboardClient() {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [stats, setStats] = useState({
    totalReports: 0,
    companiesAnalyzed: 0,
    recentAnalyses: 0,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      
      if (data.analyses) {
        setStats({
          totalReports: data.analyses.length,
          companiesAnalyzed: new Set(data.analyses.map((a: any) => a.company_symbol)).size,
          recentAnalyses: data.analyses.filter((a: any) => {
            const createdDate = new Date(a.created_at)
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            return createdDate > weekAgo
          }).length,
        })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  if (selectedAnalysis) {
    return (
      <AnalysisView
        analysis={selectedAnalysis}
        onBack={() => setSelectedAnalysis(null)}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">Analyze and manage earnings reports</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Upload Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reports
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalReports}</div>
            <p className="text-xs text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Companies Analyzed
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.companiesAnalyzed}</div>
            <p className="text-xs text-gray-600 mt-1">Unique companies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Analyses
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.recentAnalyses}</div>
            <p className="text-xs text-gray-600 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <ReportList onSelectAnalysis={setSelectedAnalysis} onRefresh={loadDashboardData} />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false)
          loadDashboardData()
        }}
      />
    </div>
  )
}
