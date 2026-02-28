import { useEffect, useState } from "react";

interface ChartPlaceholderProps {
  isDark: boolean;
}

export const ChartPlaceholder = ({ isDark }: ChartPlaceholderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const data = [
    { label: "Mon", value: 65, color: "from-blue-500 to-blue-600" },
    { label: "Tue", value: 45, color: "from-indigo-500 to-indigo-600" },
    { label: "Wed", value: 80, color: "from-violet-500 to-violet-600" },
    { label: "Thu", value: 55, color: "from-purple-500 to-purple-600" },
    { label: "Fri", value: 70, color: "from-fuchsia-500 to-pink-600" },
    { label: "Sat", value: 60, color: "from-rose-500 to-rose-600" },
    { label: "Sun", value: 85, color: "from-orange-500 to-amber-600" },
  ];

  return (
    <div
      className={`relative h-56 rounded-2xl overflow-hidden ${
        isDark ? "bg-[#18191b]" : "bg-gradient-to-br from-gray-50 to-gray-100"
      }`}
    >
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 opacity-30 ${
            isDark
              ? "bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_50%)]"
              : "bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent_50%)]"
          }`}
        />
      </div>

      <div className="relative h-full flex items-end justify-around px-6 pb-6 pt-8">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 flex-1 max-w-[60px]"
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="relative w-full flex items-end justify-center h-36">
              <div
                className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                  isDark
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900 shadow-lg"
                } ${hoveredBar === i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
              >
                {item.value}%
              </div>

              <div
                className={`w-10 rounded-t-xl bg-gradient-to-t ${item.color} transition-all duration-700 cursor-pointer relative overflow-hidden`}
                style={{
                  height: isVisible ? `${item.value}%` : "0%",
                  transitionDelay: `${i * 100}ms`,
                  transform: hoveredBar === i ? "scaleX(1.15)" : "scaleX(1)",
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent opacity-0 ${
                    hoveredBar === i ? "opacity-100" : ""
                  } transition-opacity duration-300`}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"
                  style={{
                    opacity: hoveredBar === i ? 0.5 : 0.2,
                  }}
                />

                {hoveredBar === i && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                )}
              </div>
            </div>

            <span
              className={`text-xs font-medium ${
                isDark ? "text-gray-500" : "text-gray-500"
              } ${hoveredBar === i ? (isDark ? "text-white" : "text-gray-900") : ""} transition-colors duration-200`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <span
            className={`text-xs font-medium ${isDark ? "text-gray-500" : "text-gray-500"}`}
          >
            This Week
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <svg
            className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <svg
            className={`w-4 h-4 ${isDark ? "text-gray-500" : "text-gray-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
