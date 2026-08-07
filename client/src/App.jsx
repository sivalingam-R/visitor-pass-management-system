import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Visitors from "./pages/Visitors";
import RegisterVisitor from "./pages/RegisterVisitor";
import MyRequests from "./pages/MyRequests";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Register from "./pages/Register";

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <p className="loading-screen">Loading...</p>;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Administrator", "Receptionist", "Employee"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/visitors"
              element={
                <ProtectedRoute allowedRoles={["Administrator", "Receptionist"]}>
                  <Visitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-visitor"
              element={
                <ProtectedRoute allowedRoles={["Receptionist"]}>
                  <RegisterVisitor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute allowedRoles={["Employee"]}>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
