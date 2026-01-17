import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getAuditLogs } from '@/lib/utils/audit'

// GET /api/admin/audit - Get audit logs (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId') || undefined
    const resource = searchParams.get('resource') || undefined

    const offset = (page - 1) * limit

    const logs = await getAuditLogs({
      userId,
      resource,
      limit,
      offset,
    })

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
