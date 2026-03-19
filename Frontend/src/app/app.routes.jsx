import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/chats/pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <h1 className="font-bold text-4xl text-center">
        Welcome to Perplexity AI 🤖
      </h1>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);
