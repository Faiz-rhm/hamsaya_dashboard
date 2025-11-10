import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse } from '../../types/index'
import { User, Mail, Phone, Save, LogOut, Shield } from 'lucide-react'

interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
}

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  })

  const handleSave = async () => {
    try {
      setSaving(true)

      const updateData: UpdateProfileRequest = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
      }

      await apiClient.put<ApiResponse>('/users/profile', updateData)

      toast.success('Profile updated successfully')
      setIsEditing(false)

      // Refresh the page to get updated user data
      window.location.reload()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Badge */}
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-brand-600" />
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
              Administrator
            </span>
          </div>

          {/* First Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{user?.first_name || '-'}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4" />
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{user?.last_name || '-'}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <p className="text-gray-900 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
              {user?.email || '-'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{user?.phone_number || '-'}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium shadow-xs"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
        </div>

        <div className="p-6">
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors font-medium shadow-xs"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Sign out of your admin account
          </p>
        </div>
      </div>
    </div>
  )
}
