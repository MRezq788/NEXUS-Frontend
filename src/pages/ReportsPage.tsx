import { useCallback, useEffect, useMemo, useState } from "react";
import { usersApi } from "../api";
import { useTheme } from "../contexts/ThemeContext";

type Period = "7d" | "30d" | "90d";
type ApiPeriod = "week" | "month" | "year";

interface ReportData {
  totalRevenue: number;
  growth: number;
  totalOrders: number;
}

const periodLabel: Record<Period, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

const periodToApi: Record<Period, ApiPeriod> = {
  "7d": "week",
  "30d": "month",
  "90d": "year",
};

export function ReportsPage() {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>("30d");
  const [report, setReport] = useState<ReportData>({
    totalRevenue: 0,
    growth: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const profileResponse = await usersApi.getUserProfile();
      const userId = profileResponse.data?.email;

      if (!userId) {
        throw new Error("Unable to load your profile.");
      }

      const apiPeriod = periodToApi[period];

      const [revenueRes, growthRes, ordersRes] = await Promise.all([
        usersApi.getTotalRevenuePeriod(userId, apiPeriod),
        usersApi.getRevenueGrowth(userId, apiPeriod),
        usersApi.getTotalOrdersPeriod(userId, apiPeriod),
      ]);

      setReport({
        totalRevenue: revenueRes.data?.totalRevenue ?? 0,
        growth: growthRes.data?.growth?.growth ?? 0,
        totalOrders: ordersRes.data?.totalOrders ?? 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load report data",
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const avgOrderValue = useMemo(() => {
    if (!report.totalOrders) return 0;
    return report.totalRevenue / report.totalOrders;
  }, [report.totalOrders, report.totalRevenue]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Reports
          </h2>
          <p className={`${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Performance overview for {periodLabel[period]}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className={`px-4 py-2 rounded-xl text-sm border ${
              isDark
                ? "bg-black border-gray-700 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={() => {
              void fetchReport();
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-2xl p-8 text-center text-sm ${isDark ? "bg-[#1e1f23] text-gray-500" : "bg-white border border-gray-100 text-gray-500"}`}
        >
          Loading report data...
        </div>
      ) : error ? (
        <div
          className={`rounded-2xl p-8 text-center text-sm ${isDark ? "bg-[#1e1f23] text-red-400" : "bg-white border border-gray-100 text-red-500"}`}
        >
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
              className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Total Revenue
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {report.totalRevenue.toLocaleString()} EGP
              </p>
            </div>
            <div
              className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Growth
              </p>
              <p
                className={`text-2xl font-bold ${report.growth >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {report.growth >= 0 ? "+" : ""}
                {report.growth.toFixed(2)}%
              </p>
            </div>
            <div
              className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Total Orders
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {report.totalOrders}
              </p>
            </div>
            <div
              className={`rounded-2xl p-4 ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
            >
              <p
                className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
              >
                Avg Order Value
              </p>
              <p
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {avgOrderValue.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}{" "}
                EGP
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl p-5 ${isDark ? "bg-[#1e1f23]" : "bg-white border border-gray-100 shadow-sm"}`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Report Insight
            </h3>
            <p
              className={`text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {report.growth >= 0
                ? `Your business is trending up in ${periodLabel[period].toLowerCase()}, with ${report.growth.toFixed(2)}% growth and ${report.totalOrders} orders.`
                : `Your business slowed down in ${periodLabel[period].toLowerCase()} by ${Math.abs(report.growth).toFixed(2)}%. Focus on increasing order frequency and basket value.`}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
