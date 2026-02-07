"use client";

import { useEffect, useState } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import SentimentPieChart from "@/components/dashboard/SentimentPieChart";
import TrendChart from "@/components/dashboard/TrendChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentNegativeComments from "@/components/dashboard/RecentNegativeComments";
import { fetchDashboard } from "@/services/api";
import type {
  DashboardStats,
  SentimentDistribution,
  TrendDataPoint,
  CategoryDistribution,
  RecentNegativeItem,
} from "@/types";

const CATEGORY_LABEL: Record<string, string> = {
  quality: "质量问题",
  service: "服务问题",
  function: "功能问题",
  price: "价格问题",
  logistics: "物流问题",
};

const SENTIMENT_MAP: Record<string, { name: string; color: string }> = {
  positive: { name: "正面评论", color: "#10b981" },
  neutral: { name: "中性评论", color: "#6b7280" },
  negative: { name: "负面评论", color: "#ef4444" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sentiment, setSentiment] = useState<SentimentDistribution[]>([]);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [recentNegatives, setRecentNegatives] = useState<RecentNegativeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchDashboard();

        setStats({
          product_count: data.product_count,
          total_comments: data.total_comments,
          negative_count: data.negative_count,
          negative_rate: data.negative_rate,
          avg_rating: data.avg_rating,
        });

        setSentiment(
          data.sentiment_distribution.map((item) => {
            const mapped = SENTIMENT_MAP[item.sentiment] ?? {
              name: item.sentiment,
              color: "#9ca3af",
            };
            return { name: mapped.name, value: item.count, color: mapped.color };
          })
        );

        setTrend(data.comment_trend);
        setCategories(
          data.category_distribution.map((item) => ({
            ...item,
            category: CATEGORY_LABEL[item.category] ?? item.category,
          }))
        );
        setRecentNegatives(data.recent_negatives);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">数据概览</h2>
        <p className="text-sm text-gray-500 mt-1">
          电商负面评论监测系统实时数据看板
        </p>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={trend} />
        <SentimentPieChart data={sentiment} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categories} />
        <RecentNegativeComments comments={recentNegatives} />
      </div>
    </div>
  );
}
