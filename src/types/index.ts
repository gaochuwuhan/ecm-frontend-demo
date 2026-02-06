// ========== 商品相关 ==========
export interface EcProduct {
  id: string;
  product_url: string;
  product_name: string;
  platform: string;
  created_time: string;
  updated_time: string;
}

export interface CreateProductRequest {
  product_url: string;
  product_name: string;
  platform: string;
}

// ========== 评论相关 ==========
export interface EcComment {
  id: number;
  ec_product_id: string;
  comment_id: string;
  comment_text: string;
  comment_user: string;
  rate: number | null;
  comment_time: string;
  helpful_count: number;
  sentiment_score: number | null;
  negative_flag: boolean | null;
  created_time: string;
  updated_time: string;
}

export interface CommentFilter {
  product_id?: string;
  negative_flag?: boolean | null;
  min_rating?: number;
  max_rating?: number;
  start_date?: string;
  end_date?: string;
  keyword?: string;
  page: number;
  page_size: number;
}

// ========== 报告相关 ==========
export interface MonitorReport {
  id: string;
  product_id: string;
  product_name: string;
  report_date: string;
  total_comments: number;
  negative_count: number;
  negative_rate: number;
  summary: string;
  key_issues: KeyIssue[];
  recommendations: string[];
  status: "pending" | "processing" | "finished" | "failed";
  created_time: string;
}

export interface KeyIssue {
  category: string;
  count: number;
  percentage: number;
  representative_comments: string[];
}

// ========== Dashboard统计 ==========
export interface DashboardStats {
  total_products: number;
  total_comments: number;
  negative_comments: number;
  negative_rate: number;
  avg_rating: number;
  today_new_comments: number;
}

export interface SentimentDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  negative: number;
  positive: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
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
