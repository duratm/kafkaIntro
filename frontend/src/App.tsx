import React, { useEffect, useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/kafka/stream');

    eventSource.onmessage = function (event) {
      setMessages(prevMessages => [...prevMessages, event.data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleSendMessage = async () => {
    await fetch('http://localhost:3000/kafka/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
  };

  return (
    <div>
      <h1>Kafka SSE Demo</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send Message to Kafka</button>
      <h2>Messages from Server:</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
