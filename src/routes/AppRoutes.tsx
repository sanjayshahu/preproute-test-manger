import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateTest from "../pages/CreateTest";
import AddQuestions from "../pages/AddQuestions";

function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
 <Route
        path="/tests/create"
        element={
          <ProtectedRoute>
            <CreateTest />
          </ProtectedRoute>
        }
      />

       <Route
    path="/tests/:testId/questions"
    element={<ProtectedRoute><AddQuestions /></ProtectedRoute>}
  />

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}