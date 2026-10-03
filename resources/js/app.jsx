import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../css/app.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import ProductList from './pages/products/ProductList';
import CategoryList from './pages/products/CategoryList';
import CreateTransaction from './pages/transactions/CreateTransaction';
import TransactionList from './pages/transactions/TransactionList';
import TransactionDetail from './pages/transactions/TransactionDetail';
import PrintSettings from './pages/settings/PrintSettings';
import CigaretteReport from './pages/CigaretteReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pelanggan" element={<CustomerList />} />
          <Route path="pelanggan/tambah" element={<CustomerForm />} />
          <Route path="pelanggan/:id/edit" element={<CustomerForm />} />
          <Route path="item" element={<ProductList />} />
          <Route path="item/kategori" element={<CategoryList />} />
          <Route path="bon" element={<TransactionList />} />
          <Route path="bon/buat" element={<CreateTransaction />} />
          <Route path="bon/:id" element={<TransactionDetail />} />
          <Route path="bon/:id/edit" element={<CreateTransaction />} />
          <Route path="laporan/rokok" element={<CigaretteReport />} />
          <Route path="pengaturan" element={<PrintSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
      if (this.state.hasError) {
          return (
              <div className="min-h-screen flex items-center justify-center bg-background p-6">
                  <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-[0_1px_2px_rgb(16_19_24/0.05)] p-6 text-center">
                      <div className="mx-auto mb-3 w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
                          </svg>
                      </div>
                      <h1 className="text-base font-semibold text-gray-900">Halaman bermasalah</h1>
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                          Ada kesalahan pada tampilan. Muat ulang halaman untuk melanjutkan.
                      </p>
                      <details className="mt-4 text-left">
                          <summary className="text-xs text-gray-400 cursor-pointer select-none">Detail teknis</summary>
                          <pre className="mt-2 text-[11px] leading-snug text-gray-500 bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                              {this.state.error && this.state.error.toString()}
                          </pre>
                      </details>
                      <button
                          onClick={() => window.location.reload()}
                          className="mt-5 inline-flex items-center justify-center h-10 px-5 text-sm font-medium rounded-[10px] bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                      >
                          Muat ulang
                      </button>
                  </div>
              </div>
          );
      }
      return this.props.children;
  }
}

const container = document.getElementById('app');
if (container) {
  createRoot(container).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
