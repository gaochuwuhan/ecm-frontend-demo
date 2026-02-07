"use client";

import { useEffect, useState } from "react";
import { fetchLatestReports, generateReport, sendReport } from "@/services/api";
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
            {report.negative_comments}
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
      {report.key_issues && report.key_issues.length > 0 && (
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
      {report.key_issues && report.key_issues.length > 0 && (
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
      {report.recommendations && report.recommendations.length > 0 && (
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
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MonitorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MonitorReport | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sendErrorMsg, setSendErrorMsg] = useState("");
  const [generating, setGenerating] = useState(false);

  async function loadReports() {
    const data = await fetchLatestReports();
    setReports(data.items);
    if (data.items.length > 0) {
      setSelectedReport(data.items[0]);
    }
  }

  useEffect(() => {
    loadReports().finally(() => setLoading(false));
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await generateReport();
      await loadReports();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "生成报告失败");
    } finally {
      setGenerating(false);
    }
  }

  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleAddEmail() {
    const trimmed = emailInput.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setEmailError("邮箱格式不正确");
      return;
    }
    if (emails.includes(trimmed)) {
      setEmailError("该邮箱已添加");
      return;
    }
    setEmails([...emails, trimmed]);
    setEmailInput("");
    setEmailError("");
  }

  function handleRemoveEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  async function handleSend() {
    if (selectedReportIds.length === 0 || emails.length === 0) return;
    setSending(true);
    setSendErrorMsg("");
    try {
      await sendReport({ report_ids: selectedReportIds, emails });
      setShowSendModal(false);
      setEmails([]);
      setEmailInput("");
      setSelectedReportIds([]);
      alert("报告已发送成功！");
    } catch (e: unknown) {
      setSendErrorMsg(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  }

  function openSendModal() {
    setEmails([]);
    setEmailInput("");
    setEmailError("");
    setSendErrorMsg("");
    setSelectedReportIds(
      reports.filter((r) => r.id != null).map((r) => r.id as number)
    );
    setShowSendModal(true);
  }

  function toggleReportId(id: number) {
    setSelectedReportIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">分析报告</h2>
          <p className="text-sm text-gray-500 mt-1">
            AI自动生成的负面评论分析报告，包含问题分类、关键观点和改进建议
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn-secondary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                生成中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                生成报告
              </>
            )}
          </button>
          {reports.some((r) => r.id != null) && (
            <button className="btn-primary" onClick={openSendModal}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              发送报告
            </button>
          )}
        </div>
      </div>

      {/* 报告选择 */}
      <div className="flex flex-wrap gap-3">
        {reports.map((report) => (
          <button
            key={report.ec_product_id}
            onClick={() => setSelectedReport(report)}
            className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
              selectedReport?.ec_product_id === report.ec_product_id
                ? "border-primary-500 bg-primary-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {report.product_name}
              </p>
              {report.id && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-100 text-primary-700">
                  近{report.period_days}天
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500">
                {report.platform}
              </span>
              {report.id ? (
                <>
                  <span className="text-xs text-gray-400">
                    {report.report_date}
                  </span>
                  <span className="text-xs font-medium text-red-600">
                    负面率 {report.negative_rate}%
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400">未生成报告</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* 报告详情 */}
      {selectedReport && selectedReport.id ? (
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
      ) : selectedReport && !selectedReport.id ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">该商品尚未生成报告，请点击「生成报告」</p>
        </div>
      ) : null}

      {reports.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">暂无分析报告</p>
        </div>
      )}

      {/* 发送报告弹窗 */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowSendModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              发送报告
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              选择要发送的商品报告，并添加收件邮箱
            </p>

            {/* 商品多选 */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-2">选择商品</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reports.filter((r) => r.id != null).map((report) => (
                  <label
                    key={report.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={selectedReportIds.includes(report.id as number)}
                      onChange={() => toggleReportId(report.id as number)}
                    />
                    <span className="text-sm text-gray-700">{report.product_name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{report.platform}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 邮箱输入 */}
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                placeholder="请输入邮箱地址"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setEmailError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <button
                className="btn-secondary flex-shrink-0"
                onClick={handleAddEmail}
              >
                添加
              </button>
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}

            {/* 邮箱列表 */}
            {emails.length > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {emails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-gray-700">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {emails.length === 0 && (
              <p className="text-xs text-gray-400 mt-3">
                还未添加收件人，输入邮箱后按回车或点击添加
              </p>
            )}

            {sendErrorMsg && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">{sendErrorMsg}</p>
            )}

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="btn-secondary"
                onClick={() => setShowSendModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleSend}
                disabled={sending || emails.length === 0 || selectedReportIds.length === 0}
              >
                {sending ? "发送中..." : `发送 (${selectedReportIds.length}个报告, ${emails.length}个邮箱)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
