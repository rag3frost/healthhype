import { useState, useRef, useEffect } from 'react';
import './MentalHealth.css';

function MentalHealth() {
  const [messages, setMessages] = useState([{
    type: 'bot',
    content: "Hello! I'm your mental health support assistant. I'm here to listen, provide support, and help you with personalized CBT exercises and self-care strategies. How are you feeling today?"
  }]);
  const [userInput, setUserInput] = useState('');
  const [userMood, setUserMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const moods = [
    { emoji: '😊', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😔', label: 'Down' },
    { emoji: '😢', label: 'Struggling' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMoodSelect = async (mood) => {
    setUserMood(mood);
    const moodMessage = `I'm feeling ${mood.label}`;
    addMessage('user', moodMessage);
    await getChatbotResponse(moodMessage);
  };

  const addMessage = (type, content) => {
    setMessages(prev => [...prev, { type, content }]);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    addMessage('user', userInput);
    const currentInput = userInput;
    setUserInput('');
    await getChatbotResponse(currentInput);
  };

  const getChatbotResponse = async (userMessage) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: "system",
              content: `You are a warm, empathetic mental health companion. Your responses should be brief, natural, and conversational—like a caring friend. Keep it supportive, non-judgmental, and grounded in evidence-based techniques like CBT and mindfulness. Avoid sounding overly formal or robotic. Always acknowledge feelings and gently encourage self-care or reflection without overwhelming the user. Remember, you are an AI assistant, not a substitute for professional mental health care.
                Current user mood: ${userMood?.label || 'Unknown'}`
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      addMessage('bot', data.choices[0].message.content);
    } catch (err) {
      addMessage('bot', 'I apologize, but I am having trouble responding right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mental-health-container">
      <div className="mental-health-header">
        <h2>Mental Health Support</h2>
        <p>A safe space to share your thoughts and receive supportive guidance</p>
      </div>

      <div className="mood-tracker">
        <p>How are you feeling today?</p>
        <div className="mood-buttons">
          {moods.map(mood => (
            <button
              key={mood.label}
              className={`mood-btn ${userMood?.label === mood.label ? 'active' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              title={mood.label}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-interface">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="loading">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-container">
          <div className="input-area">
            <div className="textarea-wrapper">
              <textarea
                className="mental-health-input"
                value={userInput}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= 2000) {
                    setUserInput(text);
                  }
                }}
                placeholder="Type your message here..."
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="character-count">
                {userInput.length}/2000
              </div>
            </div>
            <button
              className="submit-button"
              onClick={handleSubmit}
              disabled={loading || userInput.trim().length === 0}
            >
              {loading ? (
                <div className="loading">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              ) : (
                <>
                  <span>Send</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
                      fill="currentColor"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mental-health-disclaimer">
        <p>
          <strong>Disclaimer:</strong> This AI assistant is not a replacement for professional mental health care.
          If you're experiencing a crisis or need immediate help, please contact emergency services or a mental health professional.
        </p>
      </div>
    </div>
  );
}

export default MentalHealth;