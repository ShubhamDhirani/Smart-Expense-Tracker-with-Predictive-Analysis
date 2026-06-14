import { useState } from "react";
import { sendMessage } from "../api/chat";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentMessage = message;

    setMessage("");

    setLoading(true);

    try {
      const res = await sendMessage(currentMessage);

      const assistantMessage = {
        role: "assistant",
        content: res.data.response,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (err) {
      const errorMessage = {
        role: "assistant",
        content:
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to contact assistant.",
      };

      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 px-4 py-3 rounded-full shadow-lg border"
      >
        💬
      </button>

      {/* Popup */}

      {open && (
       <div
         className="
         fixed
         bottom-20
         right-6
         w-[420px]
         h-[600px]
         bg-white
         dark:bg-gray-800
         text-black
         dark:text-white
         border
         border-gray-300
         dark:border-gray-700
         rounded-xl
         shadow-xl
         flex
         flex-col
       "
>
          <div className="bg-blue-600 text-white p-4 rounded-t-xl">
            <h3 className="font-semibold">
              AI Financial Assistant
            </h3>

            <p className="text-sm opacity-90">
              Powered by Mistral + LangChain
            </p>
          </div>

          <div
            className="
            flex-1
            overflow-y-auto
            p-4
            space-y-3
          "
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.role === "user"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-2 rounded max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-500">
                Assistant is thinking...
              </div>
            )}
          </div>

          <div className="border-t dark:border-gray-700 p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="
                w-full
                border
                dark:border-gray-600
                dark:bg-gray-700
                dark:text-white
                p-2
                rounded
                mb-2
              "
              rows="2"
              placeholder="Ask about your finances..."
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="
                w-full
                bg-blue-600
                text-white
                py-2
                rounded
                hover:bg-blue-700
                disabled:opacity-50
              "
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          
        </div>
      )}
    </>
  );
}

export default Chatbot;