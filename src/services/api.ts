import type {
  EcProduct,
  EcComment,
  CommentFilter,
  MonitorReport,
  DashboardStats,
  SentimentDistribution,
  TrendDataPoint,
  CategoryDistribution,
  PaginatedResponse,
  CreateProductRequest,
} from "@/types";
import {
  mockProducts,
  mockComments,
  getDashboardStats,
  getSentimentDistribution,
  getTrendData,
  getCategoryDistribution,
  getReports,
} from "@/lib/mock-data";

// 模拟网络延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ========== 商品 API ==========
export async function fetchProducts(): Promise<EcProduct[]> {
  await delay(300);
  return mockProducts;
}

export async function createProduct(req: CreateProductRequest): Promise<EcProduct> {
  await delay(500);
  const newProduct: EcProduct = {
    id: `prod-${Date.now()}`,
    ...req,
    created_time: new Date().toISOString(),
    updated_time: new Date().toISOString(),
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(300);
  const idx = mockProducts.findIndex((p) => p.id === id);
  if (idx !== -1) mockProducts.splice(idx, 1);
}

// ========== 评论 API ==========
export async function fetchComments(
  filter: CommentFilter
): Promise<PaginatedResponse<EcComment>> {
  await delay(400);
  let filtered = [...mockComments];

  if (filter.product_id) {
    filtered = filtered.filter((c) => c.ec_product_id === filter.product_id);
  }
  if (filter.negative_flag !== null && filter.negative_flag !== undefined) {
    filtered = filtered.filter((c) => c.negative_flag === filter.negative_flag);
  }
  if (filter.min_rating) {
    filtered = filtered.filter((c) => (c.rate ?? 0) >= filter.min_rating!);
  }
  if (filter.max_rating) {
    filtered = filtered.filter((c) => (c.rate ?? 5) <= filter.max_rating!);
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.comment_text.toLowerCase().includes(kw) ||
        c.comment_user.toLowerCase().includes(kw)
    );
  }
  if (filter.start_date) {
    filtered = filtered.filter((c) => c.comment_time >= filter.start_date!);
  }
  if (filter.end_date) {
    filtered = filtered.filter((c) => c.comment_time <= filter.end_date! + " 23:59:59");
  }

  // 按时间倒序
  filtered.sort((a, b) => b.comment_time.localeCompare(a.comment_time));

  const total = filtered.length;
  const start = (filter.page - 1) * filter.page_size;
  const data = filtered.slice(start, start + filter.page_size);

  return {
    data,
    total,
    page: filter.page,
    page_size: filter.page_size,
    has_more: start + filter.page_size < total,
  };
}

// ========== Dashboard API ==========
export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay(300);
  return getDashboardStats();
}

export async function fetchSentimentDistribution(): Promise<SentimentDistribution[]> {
  await delay(200);
  return getSentimentDistribution();
}

export async function fetchTrendData(): Promise<TrendDataPoint[]> {
  await delay(200);
  return getTrendData();
}

export async function fetchCategoryDistribution(): Promise<CategoryDistribution[]> {
  await delay(200);
  return getCategoryDistribution();
}

// ========== 报告 API ==========
export async function fetchReports(): Promise<MonitorReport[]> {
  await delay(500);
  return getReports();
}

export async function fetchReportById(id: string): Promise<MonitorReport | null> {
  await delay(300);
  const reports = getReports();
  return reports.find((r) => r.id === id) ?? null;
}
