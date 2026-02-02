'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Upload, Loader2, FileText, CheckCircle2, AlertCircle, Trash2, Cpu, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/toaster'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type CompanyType = 'ai_application' | 'ai_supply_chain'

interface FileWithStatus {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const t = useTranslations()
  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [companyType, setCompanyType] = useState<CompanyType>('ai_application')
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const validFiles: FileWithStatus[] = []
    const invalidFiles: string[] = []

    Array.from(newFiles).forEach((file) => {
      if (file.type === 'application/pdf') {
        if (!files.some(f => f.file.name === file.name)) {
          validFiles.push({
            file,
            id: `${file.name}_${Date.now()}_${Math.random()}`,
            status: 'pending',
          })
        }
      } else {
        invalidFiles.push(file.name)
      }
    })

    if (invalidFiles.length > 0) {
      toast({
        title: t('common.error'),
        description: `仅支持 PDF 文件: ${invalidFiles.join(', ')}`,
        variant: 'destructive',
      })
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files?.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
    }
    e.target.value = ''
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: t('common.error'),
        description: '请选择要上传的文件',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    
    // 关闭模态框
    onClose()

    toast({
      title: '📤 正在上传',
      description: `${files.length} 份财报正在提交...`,
    })

    const pendingFiles = [...files]
    let submitted = 0
    let failed = 0

    // 并发上传所有文件（API 会立即返回）
    const uploadFile = async (fileItem: FileWithStatus) => {
      try {
        const formData = new FormData()
        formData.append('file', fileItem.file)
        formData.append('companyType', companyType)

        const response = await fetch('/api/reports/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Upload failed')
        }

        submitted++
        console.log(`[Upload] Submitted ${fileItem.file.name}`)
      } catch (error: any) {
        failed++
        console.error(`[Upload] Failed ${fileItem.file.name}:`, error)
      }
    }

    // 并发上传所有文件
    await Promise.all(pendingFiles.map(uploadFile))

    // 显示提交结果
    if (failed === 0) {
      toast({
        title: '✅ 已提交分析',
        description: `${submitted} 份财报已提交，AI 正在后台分析中...`,
      })
    } else {
      toast({
        title: '⚠️ 部分提交失败',
        description: `成功 ${submitted}，失败 ${failed}`,
        variant: 'destructive',
      })
    }

    // 刷新列表
    setFiles([])
    setIsSubmitting(false)
    onSuccess()
  }

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">批量上传财报</h2>
              <p className="text-blue-100 text-sm mt-1">支持多文件拖拽上传，AI自动分析归档</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Company Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">选择公司类型</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompanyType('ai_application')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  companyType === 'ai_application'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  companyType === 'ai_application' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  <Layers className={`h-5 w-5 ${companyType === 'ai_application' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${companyType === 'ai_application' ? 'text-blue-700' : 'text-gray-700'}`}>
                    AI 应用公司
                  </p>
                  <p className="text-xs text-gray-500">Meta, Google, Microsoft...</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCompanyType('ai_supply_chain')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  companyType === 'ai_supply_chain'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  companyType === 'ai_supply_chain' ? 'bg-purple-500' : 'bg-gray-200'
                }`}>
                  <Cpu className={`h-5 w-5 ${companyType === 'ai_supply_chain' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${companyType === 'ai_supply_chain' ? 'text-purple-700' : 'text-gray-700'}`}>
                    AI 供应链公司
                  </p>
                  <p className="text-xs text-gray-500">NVIDIA, TSMC, AMD...</p>
                </div>
              </button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div 
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-3">
                <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center transition-all ${
                  dragActive ? 'bg-blue-200 scale-110' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                }`}>
                  <Upload className={`h-8 w-8 transition-colors ${dragActive ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    拖拽文件到此处或 <span className="text-blue-600">点击选择</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    支持批量上传 PDF 格式财报
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  已选择 {files.length} 个文件
                </span>
                <span className="text-gray-500">
                  共 {(totalSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {files.map((fileItem) => (
                  <div 
                    key={fileItem.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      fileItem.status === 'success' ? 'bg-green-100' :
                      fileItem.status === 'error' ? 'bg-red-100' :
                      fileItem.status === 'uploading' ? 'bg-blue-100' : 'bg-gray-200'
                    }`}>
                      {fileItem.status === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : fileItem.status === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : fileItem.status === 'uploading' ? (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    {fileItem.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => removeFile(fileItem.id)}
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Info */}
          <div className={`border rounded-xl p-4 ${
            companyType === 'ai_application' 
              ? 'bg-blue-50 border-blue-200' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                companyType === 'ai_application' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                {companyType === 'ai_application' ? (
                  <Layers className="h-4 w-4 text-blue-600" />
                ) : (
                  <Cpu className="h-4 w-4 text-purple-600" />
                )}
              </div>
              <div className="text-sm">
                <p className={`font-medium ${companyType === 'ai_application' ? 'text-blue-900' : 'text-purple-900'}`}>
                  {companyType === 'ai_application' ? 'AI 应用公司分析模式' : 'AI 供应链公司分析模式'}
                </p>
                <p className={companyType === 'ai_application' ? 'text-blue-700' : 'text-purple-700'}>
                  {companyType === 'ai_application' 
                    ? '关注用户增长、变现效率、AI赋能指标' 
                    : '关注产能、良率、ASP、客户集中度、库存周期'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-6"
            >
              取消
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={files.length === 0 || isSubmitting}
              className={`px-8 ${
                companyType === 'ai_application'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  开始分析 ({files.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
