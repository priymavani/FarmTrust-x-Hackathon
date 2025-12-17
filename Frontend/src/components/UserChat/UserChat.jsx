import React, { useState, useEffect, useRef } from 'react';
import { BsSearch, BsPaperclip, BsSend } from 'react-icons/bs';
import { FaCircle } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import userImage from '../../assets/rajesh.jpg';
import './UserChat.css'; // Ensure the CSS file name is correct

// Initialize Socket.IO connection
const socket = io('https://farmtrust-x-hackathon.onrender.com', {
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
  const messagesContainerRef = useRef(null);
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

    // Handle incoming messages and update chats + active thread
    socket.on('receiveMessage', (message) => {
      const userEmailForRoom = message.sender.type === 'customer' ? message.sender.email : message.receiverEmail;
      const farmerEmailForRoom = message.sender.type === 'farmer' ? message.sender.email : message.receiverEmail;
      const messageRoom = `${String(userEmailForRoom).toLowerCase()}_${String(farmerEmailForRoom).toLowerCase()}`;

      setChats(prevChats => {
        let found = false;
        const updated = prevChats.map(chat => {
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
          updated.push({
            userEmail: userEmailForRoom,
            farmerEmail: farmerEmailForRoom,
            farmerName: farmerEmailForRoom,
            userName: userEmailForRoom,
            lastMessage: message,
            lastMessageAt: message.createdAt || new Date(),
            createdAt: new Date(),
          });
        }

        return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
      });

      if (!selectedChat) return;
      const selectedRoom = `${selectedChat.userEmail.toLowerCase()}_${selectedChat.farmerEmail.toLowerCase()}`;
      if (selectedRoom === messageRoom) {
        setMessages(prevMessages => [...prevMessages, message]);
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
          ? `https://farmtrust-x-hackathon.onrender.com/chat/conversations/customer/${currentUser_Email}`
          : `https://farmtrust-x-hackathon.onrender.com/chat/conversations/farmer/${currentUser_Email}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Fetched chats:', data); // Debug log to inspect data

      const normalizedChats = data.map(chat => ({
        userEmail: chat.userEmail || chat.participants?.userEmail || '',
        farmerEmail: chat.farmerEmail || chat.participants?.farmerEmail || '',
        farmerName: chat.farmerName || chat.participants?.farmerName || chat.farmerEmail || '',
        userName: chat.userName || chat.participants?.userName || chat.userEmail || '',
        lastMessage: chat.lastMessage || (chat.messages?.length ? chat.messages[chat.messages.length - 1] : null),
        lastMessageAt: chat.lastMessageAt || chat.updatedAt || chat.createdAt || new Date(),
        createdAt: chat.createdAt || new Date(),
      }));

      setChats(normalizedChats);

      // Join all chat rooms for this user so realtime works after refresh
      normalizedChats.forEach(chat => {
        if (!chat.userEmail || !chat.farmerEmail) return;
        socket.emit('joinChat', {
          userEmail: String(chat.userEmail).toLowerCase(),
          farmerEmail: String(chat.farmerEmail).toLowerCase(),
        });
      });

      // Handle farmerEmail from query
      if (farmerEmailFromQuery) {
        const chatWithFarmer = normalizedChats.find(
          (chat) =>
            chat.farmerEmail &&
            chat.farmerEmail.toLowerCase() === farmerEmailFromQuery.toLowerCase()
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
      const response = await fetch('https://farmtrust-x-hackathon.onrender.com/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChat),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const createdChat = await response.json();
      console.log('New chat created:', createdChat);
      const normalizedChat = {
        userEmail: createdChat.participants?.userEmail || '',
        farmerEmail: createdChat.participants?.farmerEmail || '',
        farmerName: createdChat.farmerName || createdChat.participants?.farmerName || createdChat.participants?.farmerEmail || '',
        userName: createdChat.userName || createdChat.participants?.userName || createdChat.participants?.userEmail || '',
        lastMessage: null,
        lastMessageAt: createdChat.lastMessageAt || createdChat.updatedAt || createdChat.createdAt || new Date(),
        createdAt: createdChat.createdAt || new Date(),
      };

      socket.emit('joinChat', {
        userEmail: String(normalizedChat.userEmail).toLowerCase(),
        farmerEmail: String(normalizedChat.farmerEmail).toLowerCase(),
      });

      setChats((prevChats) => [...prevChats, normalizedChat]);
      selectChat(normalizedChat); // Automatically select the new chat
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
  const fetchMessages = async (userEmail, farmerEmail) => {
    try {
      const response = await fetch(`https://farmtrust-x-hackathon.onrender.com/chat/history?userEmail=${userEmail}&farmerEmail=${farmerEmail}`);
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
    const userEmail = chat.userEmail || '';
    const farmerEmail = chat.farmerEmail || '';

    setSelectedChat({
      userEmail,
      farmerEmail,
      name: userType === 'customer' ? chat.farmerName || farmerEmail : chat.userName || userEmail,
    });
    setError(null);
    
    // Update the URL with the farmer's email
    navigate(`/user/messages?farmerEmail=${farmerEmail}`, { replace: true });

    // Fetch messages for the selected chat
    fetchMessages(userEmail, farmerEmail);
  };

  // Always keep the view pinned to the latest message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Send a message
  const sendMessage = () => {
    if (message.trim() === '' || !selectedChat) return;

    // Emit the message to the server
    socket.emit('sendMessage', {
      senderType: userType === 'customer' ? 'customer' : 'farmer',
      senderEmail: currentUser_Email,
      receiverType: userType === 'customer' ? 'farmer' : 'customer',
      receiverEmail: userType === 'customer' ? selectedChat.farmerEmail : selectedChat.userEmail,
      content: message,
    });

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
              const userEmail = chat.userEmail || '';
              const farmerEmail = chat.farmerEmail || '';
              const normalizedUserEmail = userEmail.toLowerCase();
              const normalizedFarmerEmail = farmerEmail.toLowerCase();

              return (
                <div
                  key={`${normalizedUserEmail}-${normalizedFarmerEmail}`} // Use a combination of emails as the key
                  className={`conversation-item ${
                    selectedChat &&
                    selectedChat.userEmail.toLowerCase() === normalizedUserEmail &&
                    selectedChat.farmerEmail.toLowerCase() === normalizedFarmerEmail
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
                      <span className="user-name">{userType === 'customer' ? (chat.farmerName || chat.farmerEmail) : (chat.userName || chat.userName )}</span>
                      <span className="message-time">{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div className="message-preview">
                      {chat.lastMessage?.content || 'No messages yet'}
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
                      chat.userEmail?.toLowerCase() === selectedChat.userEmail.toLowerCase() &&
                      chat.farmerEmail?.toLowerCase() === selectedChat.farmerEmail.toLowerCase()
                  )?.createdAt || new Date()
                )}
              </div>
            </div>
            <div className="messages-container" ref={messagesContainerRef}>
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