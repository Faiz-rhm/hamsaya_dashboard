// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  error?: string
}

// User Types
export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  email_verified: boolean
  phone_verified: boolean
  mfa_enabled: boolean
  created_at: string
}

// Post Types
export type PostType = 'FEED' | 'EVENT' | 'SELL' | 'PULL'
export type PostVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE'

export interface Post {
  id: string
  user_id: string
  type: PostType
  title?: string
  text?: string
  description?: string
  visibility: PostVisibility
  likes_count: number
  comments_count: number
  shares_count: number
  views_count: number
  created_at: string
  updated_at: string
}

// Business Types
export interface Business {
  id: string
  user_id: string
  name: string
  description: string
  phone: string
  email: string
  avatar_url?: string
  is_verified: boolean
  followers_count: number
  rating: number
  reviews_count: number
  created_at: string
  updated_at: string
}

// Report Types
export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
export type ReportType = 'POST' | 'COMMENT' | 'USER' | 'BUSINESS'

export interface Report {
  id: string
  reporter_id: string
  reported_item_id: string
  item_type: ReportType
  reason: string
  description?: string
  status: ReportStatus
  created_at: string
  updated_at: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

// Admin Statistics Types
export interface AdminStatistics {
  // Account Status
  total_active_accounts: number // Accounts with is_active = true
  deactivated_accounts: number  // Accounts with is_active = false
  new_users_this_month: number

  // Login Activity (for active accounts only)
  recently_active_users: number // Logged in last 30 days AND is_active = true
  dormant_users: number         // No login in 30+ days AND is_active = true

  // Content Statistics
  total_posts: number
  posts_by_type: PostTypeStats
  total_businesses: number
  pending_reports: PendingReports
}

export interface PostTypeStats {
  feed: number
  event: number
  sell: number
  pull: number
}

export interface PendingReports {
  posts: number
  comments: number
  users: number
  businesses: number
  total: number
}

// User Management Types
export interface AdminUserListItem {
  id: string
  email: string
  first_name?: string
  last_name?: string
  email_verified: boolean
  phone_verified: boolean
  mfa_enabled: boolean
  role: string
  is_active: boolean
  last_login_at?: string
  created_at: string
}

export interface UserListResponse {
  data: AdminUserListItem[]
  meta: {
    page: number
    limit: number
    total_count: number
    total_pages: number
  }
}

export interface UpdateUserStatusRequest {
  is_active: boolean
}

export interface AdminUpdateUserRequest {
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  email_verified?: boolean
  phone_verified?: boolean
  is_active?: boolean
  mfa_enabled?: boolean
}

// Post Management Types
export interface Photo {
  url: string
  name: string
  size: number
  width: number
  height: number
  mime_type: string
}

export interface AdminPostListItem {
  id: string
  user_id: string | null
  user_email: string | null
  user_name: string | null
  business_id: string | null
  business_name: string | null
  type: PostType
  title: string | null
  description: string | null
  visibility: PostVisibility
  status: boolean
  start_date: string | null
  end_date: string | null
  attachments: Photo[]
  total_likes: number
  total_comments: number
  total_shares: number
  created_at: string
  updated_at: string
}

export interface PostListResponse {
  data: AdminPostListItem[]
  meta: {
    page: number
    limit: number
    total_count: number
    total_pages: number
  }
}

// Report Management Types
export interface AdminReportListItem {
  id: string
  report_type: ReportType
  reporter_id: string
  reporter_email: string | null
  reporter_name: string | null
  reported_item_id: string
  reported_item_info: string | null
  reason: string
  additional_comments: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface ReportListResponse {
  data: AdminReportListItem[]
  meta: {
    page: number
    limit: number
    total_count: number
    total_pages: number
  }
}

export interface UpdateReportStatusRequest {
  status: ReportStatus
}

export interface PostReportDetail {
  id: string
  user_id: string
  post_id: string
  reason: string
  additional_comments: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface CommentReportDetail {
  id: string
  user_id: string
  comment_id: string
  reason: string
  additional_comments: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface UserReportDetail {
  id: string
  reported_user: string
  reported_by_id: string
  reason: string
  description: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

export interface BusinessReportDetail {
  id: string
  business_id: string
  user_id: string
  reason: string
  additional_comments: string | null
  status: ReportStatus
  created_at: string
  updated_at: string
}

// Business Management Types
export interface AdminBusinessListItem {
  id: string
  user_id: string
  owner_email: string | null
  owner_name: string | null
  name: string
  license_no: string | null
  email: string | null
  phone_number: string | null
  province: string | null
  district: string | null
  status: boolean
  total_views: number
  total_follow: number
  total_posts: number
  created_at: string
  updated_at: string
}

export interface BusinessListResponse {
  data: AdminBusinessListItem[]
  meta: {
    page: number
    limit: number
    total_count: number
    total_pages: number
  }
}

export interface UpdateBusinessStatusRequest {
  status: boolean
}

export interface AdminUpdateBusinessRequest {
  name?: string
  license_no?: string
  email?: string
  phone_number?: string
  province?: string
  district?: string
}

export interface UpdatePostStatusRequest {
  status: boolean
}

export interface AdminUpdatePostRequest {
  title?: string
  description?: string
  visibility?: PostVisibility
  type?: PostType
  status?: boolean
  start_date?: string
  end_date?: string
}

// Poll Types
export interface PollOption {
  id: string
  option_text: string
  vote_count: number
  percentage: number
}

export interface Poll {
  id: string
  post_id: string
  options: PollOption[]
  total_votes: number
  created_at: string
  updated_at: string
}

// Sell Statistics Types
export interface SellStatistics {
  total_sell_posts: number
  total_sold: number
  total_active: number
  total_expired: number
  total_revenue: number
  average_price: number
}
