import React, { useState, useEffect } from 'react';
import { settingApi } from '../api/settingApi';
import { Settings as SettingsIcon, ShieldCheck, History, Save, Loader2, CheckCircle } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [storeName, setStoreName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('8.50');
  const [shippingFee, setShippingFee] = useState('15.00');

  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    try {
      const res = await settingApi.getSettings();
      if (res.success) {
        const s = res.data.settings;
        setStoreName(s.store_name || 'ShopMaster Enterprise');
        setSupportEmail(s.support_email || 'support@shopmaster.com');
        setCurrency(s.currency || 'USD');
        setTaxRate(s.tax_rate || '8.50');
        setShippingFee(s.shipping_fee || '15.00');
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await settingApi.getAuditLogs({ page, limit: 15 });
      if (res.success) {
        setAuditLogs(res.data.logs);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs(1);
    }
  }, [activeTab]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await settingApi.updateSettings({
        storeName,
        supportEmail,
        currency,
        taxRate: parseFloat(taxRate),
        shippingFee: parseFloat(shippingFee)
      });
      if (res.success) setSuccessMsg('System settings updated successfully');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="text-emerald-400" size={24} /> System Settings & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure global store parameters, tax rates, currency, and review system audit trails</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'general' ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SettingsIcon size={16} /> General Settings
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === 'audit' ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History size={16} /> System Audit Trail
        </button>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl">
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Default Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Flat Shipping Fee ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 px-3 text-xs text-slate-100 outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* System Audit Trail Tab */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={20} /> System Audit Trail & Inventory History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Action Type</th>
                  <th className="py-3 px-4">Quantity Changed</th>
                  <th className="py-3 px-4">New Stock Level</th>
                  <th className="py-3 px-4">Audit Note</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500">Loading audit logs...</td></tr>
                ) : auditLogs.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-slate-500">No audit logs recorded yet.</td></tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono text-slate-500">#{log.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{log.product_name || `Product #${log.product_id}`}</td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize font-semibold text-emerald-400">{log.change_type}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">{log.quantity_changed}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-300">{log.new_stock_quantity} units</td>
                      <td className="py-3.5 px-4 text-slate-400">{log.note}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
