import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useEffect } from "react";

const Dashboard = () => {
  const chat = useChat();

  const { user } = useSelector((state) => state.auth);

  console.log(user);

  useEffect(() => {
    chat.initializeSocketConnection();
  }, []);
  return (
    <div className="flex items-center justify-center">
      <h1 className="font-bold text-4xl text-center">
        Welcome to Perplexity AI 🤖
      </h1>
    </div>
  );
};

export default Dashboard;
