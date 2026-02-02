import { NextRequest, NextResponse } from 'next/server'
import { analysisStore } from '@/lib/store'

export async function GET(request: NextRequest) {
  try {
    // 不再需要 session 验证

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    // Use in-memory store for demo mode
    const analyses = analysisStore.getAll().slice(0, limit)
    const processingCount = analysisStore.getProcessingCount()

    return NextResponse.json({ 
      analyses,
      recentAnalyses: analyses,  // 兼容汇总表页面
      processingCount,           // 正在处理的数量
      totalCount: analysisStore.size,
    })
  } catch (error: any) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
