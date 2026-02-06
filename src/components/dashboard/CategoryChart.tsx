"use client";

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
import type { CategoryDistribution } from "@/types";

interface CategoryChartProps {
  data: CategoryDistribution[];
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#6366f1", "#8b5cf6"];

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="card">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        负面评论问题分类
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="category" type="category" tick={{ fontSize: 13 }} width={80} />
            <Tooltip formatter={(value: number) => [`${value} 条`, "数量"]} />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
