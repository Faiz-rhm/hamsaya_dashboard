import { useState, useEffect } from 'react'
import { X, User, FileText, MessageSquare, Building2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type {
  ReportType,
  ReportStatus,
  PostReportDetail,
  CommentReportDetail,
  UserReportDetail,
  BusinessReportDetail
} from '../../types/index'
import { formatDate } from '../../lib/utils'
import apiClient from '../../lib/api-client'
import type { ApiResponse } from '../../types/index'

interface ReportDetailsModalProps {
  reportId: string
  reportType: ReportType
  isOpen: boolean
  onClose: () => void
}

type ReportDetail = PostReportDetail | CommentReportDetail | UserReportDetail | BusinessReportDetail

export default function ReportDetailsModal({ reportId, reportType, isOpen, onClose }: ReportDetailsModalProps) {
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && reportId && reportType) {
      fetchReportDetails()
    }
  }, [isOpen, reportId, reportType])

  const fetchReportDetails = async () => {
    try {
      setLoading(true)
      const endpoint = getEndpointForType(reportType)
      const response = await apiClient.get<ApiResponse<ReportDetail>>(`/admin/reports/${endpoint}/${reportId}`)

      if (response.data.success && response.data.data) {
        setReport(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch report details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEndpointForType = (type: ReportType): string => {
    switch (type) {
      case 'POST': return 'posts'
      case 'COMMENT': return 'comments'
      case 'USER': return 'users'
      case 'BUSINESS': return 'businesses'
      default: return 'posts'
    }
  }

  const getReportTypeIcon = () => {
    switch (reportType) {
      case 'POST':
        return <FileText className="h-5 w-5 text-brand-600" />
      case 'COMMENT':
        return <MessageSquare className="h-5 w-5 text-gray-600" />
      case 'USER':
        return <User className="h-5 w-5 text-warning-600" />
      case 'BUSINESS':
        return <Building2 className="h-5 w-5 text-success-600" />
    }
  }

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'REVIEWING':
        return <AlertCircle className="h-4 w-4" />
      case 'RESOLVED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
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

  const renderReportDetails = () => {
    if (!report) return null

    return (
      <div className="space-y-4">
        {/* Status Badge */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold border shadow-xs ${getStatusColor(report.status)}`}>
            {getStatusIcon(report.status)}
            {report.status}
          </span>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
          <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            {report.reason}
          </p>
        </div>

        {/* Additional Comments/Description */}
        {'additional_comments' in report && report.additional_comments && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
            <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
              {report.additional_comments}
            </p>
          </div>
        )}

        {'description' in report && report.description && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 whitespace-pre-wrap">
              {report.description}
            </p>
          </div>
        )}

        {/* Reported Item ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reported Item ID</label>
          <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 font-mono text-sm">
            {'post_id' in report && report.post_id}
            {'comment_id' in report && report.comment_id}
            {'reported_user' in report && report.reported_user}
            {'business_id' in report && report.business_id}
          </p>
        </div>

        {/* Reporter ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reporter ID</label>
          <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 font-mono text-sm">
            {'user_id' in report && report.user_id}
            {'reported_by_id' in report && report.reported_by_id}
          </p>
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
            <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-sm">
              {formatDate(report.created_at)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
            <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-sm">
              {formatDate(report.updated_at)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getReportTypeIcon()}
            <h2 className="text-xl font-bold text-gray-900">
              {reportType} Report Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading report details...</div>
            </div>
          ) : (
            renderReportDetails()
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
