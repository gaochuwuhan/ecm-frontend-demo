"use client";

import type { EcComment } from "@/types";

interface RecentNegativeCommentsProps {
  comments: EcComment[];
}

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

export default function RecentNegativeComments({
  comments,
}: RecentNegativeCommentsProps) {
  const negativeComments = comments
    .filter((c) => c.negative_flag)
    .sort((a, b) => b.comment_time.localeCompare(a.comment_time))
    .slice(0, 10);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          最近负面评论
        </h3>
        <span className="badge-negative">{negativeComments.length} 条</span>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {negativeComments.map((comment) => (
          <div
            key={comment.comment_id}
            className="p-3 bg-red-50 rounded-lg border border-red-100"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {comment.comment_user}
                </span>
                <RatingStars rating={comment.rate} />
              </div>
              <span className="text-xs text-gray-500">
                {comment.comment_time.split(" ")[0]}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {comment.comment_text}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-gray-500">
                情感得分: {comment.sentiment_score}
              </span>
              <span className="text-xs text-gray-500">
                有用: {comment.helpful_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
