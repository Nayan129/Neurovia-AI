import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Dashboard = () => {
  const chat = useChat();

  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewMessage, setIsNewMessage] = useState(false);

  const messagesEndRef = useRef(null);

  const isLoading = useSelector((state) => state.chat.isLoading);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  // on load of app open recent active chat
  useEffect(() => {
    const savedChatId = localStorage.getItem("currentChatId");

    if (savedChatId && chats[savedChatId]) {
      chat.handleOpenChat(savedChatId, chats);
    }
  }, [chats]);

  useEffect(() => {
    chat.initializeSocketConnection();
    chat.handleGetChats();
  }, []);

  useEffect(() => {
    if (isNewMessage) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [chats, currentChatId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    setIsNewMessage(true);

    chat.handleSendMessage({
      message: trimmed,
      chatId: currentChatId,
    });

    setInput("");
  };

  const openChat = (chatId) => {
    setIsNewMessage(false);
    chat.handleOpenChat(chatId, chats);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white flex-col md:flex-row relative">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full z-50 w-64 bg-[#0d0d0d] border-r border-gray-800/50 transform transition-transform duration-300
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0`}
      >
        <div className="md:hidden p-3 flex justify-end absolute right-0 top-1.5">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white text-lg font-extrabold"
          >
            ✕
          </button>
        </div>
        <div className="p-4 border-b border-gray-800/50">
          <h1 className="text-lg font-semibold text-white/90">Perplexity</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {Object.values(chats)
            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
            .map((chatItem) => (
              <button
                key={chatItem.id}
                onClick={() => openChat(chatItem.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer
${
  currentChatId === chatItem.id
    ? "bg-neutral-800 border border-neutral-600 text-white"
    : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
}`}
              >
                <span className="block truncate">{chatItem.title}</span>
              </button>
            ))}
        </nav>

        <div className="p-3 border-t border-gray-800/50">
          <button
            onClick={chat.handleNewChat}
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm cursor-pointer"
          >
            + New Chat
          </button>
        </div>
      </aside>

      {/* button menu */}
      <div className="md:hidden p-3 flex items-center justify-between">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">
          ☰
        </button>

        <span className="text-gray-200 text-md">Perplexity</span>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
          {/* Messages */}
          <div className="no-scrollbar flex-1 overflow-y-auto space-y-4 pr-2">
            {chats[currentChatId]?.messages?.length > 0 ? (
              chats[currentChatId].messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`w-fit sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed overflow-y-auto ${
                      msg.role === "user"
                        ? "bg-gray-800/70 border border-gray-700 text-gray-200 ml-auto"
                        : "bg-transparent text-gray-300"
                    }`}
                  >
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-2">
                              {children}
                            </ol>
                          ),
                          code: ({ children }) => (
                            <code className="bg-white/10 px-1 py-0.5 rounded">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-black/40 p-3 rounded-xl overflow-x-auto">
                              {children}
                            </pre>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-shadow-white text-4xl text-center px-4 mask-radial-from-neutral-800">
                Welcome To Perplexity AI 🤖
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-xl bg-neutral-900 text-gray-200 text-sm animate-pulse">
                AI is typing...
              </div>
            </div>
          )}
          {/* Input */}
          <div className="mt-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="rounded-xl border border-gray-700 bg-neutral-900/50 overflow-hidden">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full px-4 py-4 bg-transparent text-white text-sm focus:outline-none"
                />

                <div className="flex justify-end px-3 py-2 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 blur-3xl pointer-events-none" />
    </div>
  );
};

export default Dashboard;
