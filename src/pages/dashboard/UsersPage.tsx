import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminUserListItem, UserListResponse, UpdateUserStatusRequest, AdminUpdateUserRequest } from '../../types/index'
import { Search, User, Mail, Calendar, Eye, EyeOff, Edit, CheckCircle2, XCircle } from 'lucide-react'
import { cx, formatDate } from '../../lib/utils'

type FilterType = 'all' | 'active' | 'inactive'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null)
  const limit = 20

  useEffect(() => {
    fetchUsers()
  }, [activeFilter, page, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add active filter
      if (activeFilter === 'active') {
        params.append('is_active', 'true')
      } else if (activeFilter === 'inactive') {
        params.append('is_active', 'false')
      }

      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await apiClient.get<UserListResponse>(`/admin/users?${params.toString()}`)

      if (response.data.data) {
        setUsers(response.data.data)
        setTotalCount(response.data.meta.total_count)
        setTotalPages(response.data.meta.total_pages)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to load users'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
    fetchUsers()
  }

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    setPage(1) // Reset to first page on filter change
  }

  const handleStatusUpdate = async (userId: string, newStatus: boolean) => {
    try {
      setUpdatingUserId(userId)

      const requestBody: UpdateUserStatusRequest = {
        is_active: newStatus
      }

      await apiClient.put<ApiResponse>(`/admin/users/${userId}/status`, requestBody)

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)

      // Refresh the users list
      fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update user status'
      toast.error(message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleEditClick = (user: AdminUserListItem) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async (userId: string, data: AdminUpdateUserRequest) => {
    try {
      await apiClient.put<ApiResponse>(`/admin/users/${userId}`, data)
      toast.success('User updated successfully')
      setIsEditModalOpen(false)
      fetchUsers()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update user'
      toast.error(message)
      throw error
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor platform users</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, first name, or last name..."
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

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleFilterChange('all')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeFilter === 'all'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            All Users
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeFilter === 'active'
                ? 'border-success-600 text-success-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Active
            </div>
          </button>
          <button
            onClick={() => handleFilterChange('inactive')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeFilter === 'inactive'
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
        Showing {users.length} of {totalCount} users
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">No users found</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-brand-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.first_name || user.last_name || 'No Name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phone_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cx(
                        'inline-flex px-2 py-0.5 rounded-md text-xs font-medium border',
                        user.role === 'ADMIN'
                          ? 'bg-error-50 text-error-700 border-error-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-success-50 text-success-700 border border-success-200">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-error-50 text-error-700 border border-error-200">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(user.id, !user.is_active)}
                          disabled={updatingUserId === user.id}
                          className={cx(
                            'px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs',
                            user.is_active
                              ? 'bg-error-50 text-error-700 hover:bg-error-100 border border-error-200'
                              : 'bg-success-50 text-success-700 hover:bg-success-100 border border-success-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          {updatingUserId === user.id
                            ? 'Updating...'
                            : user.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </div>
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

      {/* Edit User Modal */}
      {selectedUser && isEditModalOpen && (
        <EditUserModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({
  user,
  isOpen,
  onClose,
  onSave
}: {
  user: AdminUserListItem
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, data: AdminUpdateUserRequest) => Promise<void>
}) {
  const [formData, setFormData] = useState<AdminUpdateUserRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email,
    phone_number: user.phone_number || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(user.id, formData)
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name || ''}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name || ''}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone_number || ''}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-brand-600 rounded-md hover:bg-brand-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
