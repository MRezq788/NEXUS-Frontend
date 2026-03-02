import { useEffect, useState } from "react";

export type TimePeriod = "week" | "month" | "year";

export interface ChartData {
  label: string;
  value: number;
}

export interface ChartPlaceholderProps {
  isDark: boolean;
  data?: ChartData[];
  period?: TimePeriod;
  isLoading?: boolean;
}

const defaultWeeklyData: ChartData[] = [
  { label: "Mon", value: 65 },
  { label: "Tue", value: 45 },
  { label: "Wed", value: 80 },
  { label: "Thu", value: 55 },
  { label: "Fri", value: 70 },
  { label: "Sat", value: 60 },
  { label: "Sun", value: 85 },
];

const defaultMonthlyData: ChartData[] = [
  { label: "Week 1", value: 320 },
  { label: "Week 2", value: 450 },
  { label: "Week 3", value: 380 },
  { label: "Week 4", value: 520 },
];

const defaultYearlyData: ChartData[] = [
  { label: "Jan", value: 1200 },
  { label: "Feb", value: 1450 },
  { label: "Mar", value: 1100 },
  { label: "Apr", value: 1600 },
  { label: "May", value: 1800 },
  { label: "Jun", value: 1650 },
  { label: "Jul", value: 2100 },
  { label: "Aug", value: 1950 },
  { label: "Sep", value: 2300 },
  { label: "Oct", value: 2050 },
  { label: "Nov", value: 2500 },
  { label: "Dec", value: 2800 },
];

const colorSchemes = {
  week: [
    { color: "from-blue-500 to-blue-600", glow: "#3b82f6" },
    { color: "from-indigo-500 to-indigo-600", glow: "#6366f1" },
    { color: "from-violet-500 to-violet-600", glow: "#8b5cf6" },
    { color: "from-purple-500 to-purple-600", glow: "#a855f7" },
    { color: "from-fuchsia-500 to-pink-600", glow: "#d946ef" },
    { color: "from-rose-500 to-rose-600", glow: "#f43f5e" },
    { color: "from-orange-500 to-amber-600", glow: "#f97316" },
  ],
  month: [
    { color: "from-blue-500 to-cyan-500", glow: "#06b6d4" },
    { color: "from-emerald-500 to-teal-500", glow: "#14b8a6" },
    { color: "from-amber-500 to-yellow-500", glow: "#eab308" },
    { color: "from-violet-500 to-purple-500", glow: "#a855f7" },
  ],
  year: [
    { color: "from-blue-500 to-indigo-500", glow: "#6366f1" },
    { color: "from-indigo-500 to-violet-500", glow: "#8b5cf6" },
    { color: "from-violet-500 to-fuchsia-500", glow: "#d946ef" },
    { color: "from-fuchsia-500 to-rose-500", glow: "#f43f5e" },
    { color: "from-rose-500 to-orange-500", glow: "#f97316" },
    { color: "from-orange-500 to-amber-500", glow: "#f59e0b" },
    { color: "from-emerald-500 to-green-500", glow: "#22c55e" },
    { color: "from-green-500 to-lime-500", glow: "#84cc16" },
    { color: "from-cyan-500 to-sky-500", glow: "#0ea5e9" },
    { color: "from-sky-500 to-blue-500", glow: "#3b82f6" },
    { color: "from-purple-500 to-pink-500", glow: "#ec4899" },
    { color: "from-pink-500 to-rose-500", glow: "#f43f5e" },
  ],
};

export const ChartPlaceholder = ({
  isDark,
  data,
  period = "week",
  isLoading = false,
}: ChartPlaceholderProps) => {
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState<number[]>([]);

  const chartData = data || (period === "week" ? defaultWeeklyData : period === "month" ? defaultMonthlyData : defaultYearlyData);
  const colors = colorSchemes[period];

  // Reset animation when period changes
  useEffect(() => {
    setProgress(new Array(chartData.length).fill(0));
    
    // Staggered animation for each bar
    const timeouts: number[] = [];
    chartData.forEach((_, i) => {
      const delay = i * 100;
      const duration = 800;
      
      const startTime = Date.now() + delay;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(2, -10 * p);
        
        setProgress(prev => {
          const newValues = [...prev];
          newValues[i] = eased * chartData[i].value;
          return newValues;
        });
        
        if (p < 1) {
          timeouts.push(window.requestAnimationFrame(animate));
        }
      };
      
      timeouts.push(window.requestAnimationFrame(animate));
    });

    return () => {
      timeouts.forEach(id => window.cancelAnimationFrame(id));
    };
  }, [period, animKey, chartData]);

  // Re-animate on period change
  useEffect(() => {
    setAnimKey(k => k + 1);
  }, [period]);

  return (
    <div
      className={`relative h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden transition-all duration-500 ${
        isDark ? "bg-[#18191b]" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]"
              : "bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_60%)]"
          }`}
        />
      </div>

      <div className="relative h-full flex items-end justify-around px-1 sm:px-2 pb-2 sm:pb-4 pt-8 sm:pt-10">
        {chartData.map((item, i) => {
          const maxValue = Math.max(...chartData.map(d => d.value), 1);
          const heightPercent = item.value === 0 
            ? 2 
            : Math.min(((progress[i] || 0) / maxValue) * 85, 90);
          
          // Responsive bar width logic
          const barWidth = chartData.length > 12 
            ? "w-1.5 sm:w-2 mb-0.5" 
            : chartData.length > 7 
              ? "w-3 sm:w-4 lg:w-5 mb-1" 
              : "w-4 sm:w-6 lg:w-8 mb-1.5";
              
          const containerMaxWidth = chartData.length > 12 
            ? "max-w-[15px] sm:max-w-[20px]" 
            : chartData.length > 7 
              ? "max-w-[25px] sm:max-w-[35px]" 
              : "max-w-[35px] sm:max-w-[50px]";
          
          // Responsive label visibility
          const showLabel = chartData.length > 12 ? (i % 2 === 0) : true;
          
          return (
            <div
              key={i}
              className={`flex flex-col items-center h-full flex-1 ${containerMaxWidth} group cursor-pointer`}
            >
              <div className="relative w-full flex items-end justify-center flex-1 min-h-0">
                <div
                  className={`absolute -top-6 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded text-[8px] font-bold transition-all duration-200 z-10 ${
                    isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900 shadow-md"
                  } opacity-0 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-1 whitespace-nowrap`}
                >
                  {Math.round(progress[i] || 0)}
                </div>

                <div
                  className={`${barWidth} rounded-t-md sm:rounded-t-lg relative overflow-hidden transition-all duration-300 group-hover:scale-x-110 lg:group-hover:scale-x-125`}
                  style={{
                    height: `${Math.max(heightPercent, 2)}%`,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-t ${colors[i % colors.length].color}`} />
                  <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-white/40 to-transparent opacity-50" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
                </div>
              </div>

              <span
                className={`text-[5px] sm:text-[8px] font-semibold uppercase tracking-wider truncate w-full text-center mt-2 transition-all duration-200 ${
                  isDark ? "text-gray-500 group-hover:text-gray-300" : "text-gray-500 group-hover:text-gray-900"
                } ${showLabel ? "opacity-100" : "opacity-0 sm:opacity-100"}`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
