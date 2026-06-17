import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import ElderDetail from './pages/ElderDetail';
import ElderAdd from './pages/ElderAdd';
import ElderEdit from './pages/ElderEdit';
import ElderScheduler from './pages/ElderScheduler';
import CallDetail from './pages/CallDetail';
import TabLayout from './components/TabLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0B1120',
      }}>
        <div className="spinner" />
      </div>
    );
  }
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  return token ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
          <Route element={<PrivateRoute><TabLayout /></PrivateRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/elder/:id" element={<PrivateRoute><ElderDetail /></PrivateRoute>} />
          <Route path="/elder/add" element={<PrivateRoute><ElderAdd /></PrivateRoute>} />
          <Route path="/elder/edit/:id" element={<PrivateRoute><ElderEdit /></PrivateRoute>} />
          <Route path="/elder/scheduler/:elderId" element={<PrivateRoute><ElderScheduler /></PrivateRoute>} />
          <Route path="/call/:id" element={<PrivateRoute><CallDetail /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
