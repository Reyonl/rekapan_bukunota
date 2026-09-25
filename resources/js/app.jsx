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
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
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
