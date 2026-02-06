"use client";

import { useEffect, useState } from "react";
import StatsCards from "@/components/dashboard/StatsCards";
import SentimentPieChart from "@/components/dashboard/SentimentPieChart";
import TrendChart from "@/components/dashboard/TrendChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import RecentNegativeComments from "@/components/dashboard/RecentNegativeComments";
import {
  fetchDashboardStats,
  fetchSentimentDistribution,
  fetchTrendData,
  fetchCategoryDistribution,
  fetchComments,
} from "@/services/api";
import type {
  DashboardStats,
  SentimentDistribution,
  TrendDataPoint,
  CategoryDistribution,
  EcComment,
} from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sentiment, setSentiment] = useState<SentimentDistribution[]>([]);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryDistribution[]>([]);
  const [comments, setComments] = useState<EcComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, sentimentData, trendData, categoryData, commentsData] =
          await Promise.all([
            fetchDashboardStats(),
            fetchSentimentDistribution(),
            fetchTrendData(),
            fetchCategoryDistribution(),
            fetchComments({ page: 1, page_size: 200 }),
          ]);
        setStats(statsData);
        setSentiment(sentimentData);
        setTrend(trendData);
        setCategories(categoryData);
        setComments(commentsData.data);
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
        <RecentNegativeComments comments={comments} />
      </div>
    </div>
  );
}
