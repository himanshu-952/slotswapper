import { useEffect, useState } from 'react';
import API from '../api';
import '../styles/Marketplace.css';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const [slots, setSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [requestedSlotId, setRequestedSlotId] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function getAuth() {
    return { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } };
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    fetchSlots();
    fetchMySwappable();
    // eslint-disable-next-line
  }, []);

  const fetchSlots = async () => {
    const res = await API.get('/swappable-slots', getAuth());
    setSlots(res.data);
  };

  const fetchMySwappable = async () => {
    const res = await API.get('/events', getAuth());
    setMySwappableSlots(res.data.filter(ev => ev.status === 'SWAPPABLE'));
  };

  const openModal = (slotId) => {
    setRequestedSlotId(slotId);
    setModalOpen(true);
  };

  const sendSwapRequest = async () => {
    if (!selectedSlotId) return;
    try {
      await API.post('/swap-request', {
        mySlotId: selectedSlotId,
        theirSlotId: requestedSlotId
      }, getAuth());
      setMessage('Swap request sent!');
      setModalOpen(false);
      setSelectedSlotId('');
      setRequestedSlotId('');
    } catch {
      setMessage('Swap request failed');
    }
  };

  return (
    <div className="marketplace-container">
      <h2>Marketplace: Swappable Slots</h2>
      <ul className="slots-list">
        {slots.length === 0 && <p>No slots are currently available for swap.</p>}
        {slots.map(slot => (
          <li key={slot._id} className="slot-item">
            <strong>{slot.title}</strong>
            <div>{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}</div>
            <button onClick={() => openModal(slot._id)}>Request Swap</button>
          </li>
        ))}
      </ul>
      {modalOpen && (
        <div className="modal-bg">
          <div className="modal">
            <h3>Offer a Slot to Swap</h3>
            <select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)}>
              <option value="">Select your swappable slot</option>
              {mySwappableSlots.map(slot => (
                <option key={slot._id} value={slot._id}>
                  {slot.title} ({new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()})
                </option>
              ))}
            </select>
            <button onClick={sendSwapRequest}>Submit Request</button>
            <button onClick={() => setModalOpen(false)} className="modal-close">Cancel</button>
          </div>
        </div>
      )}
      {message && <div className="marketplace-msg">{message}</div>}
    </div>
  );
}
