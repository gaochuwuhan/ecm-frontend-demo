"use client";

import { useEffect, useState } from "react";
import { fetchProducts, createProduct, deleteProduct } from "@/services/api";
import type { EcProduct } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<EcProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_url: "",
    product_name: "",
    platform: "京东",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data.items);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formData.product_url || !formData.product_name) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      await createProduct(formData);
      setShowModal(false);
      setFormData({ product_url: "", product_name: "", platform: "京东" });
      await loadProducts();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除该商品吗？删除后相关评论数据将无法恢复。")) return;
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "删除失败");
    }
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
          <h2 className="text-2xl font-bold text-gray-900">商品管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            管理需要监测的电商商品，系统将自动抓取并分析评论
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          添加商品
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                商品名称
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                平台
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                商品链接
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                添加时间
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-gray-900">
                    {product.product_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.platform === "京东"
                      ? "bg-red-100 text-red-700"
                      : product.platform === "天猫"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                  }`}>
                    {product.platform}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500 truncate block max-w-xs" title={product.product_url}>
                    {product.product_url}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">
                    {new Date(product.created_time * 1000).toLocaleDateString("zh-CN")}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  暂无监测商品，请点击"添加商品"开始监测
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 添加商品弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              添加监测商品
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品名称
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  placeholder="请输入商品名称"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品链接
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  placeholder="https://item.jd.com/xxxxx.html"
                  value={formData.product_url}
                  onChange={(e) =>
                    setFormData({ ...formData, product_url: e.target.value })
                  }
                />
                <p className="text-xs text-gray-400 mt-1">
                  可使用以下链接测试：
                  <button type="button" className="text-primary-500 hover:underline ml-1" onClick={() => setFormData({ ...formData, product_url: "https://item.jd.com/10089231456.html", product_name: "戴林牌智能无线吸尘器 V12 Pro", platform: "京东" })}>京东示例</button>
                  <span className="mx-1">|</span>
                  <button type="button" className="text-primary-500 hover:underline" onClick={() => setFormData({ ...formData, product_url: "https://detail.tmall.com/item.htm?id=7823456190", product_name: "地猫精灵智能机器人 X1", platform: "天猫" })}>天猫示例</button>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  电商平台
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                >
                  <option value="京东">京东</option>
                  <option value="天猫">天猫</option>
                </select>
              </div>
            </div>
            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">{errorMsg}</p>
            )}
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleCreate}
                disabled={submitting || !formData.product_url || !formData.product_name}
              >
                {submitting ? "提交中..." : "确认添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
