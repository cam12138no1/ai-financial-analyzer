'use client'

import { useState } from 'react'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    symbol: '',
    reportType: '10-Q',
    fiscalYear: new Date().getFullYear(),
    fiscalQuarter: 1,
    filingDate: new Date().toISOString().split('T')[0],
    consensusRevenue: '',
    consensusEPS: '',
    consensusOperatingIncome: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('companyName', formData.companyName)
      uploadFormData.append('symbol', formData.symbol.toUpperCase())
      uploadFormData.append('reportType', formData.reportType)
      uploadFormData.append('fiscalYear', formData.fiscalYear.toString())
      uploadFormData.append('fiscalQuarter', formData.fiscalQuarter.toString())
      uploadFormData.append('filingDate', formData.filingDate)
      
      if (formData.consensusRevenue) {
        uploadFormData.append('consensusRevenue', formData.consensusRevenue)
      }
      if (formData.consensusEPS) {
        uploadFormData.append('consensusEPS', formData.consensusEPS)
      }
      if (formData.consensusOperatingIncome) {
        uploadFormData.append('consensusOperatingIncome', formData.consensusOperatingIncome)
      }

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      toast({
        title: 'Success',
        description: 'Report uploaded and analyzed successfully',
      })

      onSuccess()
      resetForm()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload report',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setFormData({
      companyName: '',
      symbol: '',
      reportType: '10-Q',
      fiscalYear: new Date().getFullYear(),
      fiscalQuarter: 1,
      filingDate: new Date().toISOString().split('T')[0],
      consensusRevenue: '',
      consensusEPS: '',
      consensusOperatingIncome: '',
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Financial Report</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Report Document
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Choose file
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                </label>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Apple Inc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Symbol
                </label>
                <Input
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="AAPL"
                  required
                />
              </div>
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                  required
                >
                  <option value="10-Q">10-Q (Quarterly)</option>
                  <option value="10-K">10-K (Annual)</option>
                  <option value="8-K">8-K (Current Report)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filing Date
                </label>
                <Input
                  type="date"
                  value={formData.filingDate}
                  onChange={(e) => setFormData({ ...formData, filingDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year
                </label>
                <Input
                  type="number"
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData({ ...formData, fiscalYear: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Quarter
                </label>
                <select
                  value={formData.fiscalQuarter}
                  onChange={(e) => setFormData({ ...formData, fiscalQuarter: parseInt(e.target.value) })}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md"
                >
                  <option value={1}>Q1</option>
                  <option value={2}>Q2</option>
                  <option value={3}>Q3</option>
                  <option value={4}>Q4</option>
                </select>
              </div>
            </div>

            {/* Consensus Data (Optional) */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Market Consensus (Optional)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    Revenue (M)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.consensusRevenue}
                    onChange={(e) => setFormData({ ...formData, consensusRevenue: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    EPS
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.consensusEPS}
                    onChange={(e) => setFormData({ ...formData, consensusEPS: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-2">
                    Op. Income (M)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.consensusOperatingIncome}
                    onChange={(e) => setFormData({ ...formData, consensusOperatingIncome: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
