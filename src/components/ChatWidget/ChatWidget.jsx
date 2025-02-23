import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import './ChatWidget.css';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="chat-header">
              <h3>Healthcare Assistant</h3>
              <button className="close-button" onClick={toggleChat}>
                <FiX />
              </button>
            </div>
            <iframe
              src="https://healthcare-bot-v2.vercel.app/"
              title="Healthcare Chatbot"
              className="chat-frame"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chat-toggle-button"
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiMessageSquare className="chat-icon" />
        <span className="chat-label">Chat with AI</span>
      </motion.button>
    </div>
  );
}

export default ChatWidget; 