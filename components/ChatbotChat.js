import { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatbotChat.module.css';

export default function ChatbotChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hey! What can I help you with today? You can type or click: Plumbing, AC, Broken Appliance.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  const videoRef = useRef(null);
  const chatRef = useRef(null);

  const name = '';
  const email = '';
  const phone = '';
  const image = '';
  const category = '';

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
        body: JSON.stringify({
          messages: newMessages,
          name,
          email,
          phone,
          category,
          image,
        }),
      });

      const data = await res.json();
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply },
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Oops! Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const startLiveChat = async () => {
    setLive(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error('Failed to access camera/mic', err);
    }
  };

  const stopLiveChat = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setLive(false);
  };

  const takeScreenshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    setMessages([...messages, { role: 'user', content: '[📸 Snapshot taken]' }]);
    console.log('Screenshot captured:', dataURL);
  };

  const toggleCamera = () => {
    stopLiveChat();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(startLiveChat, 500); // restart after a moment
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

        {live && stream && (
          <div className={styles.videoWrapper}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={styles.videoPreview}
            />
            <p className={styles.videoNote}>🎥 You’re live — capturing video/audio</p>
            <div className={styles.videoControls}>
              <button onClick={takeScreenshot}>📸 Snap</button>
              <button onClick={toggleCamera}>🔄 Flip Camera</button>
              <button onClick={stopLiveChat}>✖️ Stop</button>
            </div>
          </div>
        )}
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

      {!live && (
        <div className={styles.liveButtonWrapper}>
          <button onClick={startLiveChat} className={styles.liveButton}>
            🎥 Start Live Chat
          </button>
        </div>
      )}
    </div>
  );
}
