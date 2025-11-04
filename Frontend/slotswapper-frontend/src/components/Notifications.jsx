import { useEffect, useState } from 'react';
import API from '../api';
import '../styles/Notifications.css';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  function getAuth() {
    return { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } };
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get('/swap-requests', getAuth());
      setIncoming(res.data.incoming);
      setOutgoing(res.data.outgoing);
    } finally {
      setLoading(false);
    }
  };

  const respondToSwap = async (id, accept) => {
    await API.post(`/swap-response/${id}`, { accept }, getAuth());
    setMsg(accept ? "Swap accepted!" : "Swap rejected.");
    fetchRequests();
  };

  return (
    <div className="notif-container">
      <h2>Notifications & Requests</h2>
      {msg && <div className="notif-msg">{msg}</div>}

      <div className="notif-section">
        <h3>Incoming Swap Requests</h3>
        {loading ? <div>Loading...</div> :
          (incoming.length === 0 ? <p>No incoming requests.</p> :
            <ul>
              {incoming.map(req => (
                <li key={req._id}>
                  <b>{req.requesterSlot?.title}</b> ({new Date(req.requesterSlot?.startTime).toLocaleString()})
                  <br />
                  <span>⇄ For your slot: <b>{req.recipientSlot?.title}</b> ({new Date(req.recipientSlot?.startTime).toLocaleString()})</span>
                  <div className="notif-btns">
                    {req.status === "PENDING" && (
                      <>
                        <button onClick={() => respondToSwap(req._id, true)} className="accept">Accept</button>
                        <button onClick={() => respondToSwap(req._id, false)} className="reject">Reject</button>
                      </>
                    )}
                    {req.status !== "PENDING" && <span className={`notif-status ${req.status.toLowerCase()}`}>{req.status}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>

      <div className="notif-section">
        <h3>Outgoing Swap Requests</h3>
        {loading ? <div>Loading...</div> :
          (outgoing.length === 0 ? <p>No outgoing requests.</p> :
            <ul>
              {outgoing.map(req => (
                <li key={req._id}>
                  <b>{req.recipientSlot?.title}</b> ({new Date(req.recipientSlot?.startTime).toLocaleString()})
                  <br />
                  <span>⇄ You offered: <b>{req.requesterSlot?.title}</b> ({new Date(req.requesterSlot?.startTime).toLocaleString()})</span>
                  <div>
                    <span className={`notif-status ${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </div>
    </div>
  );
}
