import { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Update the socket connection line:
// It will use the live URL if it exists, otherwise it falls back to localhost
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
const socket = io.connect(backendUrl);

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  // --- JOIN ROOM LOGIC ---
  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true); // Flip the UI to show the chat box
    }
  };

  // --- SEND MESSAGE LOGIC ---
  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      await socket.emit("send_message", messageData);
      // Add a temporary ID for our own UI so React doesn't complain about missing keys
      setMessageList((list) => [...list, { ...messageData, id: Math.random().toString() }]);
      setCurrentMessage("");
    }
  };

  // --- RECEIVE MESSAGE LOGIC ---
  useEffect(() => {
    socket.on("load_messages", (previousMessages) => {
      const formattedMessages = previousMessages.map(msg => ({
        id: msg._id,
        room: msg.room,
        author: msg.author,
        message: msg.message,
        time: msg.time
      }));
      setMessageList(formattedMessages);
    });

    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };
    
    socket.on("receive_message", receiveMessageHandler);

    return () => {
      socket.off("load_messages");
      socket.off("receive_message", receiveMessageHandler);
    };
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center font-sans">
      
      {/* CONDITIONAL RENDERING: Show Login OR Chat */}
      {!showChat ? (
        
        /* LOGIN SCREEN */
        <div className="bg-white p-10 rounded-xl shadow-lg flex flex-col gap-4 w-80 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Join a Chat</h3>
          <input
            type="text"
            placeholder="Username (e.g. John)"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID (e.g. 123)"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500"
            onChange={(event) => setRoom(event.target.value)}
            onKeyPress={(event) => { event.key === "Enter" && joinRoom(); }}
          />
          <button 
            onClick={joinRoom}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition"
          >
            Join Room
          </button>
        </div>

      ) : (

        /* CHAT SCREEN */
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[600px]">
          <div className="bg-blue-600 p-4 text-white font-bold text-lg flex justify-between">
            <span>Room: {room}</span>
            <span className="text-sm font-normal bg-blue-700 px-2 py-1 rounded">User: {username}</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messageList.map((msgContent) => {
              // Check if the message was sent by the current user to align it left or right
              const isMe = username === msgContent.author;
              return (
                <div key={msgContent.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`p-3 rounded-lg shadow-sm max-w-[80%] ${isMe ? "bg-blue-500 text-white" : "bg-white border border-gray-100 text-gray-800"}`}>
                    {!isMe && <div className="text-xs font-bold text-gray-500 mb-1">{msgContent.author}</div>}
                    <div>{msgContent.message}</div>
                    <div className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                      {msgContent.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(event) => setCurrentMessage(event.target.value)}
              onKeyPress={(event) => { event.key === "Enter" && sendMessage(); }}
            />
            <button 
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2 font-semibold transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;