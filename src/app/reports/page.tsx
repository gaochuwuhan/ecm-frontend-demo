"use client";

import { useEffect, useState } from "react";
import { fetchReports } from "@/services/api";
import type { MonitorReport } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#6366f1", "#8b5cf6", "#06b6d4"];

function ReportDetail({ report }: { report: MonitorReport }) {
  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium">总评论数</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {report.total_comments}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">负面评论</p>
          <p className="text-2xl font-bold text-red-900 mt-1">
            {report.negative_count}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-medium">负面率</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {report.negative_rate}%
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium">报告状态</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {report.status === "finished" ? "已完成" : "生成中"}
          </p>
        </div>
      </div>

      {/* 摘要 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">分析摘要</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{report.summary}</p>
      </div>

      {/* 问题分类图表 */}
      {report.key_issues.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            问题分类分布
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.key_issues}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 13 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "count") return [`${value} 条`, "数量"];
                    return [value, name];
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {report.key_issues.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 关键问题详情 */}
      {report.key_issues.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            关键问题详情
          </h4>
          <div className="space-y-3">
            {report.key_issues.map((issue) => (
              <div
                key={issue.category}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-gray-900">
                    {issue.category}
                  </h5>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {issue.count} 条 ({issue.percentage}%)
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${Math.min(issue.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {issue.representative_comments.map((comment, idx) => (
                    <p
                      key={idx}
                      className="text-xs text-gray-600 pl-3 border-l-2 border-red-200"
                    >
                      &ldquo;{comment}&rdquo;
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          改进建议
        </h4>
        <div className="bg-primary-50 rounded-lg p-4">
          <ul className="space-y-2">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {idx + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MonitorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MonitorReport | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await fetchReports();
        setReports(data);
        if (data.length > 0) setSelectedReport(data[0]);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">分析报告</h2>
        <p className="text-sm text-gray-500 mt-1">
          AI自动生成的负面评论分析报告，包含问题分类、关键观点和改进建议
        </p>
      </div>

      {/* 报告选择 */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report)}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all text-left ${
              selectedReport?.id === report.id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
              {report.product_name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500">
                {report.report_date}
              </span>
              <span className="text-xs font-medium text-red-600">
                负面率 {report.negative_rate}%
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* 报告详情 */}
      {selectedReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {selectedReport.product_name}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                监测报告 - {selectedReport.report_date}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                selectedReport.status === "finished"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {selectedReport.status === "finished" ? "已完成" : "生成中"}
            </span>
          </div>
          <ReportDetail report={selectedReport} />
        </div>
      )}

      {reports.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">暂无分析报告</p>
        </div>
      )}
    </div>
  );
}
