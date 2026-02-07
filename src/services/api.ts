import type {
  CommentFilter,
  CommentListResponse,
  ReportListResponse,
  DashboardResponse,
  CreateProductRequest,
  ApiResponse,
  ProductListResponse,
  SendReportRequest,
} from "@/types";

import { API_BASE } from "@/config";

const REQUEST_TIMEOUT = 100_000; // 100s

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
}

// ========== 商品 API ==========
export async function fetchProducts(
  page: number = 1,
  limit: number = 100,
  search?: string,
  platform?: string,
): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (platform) params.set("platform", platform);

  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-products?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<ProductListResponse> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "获取商品列表失败");
  }
  return json.data;
}

export async function createProduct(req: CreateProductRequest): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "创建商品失败");
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "删除商品失败");
  }
}

// ========== 评论 API ==========
export async function fetchComments(
  filter: CommentFilter
): Promise<CommentListResponse> {
  const params = new URLSearchParams();
  params.set("page", String(filter.page));
  params.set("limit", String(filter.limit));
  if (filter.product_id) params.set("product_id", filter.product_id);
  if (filter.sentiment !== null && filter.sentiment !== undefined) {
    params.set("sentiment", String(filter.sentiment));
  }
  if (filter.search) params.set("search", filter.search);

  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-comments?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<CommentListResponse> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "获取评论列表失败");
  }
  return json.data;
}

export async function crawlComments(): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-comments/crawl`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "拉取评论失败");
  }
}

export async function deleteAllComments(): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-comments`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "清空评论失败");
  }
}

// ========== Dashboard API ==========
export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/dashboard`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<DashboardResponse> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "获取仪表盘数据失败");
  }
  return json.data!;
}

// ========== 报告 API ==========
export async function generateReport(): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-reports/generate`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "生成报告失败");
  }
}

export async function fetchLatestReports(): Promise<ReportListResponse> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-reports/latest`);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<ReportListResponse> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "获取报告列表失败");
  }
  return json.data;
}

export async function sendReport(req: SendReportRequest): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/ecm/ec-reports/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  const json: ApiResponse<null> = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || "发送报告失败");
  }
}
