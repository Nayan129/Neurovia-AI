import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  console.log(user);
  return (
    <div className="flex items-center justify-center">
      <h1 className="font-bold text-4xl text-center">
        Welcome to Perplexity AI 🤖
      </h1>
    </div>
  );
};

export default Dashboard;
