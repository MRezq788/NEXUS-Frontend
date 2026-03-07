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
    <div className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Track Order</h3>
        <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {activeOrders.length}
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {activeOrders.map((order, index) => (
          <div
            key={index}
            className={`flex-shrink-0 rounded-lg p-3 min-w-[140px] ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}
          >
            <h4 className={`font-medium text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.customer}</h4>
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {order.table} • {order.status}
            </p>
            <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              <Clock className="w-3 h-3" />
              <span>{order.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
