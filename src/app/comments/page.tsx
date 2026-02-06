"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchComments, fetchProducts } from "@/services/api";
import type { EcComment, EcProduct, CommentFilter } from "@/types";

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-gray-400 text-xs">-</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CommentsPage() {
  const [comments, setComments] = useState<EcComment[]>([]);
  const [products, setProducts] = useState<EcProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommentFilter>({
    page: 1,
    page_size: 20,
  });

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const [commentsData, productsData] = await Promise.all([
        fetchComments(filter),
        fetchProducts(),
      ]);
      setComments(commentsData.data);
      setTotal(commentsData.total);
      setProducts(productsData);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  function getProductName(productId: string): string {
    return products.find((p) => p.id === productId)?.product_name ?? "-";
  }

  const totalPages = Math.ceil(total / filter.page_size);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">评论监测</h2>
        <p className="text-sm text-gray-500 mt-1">
          查看和筛选所有商品评论，支持按情感、评分、关键词等多维度过滤
        </p>
      </div>

      {/* 筛选条件 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              商品
            </label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              value={filter.product_id ?? ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  product_id: e.target.value || undefined,
                  page: 1,
                })
              }
            >
              <option value="">全部商品</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.product_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              情感类型
            </label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              value={
                filter.negative_flag === true
                  ? "negative"
                  : filter.negative_flag === false
                    ? "positive"
                    : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilter({
                  ...filter,
                  negative_flag:
                    val === "negative" ? true : val === "positive" ? false : undefined,
                  page: 1,
                });
              }}
            >
              <option value="">全部</option>
              <option value="negative">负面</option>
              <option value="positive">正面/中性</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              最低评分
            </label>
            <select
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              value={filter.min_rating ?? ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  min_rating: e.target.value ? Number(e.target.value) : undefined,
                  page: 1,
                })
              }
            >
              <option value="">不限</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} 星及以上
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              关键词搜索
            </label>
            <input
              type="text"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
              placeholder="搜索评论内容或用户名"
              value={filter.keyword ?? ""}
              onChange={(e) =>
                setFilter({ ...filter, keyword: e.target.value || undefined, page: 1 })
              }
            />
          </div>

          <div className="flex items-end">
            <button
              className="btn-secondary w-full"
              onClick={() =>
                setFilter({ page: 1, page_size: 20 })
              }
            >
              重置筛选
            </button>
          </div>
        </div>
      </div>

      {/* 评论统计 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          共 <strong className="text-gray-900">{total}</strong> 条评论
        </span>
      </div>

      {/* 评论列表 */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  用户
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  评论内容
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  商品
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  评分
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  情感
                </th>
                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  情感得分
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <tr key={comment.comment_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.comment_user}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-2 max-w-md">
                      {comment.comment_text}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 truncate block max-w-[140px]">
                      {getProductName(comment.ec_product_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RatingStars rating={comment.rate} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {comment.negative_flag ? (
                      <span className="badge-negative">负面</span>
                    ) : (
                      <span className="badge-positive">正面</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-sm font-medium ${
                        (comment.sentiment_score ?? 0) < 0
                          ? "text-red-600"
                          : (comment.sentiment_score ?? 0) > 0.3
                            ? "text-green-600"
                            : "text-gray-600"
                      }`}
                    >
                      {comment.sentiment_score}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {comment.comment_time.split(" ")[0]}
                    </span>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    没有找到匹配的评论
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            第 {filter.page} / {totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={filter.page <= 1}
              onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
            >
              上一页
            </button>
            <button
              className="btn-secondary"
              disabled={filter.page >= totalPages}
              onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
