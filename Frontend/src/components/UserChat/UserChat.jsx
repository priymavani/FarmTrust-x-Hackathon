import React, { useState, useEffect, useRef } from 'react';
import { BsSearch, BsPaperclip, BsSend } from 'react-icons/bs';
import { FaCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import userImage from '../../assets/rajesh.jpg';
import './UserChat.css';

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

  const currentUserEmail = sessionStorage.getItem('email');
  const userType = sessionStorage.getItem('role');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const farmerEmailFromQuery = queryParams.get('farmerEmail');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUserEmail || !userType) {
      console.log('User not logged in, redirecting to /login');
      navigate('/login');
    }
  }, [currentUserEmail, userType, navigate]);

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

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Fetch all chats for the user
  const fetchChats = async () => {
    try {
      const endpoint =
        userType === 'customer'
          ? `http://localhost:5000/chat/conversations/customer/${currentUserEmail}`
          : `http://localhost:5000/chat/conversations/farmer/${currentUserEmail}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setChats(data);

      // Join all chat rooms
      data.forEach((chat) => {
        socket.emit('joinChat', { chatId: chat._id, userEmail: currentUserEmail.toLowerCase() });
      });

      // Handle farmerEmail from query
      if (farmerEmailFromQuery) {
        const chatWithFarmer = data.find(
          (chat) => chat.farmerEmail.toLowerCase() === farmerEmailFromQuery.toLowerCase()
        );
        if (chatWithFarmer) {
          selectChat(chatWithFarmer);
        } else {
          // Start a new chat if none exists
          const farmer = await fetchFarmerDetails(farmerEmailFromQuery);
          if (farmer && farmer.email) {
            const newChat = {
              _id: null, // Will be set by backend
              participants: {
                userEmail: currentUserEmail,
                farmerEmail: farmerEmailFromQuery,
              },
              messages: [],
              lastMessageAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              farmerName: farmer.name,
            };
            setChats((prevChats) => {
              if (
                prevChats.some(
                  (chat) => chat.farmerEmail.toLowerCase() === farmerEmailFromQuery.toLowerCase()
                )
              ) {
                return prevChats;
              }
              return [newChat, ...prevChats];
            });
            setSelectedChat({
              userEmail: currentUserEmail,
              farmerEmail: farmerEmailFromQuery,
              name: farmer.name,
            });
            // Join the new chat room (chatId will be set after creation)
            socket.emit('joinChat', {
              chatId: null, // Backend will assign this
              userEmail: currentUserEmail.toLowerCase(),
              // farmerEmail:farmerEmailFromQuery.toLowerCase(),
            });
          } else {
            setError('Farmer not found. Please try another farmer.');
            navigate('/user/messages', { replace: true });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please try again later.');
    }
  };

  useEffect(() => {
    if (!currentUserEmail || !userType) return;
    fetchChats();
  }, [currentUserEmail, userType, farmerEmailFromQuery]);

  // Fetch farmer details
  const fetchFarmerDetails = async (farmerEmail) => {
    try {
      const response = await fetch(`http://localhost:5000/api/farmer/${farmerEmail}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      return null;
    }
  };

  // Fetch messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/chat/history/${selectedChat.userEmail}/${selectedChat.farmerEmail}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMessages(data.messages || []);
        if (data._id) {
          setSelectedChat((prev) => ({ ...prev, _id: data._id }));
          socket.emit('joinChat', { chatId: data._id, userEmail: currentUserEmail.toLowerCase() });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again.');
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Handle incoming messages
  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      if (!selectedChat || !selectedChat._id) return;
      if (
        (message.sender.type === 'customer' &&
          message.sender.email.toLowerCase() === selectedChat.userEmail.toLowerCase() &&
          message.receiverEmail.toLowerCase() === selectedChat.farmerEmail.toLowerCase()) ||
        (message.sender.type === 'farmer' &&
          message.sender.email.toLowerCase() === selectedChat.farmerEmail.toLowerCase() &&
          message.receiverEmail.toLowerCase() === selectedChat.userEmail.toLowerCase())
      ) {
        setMessages((prevMessages) => [...prevMessages, message]);
        setChats((prevChats) =>
          prevChats
            .map((chat) =>
              chat._id === selectedChat._id
                ? { ...chat, lastMessageAt: new Date(), lastMessage: message }
                : chat
            )
            .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        );
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedChat]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send a message
  const sendMessage = () => {
    if (message.trim() === '' || !selectedChat) return;

    const newMessage = {
      sender: {
        type: userType,
        email: currentUserEmail,
      },
      content: message,
      isRead: false,
      createdAt: new Date(),
    };

    const messageData = {
      chatId: selectedChat._id || null, // Null for new chats
      senderEmail: currentUserEmail,
      senderType: userType,
      content: message,
      receiverEmail: userType === 'customer' ? selectedChat.farmerEmail : selectedChat.userEmail,
    };

    socket.emit('sendMessage', messageData, (response) => {
      if (response && response.error) {
        setError(`Failed to send message: ${response.details}`);
      } else if (response && response.chatId) {
        setSelectedChat((prev) => ({ ...prev, _id: response.chatId }));
      }
    });

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.userEmail === selectedChat.userEmail && chat.farmerEmail === selectedChat.farmerEmail
          ? { ...chat, lastMessageAt: new Date(), lastMessage: newMessage }
          : chat
      )
    );
    setMessage('');
  };

  // Select a chat
  const selectChat = (chat) => {
    setSelectedChat({
      _id: chat._id,
      userEmail: chat.userEmail,
      farmerEmail: chat.farmerEmail,
      name: userType === 'customer' ? chat.farmerName : chat.userName,
    });
    setError(null);
    navigate(`/user/messages?farmerEmail=${chat.farmerEmail}`, { replace: true });
  };

  // Date and time formatting
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUserEmail || !userType) return null;

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
          {chats.length === 0 && farmerEmailFromQuery ? (
            <div className="no-chats">Starting a new chat...</div>
          ) : chats.length === 0 ? (
            <div className="no-chats">No chats yet. Start a conversation!</div>
          ) : (
            chats.map((chat) => (
              <div
                key={`${chat.userEmail}-${chat.farmerEmail}`}
                className={`conversation-item ${
                  selectedChat?.userEmail === chat.userEmail && selectedChat?.farmerEmail === chat.farmerEmail
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
                    <span className="user-name">{userType === 'customer' ? chat.farmerName : chat.userName}</span>
                    <span className="message-time">{formatTime(chat.lastMessageAt)}</span>
                  </div>
                  <div className="message-preview">{chat.lastMessage?.content || 'No messages yet'}</div>
                  <div className="message-date">{formatDate(chat.lastMessageAt)}</div>
                </div>
              </div>
            ))
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
                      chat.userEmail === selectedChat.userEmail && chat.farmerEmail === selectedChat.farmerEmail
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
                        message.sender.email === currentUserEmail ? 'sent-message' : 'received-message'
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