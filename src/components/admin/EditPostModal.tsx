import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import apiClient from '../../lib/api-client'
import type { AdminPostListItem, AdminUpdatePostRequest, PostType, PostVisibility, Poll, ApiResponse } from '../../types'

interface EditPostModalProps {
  post: AdminPostListItem
  isOpen: boolean
  onClose: () => void
  onSave: (postId: string, data: AdminUpdatePostRequest) => Promise<void>
}

export default function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [formData, setFormData] = useState<AdminUpdatePostRequest>({
    title: post.title || '',
    description: post.description || '',
    type: post.type,
    visibility: post.visibility,
    status: post.status,
    start_date: post.start_date || '',
    end_date: post.end_date || '',
  })
  const [loading, setLoading] = useState(false)
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loadingPoll, setLoadingPoll] = useState(false)

  // Reset form data when post changes
  useEffect(() => {
    setFormData({
      title: post.title || '',
      description: post.description || '',
      type: post.type,
      visibility: post.visibility,
      status: post.status,
      start_date: post.start_date || '',
      end_date: post.end_date || '',
    })
  }, [post])

  // Fetch poll data if post type is PULL
  useEffect(() => {
    const fetchPollData = async () => {
      if (post.type === 'PULL' && isOpen) {
        setLoadingPoll(true)
        try {
          const response = await apiClient.get<ApiResponse<Poll>>(`/posts/${post.id}/polls`)
          if (response.data.data) {
            setPoll(response.data.data)
          }
        } catch (error) {
          console.error('Failed to fetch poll data:', error)
          setPoll(null)
        } finally {
          setLoadingPoll(false)
        }
      } else {
        setPoll(null)
      }
    }

    fetchPollData()
  }, [post.id, post.type, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(post.id, formData)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
              <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
              <p className="text-sm text-gray-600 mt-1">Update post information</p>
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
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                  placeholder="Enter post title"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs resize-none"
                  placeholder="Enter post description"
                />
              </div>

              {/* Type and Visibility in a grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                  >
                    <option value="FEED">Feed</option>
                    <option value="EVENT">Event</option>
                    <option value="SELL">Sell</option>
                    <option value="PULL">Poll</option>
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <label htmlFor="visibility" className="block text-sm font-semibold text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="FRIENDS">Friends</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>

              {/* Status (editable) and Engagement Metrics (read-only) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Status Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.status ? 'bg-success-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.status ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-sm font-medium ${
                      formData.status ? 'text-success-700' : 'text-gray-600'
                    }`}>
                      {formData.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Engagement
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    <div className="flex gap-3">
                      <span title="Likes">{post.total_likes} 👍</span>
                      <span title="Comments">{post.total_comments} 💬</span>
                      <span title="Shares">{post.total_shares} 🔄</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poll Options (for PULL type posts) */}
              {post.type === 'PULL' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Poll Options
                  </label>
                  {loadingPoll ? (
                    <div className="px-3 py-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 text-center">
                      Loading poll data...
                    </div>
                  ) : poll && poll.options.length > 0 ? (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="text-xs font-medium text-gray-600">
                          Total Votes: {poll.total_votes}
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {poll.options.map((option, index) => (
                          <div key={option.id} className="px-3 py-2 bg-white hover:bg-gray-50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {index + 1}. {option.option_text}
                              </span>
                              <span className="text-xs font-semibold text-gray-700">
                                {option.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-brand-600 h-full rounded-full transition-all"
                                  style={{ width: `${option.percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 min-w-[3rem] text-right">
                                {option.vote_count} votes
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 text-center">
                      No poll data available
                    </div>
                  )}
                </div>
              )}

              {/* Event Dates (for EVENT type posts) */}
              {post.type === 'EVENT' && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-xs"
                    />
                  </div>
                </div>
              )}

              {/* Images/Attachments (read-only) */}
              {post.attachments && post.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images ({post.attachments.length})
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {post.attachments.map((photo, index) => (
                      <a
                        key={index}
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group block aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-brand-500 transition-colors"
                      >
                        <img
                          src={photo.url}
                          alt={photo.name || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                            View Full
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <div className="text-white text-xs">
                            {photo.width} × {photo.height}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  {post.business_name ? (
                    <div>
                      <div className="font-medium">{post.business_name}</div>
                      <div className="text-xs text-gray-500">Business ID: {post.business_id}</div>
                    </div>
                  ) : post.user_name ? (
                    <div>
                      <div className="font-medium">{post.user_name}</div>
                      <div className="text-xs text-gray-500">{post.user_email}</div>
                      <div className="text-xs text-gray-500">User ID: {post.user_id}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unknown Author</span>
                  )}
                </div>
              </div>

              {/* Timestamps (read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Created At
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Updated At
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                    {new Date(post.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Post ID (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Post ID
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-mono">
                  {post.id}
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
