import { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { FaLeaf } from 'react-icons/fa'; // Import leaf icon from react-icons
import farmLogo from '../../assets/FarmTrust-logo.jpg';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get current month for seasonal recommendations
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    // Indian seasons roughly mapped
    if (month >= 2 && month <= 5) return "summer";
    if (month >= 6 && month <= 9) return "monsoon";
    return "winter";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      // Updated to use your backend endpoint with proper error handling
      const response = await fetch('http://localhost:5000/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      
      // Add bot response to chat
      setTimeout(() => {
        setMessages(prevMessages => [
          ...prevMessages, 
          { text: data.response, sender: 'bot' }
        ]);
        setIsLoading(false);
      }, 500); // Small delay for better UX
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { text: "Sorry, I couldn't connect to the server. Please try again later.", sender: 'bot' }
      ]);
      setIsLoading(false);
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
  };

  // Get season-appropriate suggestions
  const getSeasonalSuggestion = () => {
    const season = getCurrentSeason();
    switch (season) {
      case "summer":
        return "What fruits are in season right now in India?";
      case "monsoon":
        return "Which vegetables grow best during monsoon?";
      case "winter":
        return "What are the best winter vegetables to buy?";
      default:
        return "What fruits are in season right now?";
    }
  };

  return (
    <div className="chatbot-container">
      {/* Floating chat button - now using React Icon */}
      <div className="chatbot-button" onClick={toggleChat}>
        <FaLeaf className="chatbot-icon" />
        <div className="notification-dot"></div>
      </div>

      {/* Chat container */}
      <div className={`chat-container ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <img src={farmLogo} alt="FarmTrust Logo" className="logo" />
          <h1>FarmTrust Assistant</h1>
          <button onClick={clearChat} className="clear-btn">Clear</button>
          <button onClick={closeChat} className="close-btn">×</button>
        </div>
        
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>Welcome to FarmTrust!</h2>
              <p>We connect you directly with organic farmers. Ask me about our products, seasonal produce, or sustainable farming practices.</p>
              <div className="suggestion-chips">
                <button onClick={() => setInput(getSeasonalSuggestion())}>
                  {getSeasonalSuggestion()}
                </button>
                <button onClick={() => setInput("How does FarmTrust verify organic products?")}>
                  Verify organic products?
                </button>
                <button onClick={() => setInput("Tell me about your farmer certification")}>
                  Farmer certification
                </button>
                <button onClick={() => setInput("What grains do you offer?")}>
                  Available grains
                </button>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-bubble">
                {message.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot-message">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={sendMessage} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about seasonal produce, organic farming..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;