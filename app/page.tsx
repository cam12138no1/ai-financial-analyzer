'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const { user, isLoading, setUserName } = useUser()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // 如果用户已登录，直接跳转到 dashboard
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setUserName(name.trim())
    
    // 短暂延迟后跳转
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI 金融工具</h1>
          <p className="text-gray-500 mt-2">AI驱动的财报分析平台</p>
        </div>

        {/* Name Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  请输入您的名称
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：张三"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  名称将保存在本地浏览器中
                </p>
              </div>

              <Button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    进入中...
                  </>
                ) : (
                  <>
                    开始使用
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl mb-1">🔷</div>
            <p className="text-sm font-medium text-gray-700">AI 应用公司</p>
            <p className="text-xs text-gray-500">Meta, Google...</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-2xl mb-1">💜</div>
            <p className="text-sm font-medium text-gray-700">AI 供应链公司</p>
            <p className="text-xs text-gray-500">NVIDIA, TSMC...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
