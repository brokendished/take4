// ✅ components/ChatbotChat.js
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatbotChat.module.css';

export default function ChatbotChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! What can I help you with today? You can type or click: Plumbing, AC, Broken Appliance." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const name = '';     // Optional: pull from auth later
  const email = '';
  const phone = '';
  const image = '';
  const category = '';

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, name, email, phone, category, image })
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages([...newMessages, { role: 'assistant', content: "Oops! Something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'assistant' ? styles.botMsg : styles.userMsg}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatRef} />
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

