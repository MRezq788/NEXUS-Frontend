import { Clock } from 'lucide-react';

interface ActiveOrder {
  customer: string;
  table: string;
  status: string;
  time: string;
}

interface TrackOrderProps {
  isDark: boolean;
  activeOrders: ActiveOrder[];
}

export function TrackOrder({ isDark, activeOrders }: TrackOrderProps) {
  if (activeOrders.length === 0) return null;

  return (
    <div className={`px-4 border-t flex flex-col justify-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex gap-3 overflow-x-auto py-3 scrollbar-hide">
        {activeOrders.map((order, index) => (
          <div
            key={index}
            className={`flex-shrink-0 rounded-lg p-3 min-w-[140px] ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <h4 className={`font-medium text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.customer}</h4>
            <div className={`flex items-center justify-between gap-2 text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>{order.table} • {order.status}</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{order.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
