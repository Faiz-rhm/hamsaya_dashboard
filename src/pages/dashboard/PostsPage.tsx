import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import apiClient from '../../lib/api-client'
import type { ApiResponse, AdminPostListItem, PostListResponse, PostType, UpdatePostStatusRequest, AdminUpdatePostRequest } from '../../types/index'
import { Search, FileText, Calendar, ShoppingBag, MessageSquare, ThumbsUp, Share2, Eye, EyeOff, Edit, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, DollarSign } from 'lucide-react'
import { cx, formatDate, truncate } from '../../lib/utils'
import EditPostModal from '../../components/admin/EditPostModal'

type TabType = 'all' | 'FEED' | 'EVENT' | 'SELL' | 'PULL'

interface SellStatistics {
  total_sell_posts: number
  total_sold: number
  total_active: number
  total_expired: number
  total_revenue: number
  average_price: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<AdminPostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingPostId, setUpdatingPostId] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<AdminPostListItem | null>(null)
  const [sellStats, setSellStats] = useState<SellStatistics | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const limit = 20

  useEffect(() => {
    fetchPosts()
    if (activeTab === 'SELL') {
      fetchSellStatistics()
    }
  }, [activeTab, page, searchTerm])

  const fetchSellStatistics = async () => {
    try {
      setStatsLoading(true)
      const response = await apiClient.get<ApiResponse<SellStatistics>>('/admin/posts/sell/statistics')
      if (response.data.data) {
        setSellStats(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load sell statistics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      // Add type filter based on tab
      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }

      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await apiClient.get<PostListResponse>(`/admin/posts?${params.toString()}`)

      if (response.data.data) {
        setPosts(response.data.data)
        setTotalCount(response.data.meta.total_count)
        setTotalPages(response.data.meta.total_pages)
      }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to load posts'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
    fetchPosts()
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(1) // Reset to first page on tab change
  }

  const handleStatusUpdate = async (postId: string, newStatus: boolean) => {
    try {
      setUpdatingPostId(postId)

      const requestBody: UpdatePostStatusRequest = {
        status: newStatus
      }

      await apiClient.put<ApiResponse>(`/admin/posts/${postId}/status`, requestBody)

      toast.success('Post status updated successfully')

      // Refresh the posts list
      fetchPosts()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update post status'
      toast.error(message)
    } finally {
      setUpdatingPostId(null)
    }
  }

  const handleEditClick = (post: AdminPostListItem) => {
    setSelectedPost(post)
    setIsEditModalOpen(true)
  }

  const handleEditSave = async (postId: string, data: AdminUpdatePostRequest) => {
    try {
      await apiClient.put<ApiResponse>(`/admin/posts/${postId}`, data)
      toast.success('Post updated successfully')
      fetchPosts()
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to update post'
      toast.error(message)
      throw error
    }
  }

  const getPostTypeIcon = (type: PostType) => {
    switch (type) {
      case 'FEED':
        return <FileText className="h-4 w-4" />
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      case 'SELL':
        return <ShoppingBag className="h-4 w-4" />
      case 'PULL':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getPostTypeColor = (type: PostType) => {
    switch (type) {
      case 'FEED':
        return 'bg-brand-50 text-brand-700 border-brand-200'
      case 'EVENT':
        return 'bg-warning-50 text-warning-700 border-warning-200'
      case 'SELL':
        return 'bg-success-50 text-success-700 border-success-200'
      case 'PULL':
        return 'bg-error-50 text-error-700 border-error-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
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
        <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
        <p className="text-gray-600 mt-2">View and manage all posts in the system</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, user, or business..."
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
            All Posts
          </button>
          <button
            onClick={() => handleTabChange('FEED')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'FEED'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Feed
            </div>
          </button>
          <button
            onClick={() => handleTabChange('EVENT')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'EVENT'
                ? 'border-warning-600 text-warning-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </div>
          </button>
          <button
            onClick={() => handleTabChange('SELL')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'SELL'
                ? 'border-success-600 text-success-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Marketplace
            </div>
          </button>
          <button
            onClick={() => handleTabChange('PULL')}
            className={cx(
              'py-4 px-1 border-b-2 font-semibold text-sm transition-colors',
              activeTab === 'PULL'
                ? 'border-error-600 text-error-700'
                : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Polls
            </div>
          </button>
        </nav>
      </div>

      {/* Sell Statistics */}
      {activeTab === 'SELL' && (
        <div className="mb-6">
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading statistics...</div>
            </div>
          ) : sellStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Total Sell Posts */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{sellStats.total_sell_posts}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-brand-600" />
                  </div>
                </div>
              </div>

              {/* Total Sold */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Sold</p>
                    <p className="text-2xl font-bold text-success-700 mt-1">{sellStats.total_sold}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {sellStats.total_sell_posts > 0
                        ? `${((sellStats.total_sold / sellStats.total_sell_posts) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-success-50 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-600" />
                  </div>
                </div>
              </div>

              {/* Active/Not Sold */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-brand-700 mt-1">{sellStats.total_active}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {sellStats.total_sell_posts > 0
                        ? `${((sellStats.total_active / sellStats.total_sell_posts) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-brand-600" />
                  </div>
                </div>
              </div>

              {/* Expired */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-error-700 mt-1">{sellStats.total_expired}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {sellStats.total_sell_posts > 0
                        ? `${((sellStats.total_expired / sellStats.total_sell_posts) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-error-50 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-error-600" />
                  </div>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${sellStats.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-warning-50 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-warning-600" />
                  </div>
                </div>
              </div>

              {/* Average Price */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${sellStats.average_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {posts.length} of {totalCount} posts
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">No posts found</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
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
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cx('inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border', getPostTypeColor(post.type))}>
                        <span className="mr-1">{getPostTypeIcon(post.type)}</span>
                        {post.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        {post.title && (
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {truncateText(post.title, 50)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {truncateText(post.description, 80)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {post.business_name ? (
                          <>
                            <div className="font-medium text-gray-900">{post.business_name}</div>
                            <div className="text-xs text-gray-500">Business</div>
                          </>
                        ) : post.user_name ? (
                          <>
                            <div className="font-medium text-gray-900">{post.user_name}</div>
                            <div className="text-xs text-gray-500">{post.user_email}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{post.total_likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare className="h-3 w-3" />
                          <span>{post.total_comments}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Share2 className="h-3 w-3" />
                          <span>{post.total_shares}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {post.status ? (
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
                        <span className={cx(
                          'inline-flex px-2 py-0.5 rounded-md text-xs font-medium border',
                          post.visibility === 'PUBLIC'
                            ? 'bg-brand-50 text-brand-700 border-brand-200'
                            : post.visibility === 'FRIENDS'
                            ? 'bg-warning-50 text-warning-700 border-warning-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        )}>
                          {post.visibility}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(post)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(post.id, !post.status)}
                          disabled={updatingPostId === post.id}
                          className={cx(
                            'px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs',
                            post.status
                              ? 'bg-error-50 text-error-700 hover:bg-error-100 border border-error-200'
                              : 'bg-success-50 text-success-700 hover:bg-success-100 border border-success-200',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          {updatingPostId === post.id
                            ? 'Updating...'
                            : post.status
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

      {/* Edit Post Modal */}
      {selectedPost && (
        <EditPostModal
          post={selectedPost}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
