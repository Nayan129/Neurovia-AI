import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import { useEffect } from "react";

function App() {
  const auth = useAuth();

  // to wakeup backup server for first render
  useEffect(() => {
    fetch("https://neurovia-ai-evzk.onrender.com");
  }, []);

  useEffect(() => {
    setTimeout(() => {
      auth.handleGetMe();
    }, 0);
  }, []);
  return (
    <>
      <Suspense fallback={<h1>Loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
}

export default App;
