import { lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat";
import { useEffect, useState, useRef, useMemo } from "react";
const ReactMarkdown = lazy(() => import("react-markdown"));
import remarkGfm from "remark-gfm";
import { logoutUser } from "../../auth/services/auth.api.js";

const Dashboard = () => {
  const chat = useChat();

  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // this is for delete sidebar history
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);

  const messagesEndRef = useRef(null);

  const isLoading = useSelector((state) => state.chat.isLoading);
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  // to reduce unnecesary re-renders
  const chatList = useMemo(() => {
    return Object.values(chats || {}).sort(
      (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
    );
  }, [chats]);

  const user = useSelector((state) => state.auth.user);

  // loading optimization
  useEffect(() => {
    const init = async () => {
      chat.initializeSocketConnection();
      await chat.handleGetChats();
    };
    init();
  }, []);

  useEffect(() => {
    const savedChatId = localStorage.getItem("currentChatId");

    if (savedChatId && chats[savedChatId]) {
      chat.handleOpenChat(savedChatId, chats);
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chats, currentChatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    const trimmed = input.trim();
    if (!trimmed) return;

    try {
      await chat.handleSendMessage({
        message: trimmed,
        chatId: currentChatId,
      });
    } catch (err) {
      console.error(err);
    }

    setInput("");
  };

  const openChat = (chatId) => {
    setIsNewMessage(false);
    chat.handleOpenChat(chatId, chats);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white flex-col md:flex-row relative">
      <aside
        className={`fixed md:static top-0 left-0 h-full z-50 w-64 bg-[#0d0d0d] border-r border-gray-800/50 transform transition-transform duration-300 flex flex-col
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0`}
      >
        {/*  Button sidebar Close*/}
        <div className="md:hidden p-3 flex justify-end absolute right-0 top-1.5 z-10">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-white text-lg font-extrabold"
          >
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-gray-800/50">
          <h1 className="text-lg font-semibold text-white/90 font-serif">
            Neurovia
          </h1>
        </div>

        {/* Chat List History*/}
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 relative">
          {chatList.map((chatItem) => (
            <div
              key={chatItem.id}
              onMouseEnter={() => setHoveredChatId(chatItem.id)}
              onMouseLeave={() => setHoveredChatId(null)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer group
          ${
            currentChatId === chatItem.id
              ? "bg-neutral-800 border border-neutral-600 text-white"
              : "text-gray-400 hover:text-white hover:bg-neutral-800/50"
          }`}
            >
              {/* Recent Chat Title */}
              <div
                onClick={() => openChat(chatItem.id)}
                className="flex-1 truncate"
              >
                {chatItem.title}
              </div>

              <div className="relative">
                {(hoveredChatId === chatItem.id ||
                  openMenuChatId === chatItem.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuChatId(
                        openMenuChatId === chatItem.id ? null : chatItem.id,
                      );
                    }}
                    className="px-2 text-gray-100 hover:text-white text-md font-extrabold"
                  >
                    ⋮
                  </button>
                )}

                {/* Delete */}
                {openMenuChatId === chatItem.id && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 bottom-full mb-1 w-28 bg-neutral-900 border border-gray-700 rounded-lg shadow-lg z-50"
                  >
                    <button
                      onClick={() => {
                        setOpenMenuChatId(null);
                        chat.handleDeleteChat(chatItem.id);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-neutral-800"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-800/50 space-y-3">
          {/* New Chat */}
          <button
            onClick={chat.handleNewChat}
            className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm cursor-pointer"
          >
            + New Chat
          </button>

          {/* Logged In User  */}
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800 transition">
            <div className="w-9 h-9 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0] || "U"}
            </div>

            <div className="flex flex-col overflow-hidden">
              <span className="text-sm text-white truncate">
                {user?.name || "User"}
              </span>
              <span className="text-xs text-gray-400 truncate">
                {user?.email || "user@email.com"}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/30 rounded-lg text-left transition cursor-pointer text-white font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden p-3 flex items-center justify-between">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">
          ☰
        </button>

        <span className="text-gray-200 text-md">Neurovia AI</span>
      </div>

      {/* Main */}

      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
          {/* Messages */}
          <div className="no-scrollbar flex-1 overflow-y-auto space-y-4 pr-2">
            {chats[currentChatId]?.messages?.length > 0 ? (
              chats[currentChatId].messages.map((msg, index) => (
                <div
                  key={index}
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
                      <Suspense
                        fallback={<span className="text-gray-500">...</span>}
                      >
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 mb-2">
                                {children}
                              </ul>
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
                      </Suspense>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-shadow-white text-4xl text-center px-4 mask-radial-from-neutral-800">
                Welcome To Neurovia AI 🤖
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI answering... */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-neutral-800 text-gray-400 text-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </span>
              </div>
            </div>
          )}

          {/* User Input Section */}
          <div className="mt-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="rounded-xl border border-gray-700 bg-neutral-900/50 overflow-hidden">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  disabled={isLoading}
                  className="w-full px-4 py-4 bg-transparent text-white text-sm focus:outline-none disabled:opacity-50"
                />

                <div className="flex justify-end px-3 py-2 border-t border-gray-800">
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:opacity-50"
                  >
                    {isLoading ? "Thinking..." : "Send"}
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

      {/* logout functionality */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10">
          <div className="bg-neutral-900 border border-gray-700 rounded-xl p-6 w-[90%] max-w-sm">
            <h2 className="text-white text-lg font-semibold mb-3">
              Confirm Logout
            </h2>

            <p className="text-gray-400 text-sm mb-5">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    await logoutUser();

                    localStorage.removeItem("user");
                    localStorage.removeItem("currentChatId");

                    window.location.href = "/login";
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
