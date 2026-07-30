import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { StatCard } from '../components/dashboard/StatCard';
import { SalesChart } from '../components/dashboard/SalesChart';
import { RecentOrdersTable } from '../components/dashboard/RecentOrdersTable';
import { LogOut, User, Shield, DollarSign, ShoppingCart, Users, AlertTriangle, RefreshCw } from 'lucide-react';

export const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [sumRes, trendRes, ordersRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getRevenueTrend(30),
        dashboardApi.getRecentOrders(5)
      ]);

      if (sumRes.success) setSummary(sumRes.data.summary);
      if (trendRes.success) setTrend(trendRes.data.trend);
      if (ordersRes.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            S
          </div>
          <span className="font-bold text-slate-100 text-lg">ShopMaster Admin</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-all"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-emerald-400' : ''} />
          </button>

          <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <User size={16} className="text-slate-400" />
            <div className="text-xs text-left">
              <div className="font-medium text-slate-200">{user?.name}</div>
              <div className="text-emerald-400 text-[10px] font-semibold uppercase">{user?.role}</div>
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Executive Analytics Overview</h2>
            <p className="text-sm text-slate-400 mt-1">Real-time revenue, order processing pipeline, and customer insights</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold">
            <Shield size={16} /> Authenticated User: {user?.name} ({user?.role})
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-900 rounded-2xl border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Sales Revenue"
                value={`$${Number(summary?.total_revenue || 0).toLocaleString()}`}
                badgeText="+14.2% month over month"
                icon={DollarSign}
                color="emerald"
              />
              <StatCard
                title="Total Orders"
                value={Number(summary?.total_orders || 0).toLocaleString()}
                badgeText="Active fulfillment pipeline"
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="Total Customers"
                value={Number(summary?.total_customers || 0).toLocaleString()}
                badgeText="Registered user accounts"
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Low Stock Alerts"
                value={summary?.low_stock_count || 0}
                badgeText="Products requiring restock"
                icon={AlertTriangle}
                color="amber"
              />
            </div>

            {/* Sales Revenue Chart */}
            <SalesChart data={trend} />

            {/* Recent Orders Data Table */}
            <RecentOrdersTable orders={orders} />
          </>
        )}
      </main>
    </div>
  );
};
