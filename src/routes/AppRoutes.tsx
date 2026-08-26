import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import CreateTest from "../pages/CreateTest";
import AddQuestions from "../pages/AddQuestions";
import TestPreview from "../pages/TestPreview";

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

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* CREATE TEST */}

      <Route
        path="/tests/create"
        element={
          <ProtectedRoute>
            <CreateTest />
          </ProtectedRoute>
        }
      />

      {/* EDIT TEST */}

      <Route
        path="/tests/:testId/edit"
        element={
          <ProtectedRoute>
            <CreateTest />
          </ProtectedRoute>
        }
      />

      {/* QUESTIONS */}

      <Route
        path="/tests/:testId/questions"
        element={
          <ProtectedRoute>
            <AddQuestions />
          </ProtectedRoute>
        }
      />

      {/* PREVIEW */}

      <Route
        path="/tests/:testId/preview"
        element={
          <ProtectedRoute>
            <TestPreview />
          </ProtectedRoute>
        }
      />

      {/* FALLBACK */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}