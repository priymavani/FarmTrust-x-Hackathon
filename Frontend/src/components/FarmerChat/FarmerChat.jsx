import React, { useState, useEffect, useRef } from 'react';
import { BsSearch, BsPaperclip, BsSend } from 'react-icons/bs';
import { FaCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import userImage from '../../assets/rajesh.jpg';
import './FarmerChat.css';

const socket = io('https://farmtrust-x-hackathon.onrender.com', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

const FarmerChat = () => {
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Recent');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);
  const navigate = useNavigate();

  const currentUser_Email = sessionStorage.getItem('email');
  const userType = sessionStorage.getItem('role');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userEmailFromQuery = queryParams.get('userEmail');

  useEffect(() => {
    if (!currentUser_Email || !userType || userType !== 'farmer') {
      console.log('User  not logged in or not a farmer, redirecting to /login');
      navigate('/login');
    }
  }, [currentUser_Email, userType, navigate]);

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

  const fetchChats = async () => {
    try {
      const endpoint = `https://farmtrust-x-hackathon.onrender.com/chat/conversations/farmer/${currentUser_Email}`;
      console.log('Fetching chats from:', endpoint);
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched chats:', data);
      setChats(data);

      // Join all chat rooms for this farmer
      data.forEach(chat => {
        const normalizedUser_Email = chat.userEmail.toLowerCase();
        const normalizedFarmerEmail = chat.farmerEmail.toLowerCase();
        socket.emit('joinChat', { userEmail: normalizedUser_Email, farmerEmail: normalizedFarmerEmail }, (response) => {
          console.log(`Joined chat room for ${normalizedUser_Email}_${normalizedFarmerEmail}:`, response || 'No response from server');
        });
      });

      if (userEmailFromQuery) {
        console.log('User  email from query:', userEmailFromQuery);
        const chatWithUser  = data.find(chat => chat.userEmail.toLowerCase() === userEmailFromQuery.toLowerCase());
        if (chatWithUser ) {
          console.log('Found existing chat:', chatWithUser );
          selectChat(chatWithUser );
        } else {
          console.log('No existing chat found with user:', userEmailFromQuery);
          setError('No chat found with this user. Please start a new conversation.');
          navigate('/farmerpanel/messages', { replace: true });
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats. Please try again later.');
    }
  };

  useEffect(() => {
    if (!currentUser_Email || userType !== 'farmer') return;
    fetchChats();
  }, [currentUser_Email, userType, userEmailFromQuery, navigate]);

  useEffect(() => {
    if (!selectedChat) return;

    const { userEmail, farmerEmail } = selectedChat;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://farmtrust-x-hackathon.onrender.com/chat/history?userEmail=${userEmail}&farmerEmail=${farmerEmail}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched messages:', data);
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages. Please try again.');
      }
    };

    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log('Received message in FarmerChat:', message);
      const userEmailForRoom = message.sender.type === 'customer' ? message.sender.email : message.receiverEmail;
      const farmerEmailForRoom = message.sender.type === 'farmer' ? message.sender.email : message.receiverEmail;
      const messageRoom = `${String(userEmailForRoom).toLowerCase()}_${String(farmerEmailForRoom).toLowerCase()}`;

      // Update chat list preview and ordering
      setChats(prevChats => {
        let found = false;
        const updatedChats = prevChats.map(chat => {
          if (chat.userEmail.toLowerCase() === userEmailForRoom.toLowerCase() &&
              chat.farmerEmail.toLowerCase() === farmerEmailForRoom.toLowerCase()) {
            found = true;
            return {
              ...chat,
              lastMessage: message,
              lastMessageAt: message.createdAt || new Date(),
            };
          }
          return chat;
        });

        if (!found) {
          updatedChats.push({
            userEmail: userEmailForRoom,
            farmerEmail: farmerEmailForRoom,
            userName: userEmailForRoom,
            lastMessage: message,
            lastMessageAt: message.createdAt || new Date(),
          });
        }

        return updatedChats.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      if (!selectedChat) return;
      const selectedRoom = `${selectedChat.userEmail.toLowerCase()}_${selectedChat.farmerEmail.toLowerCase()}`;
      if (selectedRoom === messageRoom) {
        setMessages(prevMessages => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedChat]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim() === '' || !selectedChat) {
      console.log('Cannot send message: Empty message or no chat selected');
      return;
    }

    // Emit the message to the server
    socket.emit('sendMessage', {
      senderType: 'farmer',
      senderEmail: currentUser_Email,
      receiverType: 'customer',
      receiverEmail: selectedChat.userEmail, // Assuming the user is the customer
      content: message,
    }, (response) => {
      if (response && response.error) {
        console.error('Error sending message:', response.error);
        setError(`Failed to send message: ${response.details}`);
      }
    });

    // Clear the input field
    setMessage('');
  };

  const selectChat = (chat) => {
    setSelectedChat({
      userEmail: chat.userEmail,
      farmerEmail: chat.farmerEmail,
      name: chat.userName || chat.userEmail,
    });
    setError(null);
    navigate(`/farmerpanel/messages?userEmail=${chat.userEmail}`, { replace: true });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!currentUser_Email || userType !== 'farmer') {
    return null;
  }

  return (
    <div className="customer-support-container">
      <div className="left-panel">
        <div className="search-container">
          <BsSearch className="search-icon3" />
          <input type="text" placeholder="Search messages..." className="search-input" />
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
          <button
            className={`tab-button ${activeTab === 'Product Inquiry' ? 'active' : ''}`}
            onClick={() => setActiveTab('Product Inquiry')}
          >
            Product Inquiry
          </button>
        </div>

        <div className="conversations-list">
          {error && <div className="error-message">{error}</div>}
          {chats.length === 0 ? (
            <div className="no-chats">No chats yet. Wait for customers to message you!</div>
          ) : (
            chats.map((chat) => (
              <div
                key={`${chat.userEmail}-${chat.farmerEmail}`}
                className={`conversation-item ${selectedChat?.userEmail === chat.userEmail && selectedChat?.farmerEmail === chat.farmerEmail ? 'selected' : ''}`}
                onClick={() => selectChat(chat)}
              >
                <div className="avatar">
                  <img src={userImage} alt={chat.userName || chat.userEmail} />
                </div>
                <div className="conversation-details">
                  <div className="conversation-header">
                    <span className="customer-name">{chat.userName || chat.userEmail}</span>
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
            <div className="customer-header">
              <div className="customer-info">
                <img src={userImage} alt={selectedChat.name} className="customer-avatar" />
                <div className="customer-details">
                  <div className="customer-name">{selectedChat.name}</div>
                  <div className="customer-status">
                    <FaCircle className="status-icon online" />
                    <span>Online</span>
                  </div>
                </div>
              </div>
              <div className="chat-started">
                Chat started on {formatDate(chats.find(chat => chat.userEmail === selectedChat.userEmail && chat.farmerEmail === selectedChat.farmerEmail)?.lastMessageAt || new Date())}
              </div>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
              {messages.length === 0 ? (
                <div className="no-messages">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message, index) => (
                  <div key={index}>
                    {(index === 0 || new Date(message.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString()) && (
                      <div className="date-separator">{formatDate(message.createdAt)}</div>
                    )}
                    <div className={`message ${message.sender.email === currentUser_Email ? 'sent-message' : 'received-message'}`}>
                      <div className="message-content">{message.content}</div>
                      <div className="message-time">{formatTime(message.createdAt)} {message.isRead ? '✓✓' : '✓'}</div>
                    </div>
                  </div>
                ))
              )}
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
              <button className="quick-reply-button" onClick={() => setMessage('Yes, available')}>Yes, available</button>
              <button className="quick-reply-button" onClick={() => setMessage('Price details')}>Price details</button>
              <button className="quick-reply-button" onClick={() => setMessage('Shipping info')}>Shipping info</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default FarmerChat;