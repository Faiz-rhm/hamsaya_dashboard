import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminStatistics } from '../../types/index'
import { Users, FileText, Building2, AlertTriangle, UserCheck, UserX } from 'lucide-react'

export default function DashboardOverview() {
  const [stats, setStats] = useState<AdminStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get<ApiResponse<AdminStatistics>>('/admin/statistics')
      if (response.data.success && response.data.data) {
        setStats(response.data.data)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to load statistics'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading statistics...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No statistics available</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to Hamsaya Admin Dashboard</p>
      </div>

      {/* User Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats.total_users}
            icon={<Users className="h-8 w-8" />}
            bgColor="bg-blue-500"
          />
          <StatCard
            title="Active Users"
            value={stats.active_users}
            subtitle="Last 30 days"
            icon={<UserCheck className="h-8 w-8" />}
            bgColor="bg-green-500"
          />
          <StatCard
            title="Inactive Users"
            value={stats.inactive_users}
            icon={<UserX className="h-8 w-8" />}
            bgColor="bg-gray-500"
          />
        </div>
      </div>

      {/* Content Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Posts"
            value={stats.total_posts}
            icon={<FileText className="h-8 w-8" />}
            bgColor="bg-indigo-500"
          />
          <StatCard
            title="Feed Posts"
            value={stats.posts_by_type.feed}
            icon={<FileText className="h-6 w-6" />}
            bgColor="bg-purple-500"
          />
          <StatCard
            title="Event Posts"
            value={stats.posts_by_type.event}
            icon={<FileText className="h-6 w-6" />}
            bgColor="bg-orange-500"
          />
          <StatCard
            title="Sell Posts"
            value={stats.posts_by_type.sell}
            icon={<FileText className="h-6 w-6" />}
            bgColor="bg-yellow-500"
          />
          <StatCard
            title="Pull Posts"
            value={stats.posts_by_type.pull}
            icon={<FileText className="h-6 w-6" />}
            bgColor="bg-teal-500"
          />
          <StatCard
            title="Total Businesses"
            value={stats.total_businesses}
            icon={<Building2 className="h-8 w-8" />}
            bgColor="bg-cyan-500"
          />
        </div>
      </div>

      {/* Reports Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Pending"
            value={stats.pending_reports.total}
            icon={<AlertTriangle className="h-8 w-8" />}
            bgColor="bg-red-500"
          />
          <StatCard
            title="Post Reports"
            value={stats.pending_reports.posts}
            icon={<AlertTriangle className="h-6 w-6" />}
            bgColor="bg-red-400"
          />
          <StatCard
            title="Comment Reports"
            value={stats.pending_reports.comments}
            icon={<AlertTriangle className="h-6 w-6" />}
            bgColor="bg-orange-400"
          />
          <StatCard
            title="User Reports"
            value={stats.pending_reports.users}
            icon={<AlertTriangle className="h-6 w-6" />}
            bgColor="bg-yellow-400"
          />
          <StatCard
            title="Business Reports"
            value={stats.pending_reports.businesses}
            icon={<AlertTriangle className="h-6 w-6" />}
            bgColor="bg-pink-400"
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  bgColor: string
}

function StatCard({ title, value, subtitle, icon, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${bgColor} p-3 rounded-lg text-white`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
