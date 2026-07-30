import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { CategoryList } from '../pages/CategoryList';
import { ProductList } from '../pages/ProductList';
import { CustomerList } from '../pages/CustomerList';
import { OrderList } from '../pages/OrderList';
import { PaymentList } from '../pages/PaymentList';
import { Reports } from '../pages/Reports';
import { Settings } from '../pages/Settings';
import { Unauthorized } from '../pages/Unauthorized';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes (Authenticated System Users) */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin', 'manager', 'support']} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/payments" element={<PaymentList />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
