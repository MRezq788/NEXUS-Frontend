import React from "react";
import { ActivityItem } from "./ActivityItem";

type Props = {
  isDark: boolean;
  activities: any[];
  width?: string;
  title: string;
  subtitle: string;
  height?: string;
  showGrowing?: boolean;
};

export default function ListView({
  isDark,
  activities,
  width = "",
  title,
  subtitle,
  height = "h-auto",
  showGrowing = false,
}: Props) {
  return (
    <div
      className={`${width} ${height} p-6 rounded-3xl transition-all duration-300 ${
        isDark
          ? "bg-[#1e1f23] border border-[#2d2e33] shadow-xl shadow-black/20"
          : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </h3>
          <p
            className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            {subtitle}
          </p>
        </div>
        <button
          className={`text-sm font-medium ${
            isDark
              ? "text-blue-400 hover:text-blue-300"
              : "text-blue-600 hover:text-blue-500"
          } transition-colors`}
        >
          View All
        </button>
      </div>
      <div className="space-y-3 h-[60%]">
        {activities.map((activity, i) => (
          <ActivityItem
            key={i}
            {...activity}
            isDark={isDark}
            delay={500 + i * 100}
          />
        ))}
      </div>

      {showGrowing && (
        <div
          className={`mt-6 p-4 rounded-2xl ${isDark ? "bg-[#25262b]" : "bg-gray-50"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Business Growing
              </p>
              <p
                className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                23% more than last month
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
