import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminReportListItem, ReportListResponse, ReportType, ReportStatus, UpdateReportStatusRequest } from '../../types/index'
import { Search, FileText, MessageSquare, User, Building2, AlertCircle, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { cx, formatDate } from '../../lib/utils'
import ReportDetailsModal from '../../components/admin/ReportDetailsModal'

type TypeTabType = 'all' | 'POST' | 'COMMENT' | 'USER' | 'BUSINESS'
type StatusTabType = 'all' | 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'

export default function ReportsPage() {
  const [reports, setReports] = useState<AdminReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTypeTab, setActiveTypeTab] = useState<TypeTabType>('all')
  const [activeStatusTab, setActiveStatusTab] = useState<StatusTabType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<{ id: string; type: ReportType } | null>(null)
  const limit = 20

  useEffect(() => {
    fetchReports()
  }, [activeTypeTab, activeStatusTab, page, searchTerm])

  const fetchReports = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add type filter based on tab
      if (activeTypeTab !== 'all') {
        params.append('type', activeTypeTab)
      }

      // Add status filter based on tab
      if (activeStatusTab !== 'all') {
        params.append('status', activeStatusTab)
      }

      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await apiClient.get<ReportListResponse>(`/admin/reports?${params.toString()}`)

      if (response.data.data) {
        setReports(response.data.data)
        setTotalCount(response.data.meta.total_count)
        setTotalPages(response.data.meta.total_pages)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to load reports'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
    fetchReports()
  }

  const handleTypeTabChange = (tab: TypeTabType) => {
    setActiveTypeTab(tab)
    setPage(1) // Reset to first page on tab change
  }

  const handleStatusTabChange = (tab: StatusTabType) => {
    setActiveStatusTab(tab)
    setPage(1) // Reset to first page on tab change
  }

  const handleStatusUpdate = async (reportId: string, reportType: ReportType, newStatus: ReportStatus) => {
    try {
      setUpdatingReportId(reportId)

      const requestBody: UpdateReportStatusRequest = {
        status: newStatus
      }

      await apiClient.put<ApiResponse>(`/admin/reports/${reportType}/${reportId}/status`, requestBody)

      toast.success('Report status updated successfully')

      // Refresh the reports list
      fetchReports()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update report status'
      toast.error(message)
    } finally {
      setUpdatingReportId(null)
    }
  }

  const handleViewDetails = (reportId: string, reportType: ReportType) => {
    setSelectedReport({ id: reportId, type: reportType })
    setIsDetailsModalOpen(true)
  }

  const getReportTypeIcon = (type: ReportType) => {
    switch (type) {
      case 'POST':
        return <FileText className="h-4 w-4" />
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4" />
      case 'USER':
        return <User className="h-4 w-4" />
      case 'BUSINESS':
        return <Building2 className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getReportTypeColor = (type: ReportType) => {
    switch (type) {
      case 'POST':
        return 'bg-brand-50 text-brand-700 border-brand-200'
      case 'COMMENT':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'USER':
        return 'bg-warning-50 text-warning-700 border-warning-200'
      case 'BUSINESS':
        return 'bg-success-50 text-success-700 border-success-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-3 w-3" />
      case 'REVIEWING':
        return <AlertCircle className="h-3 w-3" />
      case 'RESOLVED':
        return <CheckCircle className="h-3 w-3" />
      case 'REJECTED':
        return <XCircle className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning-50 text-warning-700 border-warning-200'
      case 'REVIEWING':
        return 'bg-brand-50 text-brand-700 border-brand-200'
      case 'RESOLVED':
        return 'bg-success-50 text-success-700 border-success-200'
      case 'REJECTED':
        return 'bg-error-50 text-error-700 border-error-200'
    }
  }

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-'
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-sm font-semibold text-gray-900">Reports Management</h1>
        <p className="text-gray-600 mt-2 text-md">Review and manage content reports from users</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by reporter, item, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-md placeholder:text-gray-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-brand-600 text-white rounded-lg shadow-xs hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 transition-all font-semibold text-md"
          >
            Search
          </button>
        </form>
      </div>

      {/* Type Tabs */}
      <div className="mb-5 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTypeTabChange('all')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTypeTab === 'all'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            All Types
          </button>
          <button
            onClick={() => handleTypeTabChange('POST')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTypeTab === 'POST'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </div>
          </button>
          <button
            onClick={() => handleTypeTabChange('COMMENT')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTypeTab === 'COMMENT'
                ? 'border-gray-600 text-gray-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments
            </div>
          </button>
          <button
            onClick={() => handleTypeTabChange('USER')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTypeTab === 'USER'
                ? 'border-warning-600 text-warning-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Users
            </div>
          </button>
          <button
            onClick={() => handleTypeTabChange('BUSINESS')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTypeTab === 'BUSINESS'
                ? 'border-success-600 text-success-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Businesses
            </div>
          </button>
        </nav>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleStatusTabChange('all')}
            className={cx(
              'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeStatusTab === 'all'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            All Status
          </button>
          <button
            onClick={() => handleStatusTabChange('PENDING')}
            className={cx(
              'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeStatusTab === 'PENDING'
                ? 'border-warning-600 text-warning-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </div>
          </button>
          <button
            onClick={() => handleStatusTabChange('REVIEWING')}
            className={cx(
              'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeStatusTab === 'REVIEWING'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Reviewing
            </div>
          </button>
          <button
            onClick={() => handleStatusTabChange('RESOLVED')}
            className={cx(
              'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeStatusTab === 'RESOLVED'
                ? 'border-success-600 text-success-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Resolved
            </div>
          </button>
          <button
            onClick={() => handleStatusTabChange('REJECTED')}
            className={cx(
              'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeStatusTab === 'REJECTED'
                ? 'border-error-600 text-error-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
            </div>
          </button>
        </nav>
      </div>

      {/* Results Count */}
      <div className="mb-5 text-sm text-gray-600 font-medium">
        Showing {reports.length} of {totalCount} reports
      </div>

      {/* Reports Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-600 font-medium">Loading reports...</div>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex items-center justify-center py-16 bg-white rounded-xl border border-gray-200 shadow-xs">
          <div className="text-gray-600 font-medium">No reports found</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reporter
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reported Item
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-xs',
                        getReportTypeColor(report.report_type)
                      )}>
                        {getReportTypeIcon(report.report_type)}
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {report.reporter_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.reporter_email || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900">
                          {truncateText(report.reported_item_info, 40)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {report.reported_item_id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900">
                          {truncateText(report.reason, 50)}
                        </div>
                        {report.additional_comments && (
                          <div className="text-xs text-gray-500 mt-1">
                            {truncateText(report.additional_comments, 60)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cx(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shadow-xs',
                        getStatusColor(report.status)
                      )}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(report.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(report.id, report.report_type)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        <select
                          value={report.status}
                          onChange={(e) => handleStatusUpdate(report.id, report.report_type, e.target.value as ReportStatus)}
                          disabled={updatingReportId === report.id}
                          className="text-sm border border-gray-300 rounded-lg px-3 py-2 shadow-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium text-gray-700"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWING">Reviewing</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700 font-medium">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={cx(
                    'px-4 py-2 rounded-lg border font-semibold text-sm shadow-xs transition-all',
                    page === 1
                      ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  )}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={cx(
                    'px-4 py-2 rounded-lg border font-semibold text-sm shadow-xs transition-all',
                    page === totalPages
                      ? 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          reportId={selectedReport.id}
          reportType={selectedReport.type}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  )
}
