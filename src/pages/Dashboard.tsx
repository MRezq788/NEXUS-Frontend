import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  isDark 
}: { 
  title: string; 
  value: string | number; 
  icon: string;
  trend?: string;
  isDark: boolean 
}) => (
  <div className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
    isDark 
      ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-lg shadow-gray-900/50' 
      : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50'
  }`}>
    <div className="flex items-start justify-between">
      <div>
        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {trend && (
          <p className={`text-sm mt-2 ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{trend}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
        isDark ? 'bg-gray-700' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
    </div>
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-10 ${
      isDark ? 'bg-blue-500' : 'bg-blue-500'
    }`}></div>
  </div>
);

const ActivityItem = ({ 
  title, 
  time, 
  icon, 
  isDark 
}: { 
  title: string; 
  time: string; 
  icon: string;
  isDark: boolean 
}) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-opacity-50 transition-colors">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      isDark ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      <span className="text-lg">{icon}</span>
    </div>
    <div className="flex-1">
      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{time}</p>
    </div>
  </div>
);

const ChartPlaceholder = ({ isDark }: { isDark: boolean }) => (
  <div className={`relative h-48 rounded-xl overflow-hidden ${
    isDark ? 'bg-gray-800/50' : 'bg-gray-50'
  }`}>
    <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
      {[65, 45, 80, 55, 70, 60, 85].map((height, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div 
            className="w-8 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
            style={{ height: `${height}%` }}
          ></div>
        </div>
      ))}
    </div>
    <div className={`absolute bottom-2 left-0 right-0 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
      Mon | Tue | Wed | Thu | Fri | Sat | Sun
    </div>
  </div>
);

function WarehouseDashboard({ isDark }: { isDark: boolean }) {
  const activities = [
    { title: 'Inbound shipment #1234 received', time: '2 minutes ago', icon: '📦' },
    { title: 'Outbound order #5678 dispatched', time: '15 minutes ago', icon: '🚚' },
    { title: 'Stock count updated for SKU-001', time: '1 hour ago', icon: '📊' },
    { title: 'Low stock alert: SKU-045', time: '2 hours ago', icon: '⚠️' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Warehouse Dashboard</h2>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Welcome back! Here's what's happening today.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
        }`}>
          ● All Systems Operational
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Stock" value="12,450" icon="📦" trend="+12% from last week" isDark={isDark} />
        <StatCard title="Pending Inbound" value="28" icon="📥" isDark={isDark} />
        <StatCard title="Pending Outbound" value="15" icon="📤" isDark={isDark} />
        <StatCard title="Low Stock Items" value="7" icon="⚠️" trend="Needs attention" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Weekly Activity</h3>
          <ChartPlaceholder isDark={isDark} />
        </div>
        
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          <div className="space-y-2">
            {activities.map((activity, i) => (
              <ActivityItem key={i} {...activity} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Products</h3>
          <div className="space-y-3">
            {['Electronics Kit', 'Home Appliances', 'Office Supplies', 'Fitness Equipment'].map((product, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${
                isDark ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{product}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{234 - i * 45}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Storage Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Zone A</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>75%</span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Zone B</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>45%</span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full w-[45%] rounded-full bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Zone C</span>
                <span className={isDark ? 'text-white' : 'text-gray-900'}>90%</span>
              </div>
              <div className={`h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BusinessOwnerDashboard({ isDark }: { isDark: boolean }) {
  const activities = [
    { title: 'New order #8921 placed', time: '5 minutes ago', icon: '🛒' },
    { title: 'Payment received $1,250', time: '30 minutes ago', icon: '💳' },
    { title: 'Customer feedback received', time: '2 hours ago', icon: '⭐' },
    { title: 'Inventory restocked', time: '3 hours ago', icon: '📦' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Business Dashboard</h2>
          <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your business at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={`px-4 py-2 rounded-xl font-medium transition-all ${
            isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25' 
              : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25'
          }`}>
            + New Order
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$45,230" icon="💰" trend="+15% this month" isDark={isDark} />
        <StatCard title="Total Orders" value="156" icon="📊" trend="+8% this week" isDark={isDark} />
        <StatCard title="Active Customers" value="89" icon="👥" isDark={isDark} />
        <StatCard title="Pending Orders" value="12" icon="⏳" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue Overview</h3>
            <select className={`px-3 py-1 rounded-lg text-sm ${
              isDark ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-700 border-gray-200'
            } border`}>
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <ChartPlaceholder isDark={isDark} />
        </div>
        
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          <div className="space-y-2">
            {activities.map((activity, i) => (
              <ActivityItem key={i} {...activity} isDark={isDark} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Top Products</h3>
          <div className="space-y-3">
            {[
              { name: 'Premium Bundle', sales: 234, color: 'bg-blue-500' },
              { name: 'Standard Package', sales: 189, color: 'bg-green-500' },
              { name: 'Basic Plan', sales: 156, color: 'bg-purple-500' },
              { name: 'Add-on Service', sales: 98, color: 'bg-orange-500' },
            ].map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{product.name}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.sales}</span>
                  </div>
                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className={`h-full ${product.color} rounded-full`} style={{ width: `${(product.sales / 234) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`p-6 rounded-2xl ${
          isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-white border border-gray-100 shadow-xl'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Sales by Category</h3>
          <div className="space-y-4">
            {[
              { category: 'Electronics', value: 35, color: 'from-blue-500 to-blue-600' },
              { category: 'Clothing', value: 25, color: 'from-purple-500 to-purple-600' },
              { category: 'Home & Garden', value: 20, color: 'from-green-500 to-green-600' },
              { category: 'Others', value: 20, color: 'from-gray-500 to-gray-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.category}</span>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  if (user?.role === 'warehouse') {
    return <WarehouseDashboard isDark={isDark} />;
  }

  return <BusinessOwnerDashboard isDark={isDark} />;
}
