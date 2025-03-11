import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface Participant {
  userId: string;
  name: string;
  participationPoints: number;
}

const AdminPanel: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const adminId = 'admin123'; // Ideally, this comes from your authentication mechanism

  // Fetch participants on component mount.
  useEffect(() => {
    fetch('http://localhost:3000/participants')
      .then(response => response.json())
      .then((data: Participant[]) => setParticipants(data))
      .catch(error => console.error('Error fetching participants:', error));
  }, []);

  // Function to update points (positive to add, negative to remove)
  const updatePoints = (userId: string, points: number) => {
    fetch(`http://localhost:3000/admin/participants/${userId}/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'admin-id': adminId, // This header is used by your Express middleware to verify admin access
      },
      body: JSON.stringify({ points }),
    })
      .then(response => response.json())
      .then((data: { updatedPoints: number; message: string }) => {
        console.log(data.message);
        // Update local state to reflect the change
        setParticipants(prev =>
          prev.map(participant =>
            participant.userId === userId
              ? { ...participant, participationPoints: data.updatedPoints }
              : participant
          )
        );
      })
      .catch(error => console.error('Error updating points:', error));
  };

  // Handler for form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId) return;
    updatePoints(selectedUserId, points);
    setSelectedUserId('');
    setPoints(0);
  };

  // Handlers for input changes
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserId(e.target.value);
  };

  const handlePointsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPoints(Number(e.target.value));
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Participants</h2>
      <ul>
        {participants.map((p) => (
          <li key={p.userId}>
            {p.name} - Points: {p.participationPoints}
          </li>
        ))}
      </ul>
      <h2>Update Participant Points</h2>
      <form onSubmit={handleSubmit}>
        <select value={selectedUserId} onChange={handleSelectChange}>
          <option value="">Select Participant</option>
          {participants.map((p) => (
            <option key={p.userId} value={p.userId}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={points}
          onChange={handlePointsChange}
          placeholder="Points (positive to add, negative to remove)"
        />
        <button className='bg-white ml-4' type="submit">Update Points</button>
      </form>
    </div>
  );
};

export default AdminPanel;
