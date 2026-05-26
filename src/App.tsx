import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';

// Admin Pages
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { signOut } = useAuth();
  
  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Subscribers', path: '/admin/subscribers' },
    { name: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-[#080A0F]">
      <aside className="w-64 bg-primary border-r border-white/5 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-playfair font-bold text-gold">Admin Panel</h2>
        </div>
        <nav className="flex-1 flex flex-col gap-2 px-4">
          {navLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link 
                key={link.name} 
                to={link.path}
                className={`px-4 py-2 rounded transition-colors ${isActive ? 'bg-gold/10 text-gold font-bold border-l-2 border-gold' : 'text-cream/70 hover:text-white hover:bg-white/5'}`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={signOut} className="w-full text-left px-4 py-2 text-maroon hover:bg-maroon/10 rounded transition">Log Out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

const Dashboard = () => <div className="text-white text-2xl font-playfair">Admin Dashboard <br/><span className="text-sm text-cream/50">(Analytics logic goes here)</span></div>;
const Products = () => <div className="text-white text-2xl font-playfair">Products Management</div>;
const Orders = () => <div className="text-white text-2xl font-playfair">Orders Management</div>;
const Subscribers = () => <div className="text-white text-2xl font-playfair">Subscribers Management</div>;
const Settings = () => <div className="text-white text-2xl font-playfair">Settings</div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  
  // Secure check: Only allow this specific email to access the admin panel
  if (user.email !== 'sb108750@gmail.com') {
    return <Navigate to="/" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-primary text-cream font-inter">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            <Route path="/admin/*" element={
                <AdminGuard>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="subscribers" element={<Subscribers />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminGuard>
              } 
            />
          </Routes>
        </div>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#C8860A',
            color: '#0D0F14',
            borderRadius: '8px',
            fontWeight: 'bold'
          }
        }} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
