import { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    fetchEvents();
    // eslint-disable-next-line
  }, []);

  function getAuth() {
    return { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } };
  }

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/events', getAuth());
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch events");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return setError("Fill all fields");
    try {
      const res = await API.post(
        '/events', 
        { title, startTime, endTime },
        getAuth()
      );
      setEvents([...events, res.data]);
      setTitle('');
      setStartTime('');
      setEndTime('');
      setError('');
    } catch {
      setError("Create event failed");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(
        `/events/${id}`,
        { status },
        getAuth()
      );
      setEvents(events.map(ev => (ev._id === id ? res.data : ev)));
    } catch {
      setError("Status change failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`, getAuth());
      setEvents(events.filter(ev => ev._id !== id));
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Your Events</h2>
        <button className="dashboard-logout" onClick={() => {
          localStorage.removeItem('token'); navigate('/');
        }}>Logout</button>
      </div>
      <form className="dashboard-form" onSubmit={handleAddEvent}>
        <input
          type="text"
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          required
        />
        <button type="submit">Add Event</button>
      </form>
      {error && <p className="dashboard-error">{error}</p>}
      {loading ? <p>Loading events...</p> : (
        <ul className="events-list">
          {events.map(ev => (
            <li key={ev._id} className={`event-item ${ev.status.toLowerCase()}`}>
              <div>
                <strong>{ev.title}</strong><br/>
                {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()}
              </div>
              <div>
                <span>Status: {ev.status}</span>
                {ev.status === "BUSY" && (
                  <button onClick={() => handleUpdateStatus(ev._id, "SWAPPABLE")}>Make Swappable</button>
                )}
                {ev.status === "SWAPPABLE" && (
                  <button onClick={() => handleUpdateStatus(ev._id, "BUSY")}>Make Busy</button>
                )}
                <button onClick={() => handleDelete(ev._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
