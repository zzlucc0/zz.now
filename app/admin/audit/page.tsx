import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'

interface SearchParams {
  page?: string
}

async function getAuditLogs(page: number) {
  const pageSize = 50
  const skip = (page - 1) * pageSize

  const res = await fetch(
    `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/admin/audit?page=${page}&pageSize=${pageSize}`,
    {
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    return { logs: [], total: 0, page, pageSize, totalPages: 0 }
  }

  return res.json()
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const page = parseInt(searchParams.page || '1')
  const { logs, total, totalPages } = await getAuditLogs(page)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📋 Audit Logs</h1>
        <p className="text-gray-600">
          Track all admin actions and system events
        </p>
      </div>

      {/* Quick Links */}
      <div className="mb-8 flex gap-4">
        <Link
          href="/admin/moderation"
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          ← Back to Moderation
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>{total}</strong> total audit entries
        </p>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {log.user ? (
                        <Link
                          href={`/users/${log.user.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {log.user.displayName || log.user.username}
                        </Link>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          log.action.includes('DELETE')
                            ? 'bg-red-100 text-red-800'
                            : log.action.includes('UPDATE')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">{log.resource}</p>
                        {log.resourceId && (
                          <p className="text-xs text-gray-500">
                            ID: {log.resourceId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm max-w-md">
                      {log.metadata && (
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:underline">
                            View Details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                      {log.ipAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          IP: {log.ipAddress}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/audit?page=${page - 1}`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              let pageNum
              if (totalPages <= 10) {
                pageNum = i + 1
              } else if (page <= 5) {
                pageNum = i + 1
              } else if (page > totalPages - 5) {
                pageNum = totalPages - 9 + i
              } else {
                pageNum = page - 4 + i
              }

              return (
                <Link
                  key={pageNum}
                  href={`/admin/audit?page=${pageNum}`}
                  className={`px-4 py-2 border rounded-lg ${
                    pageNum === page
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            })}
          </div>

          {page < totalPages && (
            <Link
              href={`/admin/audit?page=${page + 1}`}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
