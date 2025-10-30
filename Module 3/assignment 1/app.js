import { useState, useEffect } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ name: "", text: "" });

  // Fetch all messages from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/messages")
      .then(res => res.json())
      .then(data => setMessages(data));
  }, []);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const newMessage = await response.json();
    setMessages([...messages, newMessage]);
    setForm({ name: "", text: "" });
  };

  return (
    <div>
      <h1>Message Board</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Message"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
        />
        <button type="submit">Send</button>
      </form>

      <ul>
        {messages.map(msg => (
          <li key={msg.id}>
            <b>{msg.name}</b>: {msg.text} <em>({msg.time})</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
