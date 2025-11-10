import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/tasks`)
    const data = await res.json()
    setTasks(data)
    setLoading(false)
  }

  async function addTask(e) {
    e.preventDefault()
    if (!title.trim()) return
    const res = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, details })
    })
    if (res.ok) {
      const t = await res.json()
      setTasks(prev => [t, ...prev])
      setTitle('')
      setDetails('')
    } else {
      alert('Failed to add')
    }
  }

  async function toggleComplete(id, completed) {
    await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed })
    })
    fetchTasks()
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function editTask(id) {
    const newTitle = prompt('New title:')
    if (newTitle == null) return
    await fetch(`${API_BASE}/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle })
    })
    fetchTasks()
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1>Task Manager (Local)</h1>

      <form onSubmit={addTask} style={{ marginBottom: 16 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: 8, width: '60%' }} />
        <input placeholder="Details (optional)" value={details} onChange={e => setDetails(e.target.value)} style={{ padding: 8, marginLeft: 8, width: '30%' }} />
        <button style={{ marginLeft: 8, padding: '8px 12px' }}>Add</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map(t => (
            <li key={t.id} style={{ display: 'flex', alignItems: 'center', padding: 8, border: '1px solid #eee', marginBottom: 8 }}>
              <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t.id, t.completed)} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontWeight: 'bold', textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{t.details}</div>
              </div>
              <div>
                <button onClick={() => editTask(t.id)} style={{ marginRight: 8 }}>Edit</button>
                <button onClick={() => deleteTask(t.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <small>Data saved to local file <code>server/db.sqlite</code></small>
    </div>
  )
}

createRoot(document.getElementById('root')).render(React.createElement(App))
