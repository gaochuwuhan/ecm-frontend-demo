// ========== 商品相关 ==========
export interface EcProduct {
  id: string;
  product_url: string;
  product_name: string;
  platform: string;
  created_time: number;
  updated_time: number;
}

export interface CreateProductRequest {
  product_url: string;
  product_name: string;
  platform: string;
}

export interface ProductListResponse {
  items: EcProduct[];
  total: number;
  page: number;
  limit: number;
}

// ========== 评论相关 ==========
export interface EcComment {
  id: number;
  comment_user: string;
  comment_text: string;
  product_name: string;
  rate: number;
  sentiment: string;
  sentiment_score: number;
  comment_time: number;
  updated_time: number;
}

export interface CommentListResponse {
  items: EcComment[];
  total: number;
  page: number;
  limit: number;
}

export interface CommentFilter {
  product_id?: string;
  sentiment?: string | null;
  search?: string;
  page: number;
  limit: number;
}

// ========== 报告相关 ==========
export interface MonitorReport {
  id?: number;
  ec_product_id: string;
  product_name: string;
  platform: string;
  product_url: string;
  period_days: number;
  total_comments: number;
  negative_comments: number;
  negative_rate: number;
  summary: string;
  status: "pending" | "processing" | "finished" | "failed";
  report_date: string;
  created_time: number;
  key_issues?: KeyIssue[];
  recommendations?: string[];
}

export interface KeyIssue {
  category: string;
  count: number;
  percentage: number;
  representative_comments: string[];
}

export interface ReportListResponse {
  items: MonitorReport[];
  total: number;
  page: number;
  limit: number;
}

// ========== Dashboard统计 ==========
export interface DashboardStats {
  product_count: number;
  total_comments: number;
  negative_count: number;
  negative_rate: number;
  avg_rating: number;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface RecentNegativeItem {
  id: number;
  comment_user: string;
  comment_text: string;
  product_name?: string;
  rate?: number;
  sentiment_score?: number;
  comment_time: number;
}

export interface DashboardResponse {
  product_count: number;
  total_comments: number;
  negative_count: number;
  negative_rate: number;
  avg_rating: number;
  comment_trend: TrendDataPoint[];
  sentiment_distribution: { sentiment: string; count: number }[];
  category_distribution: CategoryDistribution[];
  recent_negatives: RecentNegativeItem[];
}

export interface SendReportRequest {
  report_ids: number[];
  emails: string[];
}

// ========== 通用 ==========
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
