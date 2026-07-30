import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/orderApi';
import { OrderStatusBadge } from '../components/order/OrderStatusBadge';
import { ShoppingCart, Search, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await orderApi.getAll({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      if (res.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateStatus(orderId, newStatus);
      if (res.success) fetchOrders(pagination.page);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const res = await orderApi.getById(orderId);
      if (res.success) setSelectedOrder(res.data.order);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingCart className="text-emerald-400" size={24} /> Order Fulfillment Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage customer orders, status transitions, and inventory allocations</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name, or email..."
            className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
        >
          <option value="">All Pipeline Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">No orders found.</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">#{o.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-100">{o.customer_name}</div>
                      <div className="text-xs text-slate-500">{o.customer_email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-100">
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-xs text-slate-200 outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => handleViewOrder(o.id)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="bg-slate-950/60 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
              className="p-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200">
              ✕
            </button>
            <h2 className="text-xl font-bold text-slate-100 mb-1">Order Details #{selectedOrder.id}</h2>
            <div className="flex items-center gap-3 mb-6">
              <OrderStatusBadge status={selectedOrder.status} />
              <span className="text-xs text-slate-400">{new Date(selectedOrder.created_at).toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">CUSTOMER</span>
                <div className="font-bold text-slate-200">{selectedOrder.customer_name}</div>
                <div className="text-slate-400">{selectedOrder.customer_email}</div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">SHIPPING ADDRESS</span>
                <div className="text-slate-300">{selectedOrder.address_line1 || 'No address specified'}</div>
                <div className="text-slate-400">{selectedOrder.city ? `${selectedOrder.city}, ${selectedOrder.state} ${selectedOrder.postal_code}` : ''}</div>
              </div>
            </div>

            <h3 className="font-bold text-sm text-slate-200 mb-3">Line Items</h3>
            <div className="divide-y divide-slate-800 border-t border-b border-slate-800 mb-6">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-100">{item.product_name}</div>
                    <div className="text-slate-500 font-mono">SKU: {item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-100">{item.quantity} x ${Number(item.unit_price).toFixed(2)}</div>
                    <div className="text-emerald-400 font-bold">${Number(item.total_price).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end text-xs space-y-1 text-right">
              <div>
                <div className="text-slate-400">Subtotal: <span className="font-semibold text-slate-200">${Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                <div className="text-slate-400">Shipping: <span className="font-semibold text-slate-200">${Number(selectedOrder.shipping_cost).toFixed(2)}</span></div>
                <div className="text-slate-400">Tax: <span className="font-semibold text-slate-200">${Number(selectedOrder.tax_amount).toFixed(2)}</span></div>
                <div className="text-lg font-extrabold text-emerald-400 mt-2">Total: ${Number(selectedOrder.total_amount).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
