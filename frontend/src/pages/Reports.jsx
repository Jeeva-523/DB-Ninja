import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/reportApi';
import { BarChart3, Download, Calendar, Award, Layers, TrendingUp, DollarSign } from 'lucide-react';

export const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date Filters
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, topRes, catRes] = await Promise.all([
        reportApi.getSalesReport(startDate, endDate),
        reportApi.getTopProducts(10),
        reportApi.getCategoryBreakdown()
      ]);

      if (salesRes.success) setSalesData(salesRes.data.report);
      if (topRes.success) setTopProducts(topRes.data.products);
      if (catRes.success) setCategoryData(catRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const handleExportCsv = () => {
    window.open(`/api/v1/reports/export/csv?startDate=${startDate}&endDate=${endDate}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="text-emerald-400" size={24} /> Executive Reports & Sales BI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Analyze revenue performance, top selling items, and export financial ledgers</p>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Download size={16} /> Export Sales CSV
        </button>
      </div>

      {/* Date Range Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Date Range Filter</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-1.5 px-3 text-xs text-slate-100 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-1.5 px-3 text-xs text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid: Best Sellers & Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 10 Best Sellers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Award className="text-amber-400" size={20} /> Top Selling Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topProducts.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{p.product_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{p.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{p.category_name}</td>
                    <td className="py-3 px-3 font-bold text-slate-200">{p.total_units_sold} units</td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400">
                      ${Number(p.total_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Revenue Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Layers className="text-emerald-400" size={20} /> Category Sales Distribution
          </h3>
          <div className="space-y-4">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-bold text-slate-200">{cat.category_name}</span>
                  <span className="font-bold text-emerald-400">${Number(cat.category_revenue).toFixed(2)}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (Number(cat.category_revenue) / 100000) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                  <span>{cat.order_count} total orders</span>
                  <span>{cat.items_sold} items sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Sales Ledger Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-400" size={20} /> Daily Financial Revenue Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4">Gross Subtotal</th>
                <th className="py-3 px-4">Tax Total</th>
                <th className="py-3 px-4">Shipping Total</th>
                <th className="py-3 px-4 text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {salesData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">{row.date}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">{row.total_orders} orders</td>
                  <td className="py-3.5 px-4 text-slate-300">${Number(row.gross_subtotal).toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-400">${Number(row.total_tax).toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-slate-400">${Number(row.total_shipping).toFixed(2)}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">${Number(row.net_revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
