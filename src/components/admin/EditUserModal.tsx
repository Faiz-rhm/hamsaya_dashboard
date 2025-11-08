import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { AdminUserListItem, AdminUpdateUserRequest } from '../../types'

interface EditUserModalProps {
  user: AdminUserListItem
  isOpen: boolean
  onClose: () => void
  onSave: (userId: string, data: AdminUpdateUserRequest) => Promise<void>
}

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<AdminUpdateUserRequest>({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    role: user.role || 'user',
    email_verified: user.email_verified,
    phone_verified: user.phone_verified,
    is_active: user.is_active,
    mfa_enabled: user.mfa_enabled,
  })
  const [loading, setLoading] = useState(false)

  // Reset form data when user changes
  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'user',
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      is_active: user.is_active,
      mfa_enabled: user.mfa_enabled,
    })
  }, [user])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(user.id, formData)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <p className="text-sm text-gray-600 mt-1">Update user information and permissions</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                  placeholder="user@example.com"
                />
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Verification Toggles */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Verification Status
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email_verified"
                      name="email_verified"
                      checked={formData.email_verified}
                      onChange={handleChange}
                      className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="email_verified" className="ml-3 text-sm font-medium text-gray-700">
                      Email Verified
                    </label>
                  </div>
                  {formData.email_verified && (
                    <span className="text-xs text-success-600 font-medium">Verified</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="phone_verified"
                      name="phone_verified"
                      checked={formData.phone_verified}
                      onChange={handleChange}
                      className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="phone_verified" className="ml-3 text-sm font-medium text-gray-700">
                      Phone Verified
                    </label>
                  </div>
                  {formData.phone_verified && (
                    <span className="text-xs text-success-600 font-medium">Verified</span>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Account Status
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="is_active" className="ml-3 text-sm font-medium text-gray-700">
                      Active Account
                    </label>
                  </div>
                  {formData.is_active ? (
                    <span className="text-xs text-success-600 font-medium">Active</span>
                  ) : (
                    <span className="text-xs text-error-600 font-medium">Inactive</span>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mfa_enabled"
                      name="mfa_enabled"
                      checked={formData.mfa_enabled}
                      onChange={handleChange}
                      className="h-4 w-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <label htmlFor="mfa_enabled" className="ml-3 text-sm font-medium text-gray-700">
                      MFA Enabled
                    </label>
                  </div>
                  {formData.mfa_enabled && (
                    <span className="text-xs text-brand-600 font-medium">Enabled</span>
                  )}
                </div>
              </div>

              {/* User ID (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User ID
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono">
                  {user.id}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
