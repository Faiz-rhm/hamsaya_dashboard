import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminUserListItem, UserListResponse, UpdateUserStatusRequest, AdminUpdateUserRequest } from '../../types/index'
import { Search, UserCheck, UserX, Mail, Shield, CheckCircle, XCircle, Edit } from 'lucide-react'
import { cx, formatDate } from '../../lib/utils'
import EditUserModal from '../../components/admin/EditUserModal'

type TabType = 'all' | 'active' | 'inactive'

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null)
  const limit = 20

  const fetchUsers = async (tab?: TabType) => {
    try {
      setLoading(true)

      // Use provided tab or current activeTab
      const currentTab = tab !== undefined ? tab : activeTab

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add active filter based on tab
      if (currentTab === 'active') {
        params.append('is_active', 'true')
      } else if (currentTab === 'inactive') {
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

  useEffect(() => {
    fetchUsers()
  }, [activeTab, page, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
    fetchUsers()
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(1) // Reset to first page on tab change
    // Explicitly fetch with the new tab to avoid stale closure
    fetchUsers(tab)
  }

  const handleStatusUpdate = async (userId: string, newStatus: boolean) => {
    try {
      const request: UpdateUserStatusRequest = { is_active: newStatus }
      await apiClient.put<ApiResponse>(`/admin/users/${userId}/status`, request)

      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`)
      fetchUsers() // Refresh the list
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update user status'
      toast.error(message)
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
      fetchUsers() // Refresh the list
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update user'
      toast.error(message)
      throw error // Re-throw so modal can handle it
    }
  }

  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const getFullName = (user: AdminUserListItem) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.first_name) return user.first_name
    if (user.last_name) return user.last_name
    return '-'
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor all users in the system</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name..."
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

      {/* Tabs */}
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
            All Users
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
              <UserCheck className="h-4 w-4" />
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
              <UserX className="h-4 w-4" />
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
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
                      <div className="text-sm font-medium text-gray-900">{getFullName(user)}</div>
                      <div className="text-xs text-gray-500">{user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1">
                          {user.email_verified ? (
                            <CheckCircle className="h-3 w-3 text-success-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={user.email_verified ? 'text-success-700' : 'text-gray-500'}>
                            Email
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {user.phone_verified ? (
                            <CheckCircle className="h-3 w-3 text-success-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className={user.phone_verified ? 'text-success-700' : 'text-gray-500'}>
                            Phone
                          </span>
                        </div>
                        {user.mfa_enabled && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 text-brand-600" />
                            <span className="text-brand-700">MFA</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cx(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-md border',
                        user.role === 'ADMIN'
                          ? 'bg-brand-50 text-brand-700 border-brand-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
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
                        {user.is_active ? (
                          <button
                            onClick={() => handleStatusUpdate(user.id, false)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs bg-error-50 text-error-700 hover:bg-error-100 border border-error-200"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusUpdate(user.id, true)}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs bg-success-50 text-success-700 hover:bg-success-100 border border-success-200"
                          >
                            Activate
                          </button>
                        )}
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
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
