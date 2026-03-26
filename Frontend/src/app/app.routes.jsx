import { lazy } from "react";
import { createBrowserRouter } from "react-router";

const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const Dashboard = lazy(() => import("../features/chats/pages/Dashboard"));
import Protected from "../features/auth/components/Protected";
import { Navigate } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <Protected>
        <Dashboard />
      </Protected>
    ),
  },
  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
]);
