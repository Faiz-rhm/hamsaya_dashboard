import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminBusinessListItem, BusinessListResponse, UpdateBusinessStatusRequest } from '../../types/index'
import { Search, Building2, Mail, Phone, MapPin, Eye, Users, FileText, CheckCircle, XCircle } from 'lucide-react'
import { cx, formatDate, truncate } from '../../lib/utils'

type StatusTabType = 'all' | 'active' | 'inactive'

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<AdminBusinessListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<StatusTabType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingBusinessId, setUpdatingBusinessId] = useState<string | null>(null)
  const limit = 20

  useEffect(() => {
    fetchBusinesses()
  }, [activeTab, page, searchTerm])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add status filter based on tab
      if (activeTab !== 'all') {
        params.append('status', activeTab === 'active' ? 'true' : 'false')
      }

      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await apiClient.get<BusinessListResponse>(`/admin/businesses?${params.toString()}`)

      if (response.data.data) {
        setBusinesses(response.data.data)
        setTotalCount(response.data.meta.total_count)
        setTotalPages(response.data.meta.total_pages)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to load businesses'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
    fetchBusinesses()
  }

  const handleTabChange = (tab: StatusTabType) => {
    setActiveTab(tab)
    setPage(1) // Reset to first page on tab change
  }

  const handleStatusUpdate = async (businessId: string, newStatus: boolean) => {
    try {
      setUpdatingBusinessId(businessId)

      const requestBody: UpdateBusinessStatusRequest = {
        status: newStatus
      }

      await apiClient.put<ApiResponse>(`/admin/businesses/${businessId}/status`, requestBody)

      toast.success('Business status updated successfully')

      // Refresh the businesses list
      fetchBusinesses()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update business status'
      toast.error(message)
    } finally {
      setUpdatingBusinessId(null)
    }
  }

  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return '-'
    return truncate(text, maxLength)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Business Management</h1>
        <p className="text-gray-600 mt-2">Manage and verify business profiles</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, license, email, phone, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-xs font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Status Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('all')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'all'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            All Businesses
          </button>
          <button
            onClick={() => handleTabChange('active')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'active'
                ? 'border-success-600 text-success-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active
            </div>
          </button>
          <button
            onClick={() => handleTabChange('inactive')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'inactive'
                ? 'border-error-600 text-error-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Inactive
            </div>
          </button>
        </nav>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {businesses.length} of {totalCount} businesses
      </div>

      {/* Businesses Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading businesses...</div>
        </div>
      ) : businesses.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">No businesses found</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <div className="text-sm font-medium text-gray-900">
                            {truncateText(business.name, 30)}
                          </div>
                        </div>
                        {business.license_no && (
                          <div className="text-xs text-gray-500 mt-1">
                            License: {business.license_no}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {business.owner_name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {business.owner_email || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm space-y-1">
                        {business.email && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">{truncateText(business.email, 20)}</span>
                          </div>
                        )}
                        {business.phone_number && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">{business.phone_number}</span>
                          </div>
                        )}
                        {!business.email && !business.phone_number && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {business.province || business.district ? (
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="text-xs">
                              {[business.province, business.district].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="h-3 w-3" />
                          <span>{business.total_views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3 w-3" />
                          <span>{business.total_follow}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <FileText className="h-3 w-3" />
                          <span>{business.total_posts}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {business.status ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-success-50 text-success-700 border border-success-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-error-50 text-error-700 border border-error-200">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(business.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleStatusUpdate(business.id, !business.status)}
                        disabled={updatingBusinessId === business.id}
                        className={cx(
                          'px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs',
                          business.status
                            ? 'bg-error-50 text-error-700 hover:bg-error-100 border border-error-200'
                            : 'bg-success-50 text-success-700 hover:bg-success-100 border border-success-200',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                      >
                        {updatingBusinessId === business.id
                          ? 'Updating...'
                          : business.status
                          ? 'Deactivate'
                          : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded border ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded border ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
