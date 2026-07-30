import React from 'react';

export const RecentOrdersTable = ({ orders }) => {
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">Completed</span>;
      case 'processing':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">Processing</span>;
      case 'pending':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">Pending</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700 rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-lg font-bold text-slate-100 mb-4">Recent Customer Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders?.map((order) => (
              <tr key={order.order_id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">#{order.order_id}</td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-100">{order.customer_name}</div>
                  <div className="text-xs text-slate-500">{order.customer_email}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-100">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
                <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                <td className="py-3.5 px-4 text-xs text-slate-400">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
