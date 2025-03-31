import React, { useState, useEffect, useRef } from 'react';
import { BsSearch, BsPaperclip, BsSend } from 'react-icons/bs';
import { FaCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import userImage from '../../assets/rajesh.jpg';
import './UserChat.css'; // Ensure the CSS file name is correct

// Initialize Socket.IO connection
const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

const UserChat = () => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const currentUser_Email = sessionStorage.getItem('email'); // Fixed variable name
  const userType = sessionStorage.getItem('role');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const farmerEmailFromQuery = queryParams.get('farmerEmail');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser_Email || !userType) {
      console.log('User  not logged in, redirecting to /login');
      navigate('/login');
    }
  }, [currentUser_Email, userType, navigate]);

  // Socket.IO connection handling
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
    });
    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
      setError('Failed to connect to chat server. Please try again later.');
    });
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    // Handle incoming messages
    socket.on('receiveMessage', (message) => {
      if (selectedChat && 
          (message.sender.email === selectedChat.userEmail || message.sender.email === selectedChat.farmerEmail)) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('receiveMessage');
    };
  }, [selectedChat]);

  // Fetch all chats for the user
  const fetchChats = async () => {
    try {
      const endpoint =
        userType === 'customer'
          ? `http://localhost:5000/chat/conversations/customer/${currentUser_Email}`
          : `http://localhost:5000/chat/conversations/farmer/${currentUser_Email}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched chats:', data); // Debug log to inspect data
      setChats(data);

      // Handle farmerEmail from query
      if (farmerEmailFromQuery) {
        const chatWithFarmer = data.find(
          (chat) =>
            chat.participants?.farmerEmail &&
            chat.participants.farmerEmail.toLowerCase() === farmerEmailFromQuery.toLowerCase()
        );
        if (chatWithFarmer) {
          selectChat(chatWithFarmer);
        } else {
          // If no existing chat, create a new chat
          const newChat = {
            participants: {
              userEmail: currentUser_Email,
              farmerEmail: farmerEmailFromQuery,
            },
            messages: [],
          };
          await createNewChat(newChat);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError(error.message || 'Failed to load chats. Please try again later.');
    }
  };

  // Create a new chat
  const createNewChat = async (newChat) => {
    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChat),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const createdChat = await response.json();
      console.log('New chat created:', createdChat);
      setChats((prevChats) => [...prevChats, createdChat]);
      selectChat(createdChat); // Automatically select the new chat
    } catch (error) {
      console.error('Error creating new chat:', error);
      setError('Failed to start a new chat. Please try again later.');
    }
  };

  useEffect(() => {
    if (!currentUser_Email || !userType) return;
    fetchChats();
  }, [currentUser_Email, userType, farmerEmailFromQuery]);

  // Fetch messages for selected chat
  const fetchMessages = async (chat) => {
    try {
      const response = await fetch(`http://localhost:5000/chat/history?userEmail=${chat.participants?.userEmail}&farmerEmail=${chat.participants?.farmerEmail}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setError('Failed to load chat history.');
    }
  };

  // Select a chat
  const selectChat = (chat) => {
    const userEmail = chat.participants?.userEmail?.toLowerCase() || '';
    const farmerEmail = chat.participants?.farmerEmail?.toLowerCase() || '';

    setSelectedChat({
      userEmail,
      farmerEmail,
      name: userType === 'customer' ? chat.farmerName : chat.userName,
    });
    setError(null);
    
    // Update the URL with the farmer's email
    navigate(`/user/messages?farmerEmail=${farmerEmail}`, { replace: true });

    // Fetch messages for the selected chat
    fetchMessages(chat);
  };

  // Send a message
  const sendMessage = () => {
    if (message.trim() === '' || !selectedChat) return;

    const newMessage = {
      sender: {
        type: userType === 'customer' ? 'customer' : 'farmer',
        email: currentUser_Email,
      },
      content: message,
      createdAt: new Date(),
      isRead: false,
    };

    // Emit the message to the server
    socket.emit('sendMessage', {
      senderType: userType === 'customer' ? 'customer' : 'farmer',
      senderEmail: currentUser_Email,
      receiverType: userType === 'customer' ? 'farmer' : 'customer',
      receiverEmail: userType === 'customer' ? selectedChat.farmerEmail : selectedChat.userEmail,
      content: message,
    });

    // Update local messages state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage('');
  };

  // Date and time formatting
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser_Email || !userType) return null;

  return (
    <div className="user-chat-container">
      <div className="left-panel">
        <div className="search-container">
          <BsSearch className="search-icon2" />
          <input type="text" placeholder="Search chats..." className="search-input" />
        </div>
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'Unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('Unread')}
          >
            Unread
          </button>
          <button
            className={`tab-button ${activeTab === 'Recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('Recent')}
          >
            Recent
          </button>
        </div>
        <div className="conversations-list">
          {error && <div className="error-message">{error}</div>}
          {chats.length === 0 ? (
            <div className="no-chats">No chats yet. Start a conversation!</div>
          ) : (
            chats.map((chat) => {
              const userEmail = chat.participants?.userEmail;
              const farmerEmail = chat.participants?.farmerEmail;

              return (
                <div
                  key={`${userEmail}-${farmerEmail}`} // Use a combination of emails as the key
                  className={`conversation-item ${
                    selectedChat?.userEmail === userEmail &&
                    selectedChat?.farmerEmail === farmerEmail
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => selectChat(chat)}
                >
                  <div className="avatar">
                    <img src={userImage} alt={userType === 'customer' ? chat.farmerName : chat.userName} />
                  </div>
                  <div className="conversation-details">
                    <div className="conversation-header">
                      <span className="user-name">{userType === 'customer' ? chat.farmerEmail : chat.userEmail}</span>
                      <span className="message-time">{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div className="message-preview">
                      {chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet'}
                    </div>
                    <div className="message-date">{formatDate(chat.lastMessageAt)}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="right-panel">
        {error && <div className="error-message">{error}</div>}
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="user-info">
                <img src={userImage} alt={selectedChat.name} className="user-avatar" />
                <div className="user-details">
                  <div className="user-name">{selectedChat.name}</div>
                  <div className="user-status">
                    <FaCircle className="status-icon online" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <div className="chat-started">
                Chat started on{' '}
                {formatDate(
                  chats.find(
                    (chat) =>
                      chat.participants?.userEmail === selectedChat.userEmail &&
                      chat.participants?.farmerEmail === selectedChat.farmerEmail
                  )?.createdAt || new Date()
                )}
              </div>
            </div>
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message, index) => (
                  <div key={index}>
                    {(index === 0 ||
                      new Date(message.createdAt).toDateString() !==
                        new Date(messages[index - 1].createdAt).toDateString()) && (
                      <div className="date-separator">{formatDate(message.createdAt)}</div>
                    )}
                    <div
                      className={`message ${
                        message.sender.email === currentUser_Email ? 'sent-message' : 'received-message'
                      }`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.createdAt)} {message.isRead ? '✓✓' : '✓'}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
              <BsPaperclip className="attachment-icon" />
              <input
                type="text"
                placeholder="Type your message..."
                className="message-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="send-button" onClick={sendMessage}>
                <BsSend className="send-icon" />
              </button>
            </div>
            <div className="quick-replies">
              <button className="quick-reply-button" onClick={() => setMessage('Hey there!')}>
                Hey there!
              </button>
              <button className="quick-reply-button" onClick={() => setMessage('How’s it going?')}>
                How’s it going?
              </button>
              <button className="quick-reply-button" onClick={() => setMessage('See you later')}>
                See you later
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default UserChat;