"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchComments, fetchProducts, crawlComments, deleteAllComments } from "@/services/api";
import type { EcComment, EcProduct, CommentFilter } from "@/types";

function RatingStars({ rating }: { rating: number }) {
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
  const [errorMsg, setErrorMsg] = useState("");
  const [filter, setFilter] = useState<CommentFilter>({
    page: 1,
    limit: 20,
  });

  const loadComments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setErrorMsg("");
    try {
      const [commentsData, productsData] = await Promise.all([
        fetchComments(filter),
        fetchProducts(),
      ]);
      setComments(commentsData.items);
      setTotal(commentsData.total);
      setProducts(productsData.items);
    } catch (e: unknown) {
      if (!silent) setErrorMsg(e instanceof Error ? e.message : "加载失败");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadComments();
    const timer = setInterval(() => loadComments(true), 5000);
    return () => clearInterval(timer);
  }, [loadComments]);

  const [clearing, setClearing] = useState(false);
  const [crawling, setCrawling] = useState(false);

  const handleCrawl = async () => {
    setCrawling(true);
    setErrorMsg("");
    try {
      await crawlComments();
      await loadComments();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "拉取评论失败");
    } finally {
      setCrawling(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("确定要清空所有评论吗？此操作不可恢复。")) return;
    setClearing(true);
    try {
      await deleteAllComments();
      setFilter({ page: 1, limit: 20 });
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "清空评论失败");
    } finally {
      setClearing(false);
    }
  };

  const totalPages = Math.ceil(total / filter.limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">评论监测</h2>
          <p className="text-sm text-gray-500 mt-1">
            查看和筛选所有商品评论，支持按情感、评分、关键词等多维度过滤
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn-primary"
            onClick={handleCrawl}
            disabled={crawling}
          >
            {crawling ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                拉取中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                拉取最新评论
              </>
            )}
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
            onClick={handleClearAll}
            disabled={clearing}
          >
            {clearing ? "清空中..." : "清空所有评论"}
          </button>
        </div>
      </div>

      {/* 筛选条件 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                filter.sentiment === "negative"
                  ? "negative"
                  : filter.sentiment === "positive"
                    ? "positive"
                      : filter.sentiment === "neutral"
                    ? "neutral"
                    : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                setFilter({
                  ...filter,
                  sentiment: val || undefined,
                  page: 1,
                });
              }}
            >
              <option value="">全部</option>
              <option value="positive">正面</option>
              <option value="neutral">中性</option>
              <option value="negative">负面</option>
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
              value={filter.search ?? ""}
              onChange={(e) =>
                setFilter({ ...filter, search: e.target.value || undefined, page: 1 })
              }
            />
          </div>

          <div className="flex items-end">
            <button
              className="btn-secondary w-full"
              onClick={() =>
                setFilter({ page: 1, limit: 20 })
              }
            >
              重置筛选
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{errorMsg}</p>
      )}

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
                  评论时间
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  分析时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {comment.comment_user}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-2 max-w-md" title={comment.comment_text}>
                      {comment.comment_text}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 truncate block max-w-[140px]" title={comment.product_name}>
                      {comment.product_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RatingStars rating={comment.rate} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {comment.sentiment === "negative" ? (
                      <span className="badge-negative">负面</span>
                    ) : comment.sentiment === "neutral" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">中性</span>
                    ) : comment.sentiment === "positive" ? (
                      <span className="badge-positive">正面</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">待分析</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-sm font-medium ${
                        comment.sentiment_score == null
                          ? "text-gray-400"
                          : comment.sentiment_score < 0
                            ? "text-red-600"
                            : comment.sentiment_score > 0.3
                              ? "text-green-600"
                              : "text-gray-600"
                      }`}
                    >
                      {comment.sentiment_score != null ? comment.sentiment_score.toFixed(2) : "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(comment.comment_time * 1000).toLocaleString("zh-CN")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">
                      {new Date(comment.updated_time * 1000).toLocaleString("zh-CN")}
                    </span>
                  </td>
                </tr>
              ))}
              {comments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
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
