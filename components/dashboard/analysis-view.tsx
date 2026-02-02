'use client'

import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatNumber, getBeatMissVariant } from '@/lib/utils'

interface AnalysisViewProps {
  analysis: any
  onBack: () => void
}

export default function AnalysisView({ analysis, onBack }: AnalysisViewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {analysis.company_name} ({analysis.company_symbol})
          </h1>
          <p className="text-gray-600 mt-1">
            {analysis.report_type} • {analysis.fiscal_quarter ? `Q${analysis.fiscal_quarter} ` : ''}
            {analysis.fiscal_year}
          </p>
        </div>
      </div>

      {/* One Line Conclusion */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <CardTitle className="text-lg">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-gray-900">
            {analysis.one_line_conclusion}
          </p>
        </CardContent>
      </Card>

      {/* Results vs Expectations */}
      <Card>
        <CardHeader>
          <CardTitle>Results vs Market Expectations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenue */}
            <div className="metric-card">
              <div className="data-label">Revenue</div>
              <div className="data-value">
                {formatNumber(analysis.results_vs_expectations.revenue.actual * 1e6)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  vs Consensus: {formatNumber(analysis.results_vs_expectations.revenue.consensus * 1e6)}
                </span>
                <Badge variant={getBeatMissVariant(analysis.results_vs_expectations.revenue.difference)}>
                  {analysis.results_vs_expectations.revenue.difference > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatNumber(analysis.results_vs_expectations.revenue.difference * 1e6)}
                </Badge>
              </div>
            </div>

            {/* EPS */}
            <div className="metric-card">
              <div className="data-label">EPS</div>
              <div className="data-value">
                ${analysis.results_vs_expectations.eps.actual.toFixed(2)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  vs Consensus: ${analysis.results_vs_expectations.eps.consensus.toFixed(2)}
                </span>
                <Badge variant={getBeatMissVariant(analysis.results_vs_expectations.eps.difference)}>
                  {analysis.results_vs_expectations.eps.difference > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  ${analysis.results_vs_expectations.eps.difference.toFixed(2)}
                </Badge>
              </div>
            </div>

            {/* Operating Income */}
            <div className="metric-card">
              <div className="data-label">Operating Income</div>
              <div className="data-value">
                {formatNumber(analysis.results_vs_expectations.operating_income.actual * 1e6)}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  vs Consensus: {formatNumber(analysis.results_vs_expectations.operating_income.consensus * 1e6)}
                </span>
                <Badge variant={getBeatMissVariant(analysis.results_vs_expectations.operating_income.difference)}>
                  {analysis.results_vs_expectations.operating_income.difference > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {formatNumber(analysis.results_vs_expectations.operating_income.difference * 1e6)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Guidance */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Guidance</h4>
            <p className="text-gray-700">{analysis.results_vs_expectations.guidance}</p>
          </div>
        </CardContent>
      </Card>

      {/* Key Drivers */}
      <Card>
        <CardHeader>
          <CardTitle>Key Growth Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Demand */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">A. Demand / Volume</h4>
              <div className="pl-4 space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Metrics: </span>
                  <span className="text-gray-600">{analysis.key_drivers.demand.metrics}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Changes: </span>
                  <span className="text-gray-600">{analysis.key_drivers.demand.changes}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reasons: </span>
                  <span className="text-gray-600">{analysis.key_drivers.demand.reasons}</span>
                </div>
              </div>
            </div>

            {/* Monetization */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">B. Monetization / Pricing</h4>
              <div className="pl-4 space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Metrics: </span>
                  <span className="text-gray-600">{analysis.key_drivers.monetization.metrics}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Changes: </span>
                  <span className="text-gray-600">{analysis.key_drivers.monetization.changes}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reasons: </span>
                  <span className="text-gray-600">{analysis.key_drivers.monetization.reasons}</span>
                </div>
              </div>
            </div>

            {/* Efficiency */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">C. Operational Efficiency</h4>
              <div className="pl-4 space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Metrics: </span>
                  <span className="text-gray-600">{analysis.key_drivers.efficiency.metrics}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Changes: </span>
                  <span className="text-gray-600">{analysis.key_drivers.efficiency.changes}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Reasons: </span>
                  <span className="text-gray-600">{analysis.key_drivers.efficiency.reasons}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment & ROI */}
      <Card>
        <CardHeader>
          <CardTitle>Investment & ROI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-900">Investments: </span>
              <span className="text-gray-700">{analysis.investment_roi.investments}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Direction: </span>
              <span className="text-gray-700">{analysis.investment_roi.direction}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">ROI Evidence: </span>
              <span className="text-gray-700">{analysis.investment_roi.roi_evidence}</span>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="font-medium text-gray-900">Management Commitment: </span>
              <span className="text-gray-700">{analysis.investment_roi.management_commitment}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sustainability & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Sustainable Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.sustainability_risks.sustainable_drivers.map((driver: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">{driver}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              Main Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.sustainability_risks.main_risks.map((risk: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3" />
                  <span className="text-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Checkpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Future Checkpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.sustainability_risks.checkpoints.map((checkpoint: string, idx: number) => (
              <div key={idx} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-3 flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-gray-700">{checkpoint}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Model Impact & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Assumption Changes</h4>
              <p className="text-gray-700">{analysis.model_impact.assumption_changes}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Logic Chain</h4>
              <p className="text-gray-700">{analysis.model_impact.logic_chain}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Judgment */}
      <Card className="border-l-4 border-l-purple-600">
        <CardHeader>
          <CardTitle>Investment Committee Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 text-lg leading-relaxed">
            {analysis.final_judgment}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
