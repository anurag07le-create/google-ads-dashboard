import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";

import Leads from "./pages/Leads";
import Overview from "./pages/Overview";
import Alerts from "./pages/Alerts";
import Performance from "./pages/Performance";
import Revenue from "./pages/Revenue";
import SourceAnalysis from "./pages/SourceAnalysis";

// GUARD: Protects routes from unauthenticated users
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-pucho-purple animate-pulse">Loading Pucho OS...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const DummyPage = ({ title }) => (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-subtle flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
            <p className="text-gray-500 max-w-sm mt-2">This is a dummy page generated for layout demonstration purposes.</p>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    {/* Admin Area */}
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Overview />} />
                        <Route path="leads" element={<Leads />} />
                        <Route path="alerts" element={<Alerts />} />
                        <Route path="performance" element={<Performance />} />
                        <Route path="revenue" element={<Revenue />} />
                        <Route path="sources" element={<SourceAnalysis />} />
                    </Route>

                    {/* Salesman Area */}
                    <Route path="/salesman" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Overview />} />
                        <Route path="leads" element={<Leads />} />
                        <Route path="alerts" element={<Alerts />} />
                        <Route path="revenue" element={<Revenue />} />
                        <Route path="sources" element={<SourceAnalysis />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
