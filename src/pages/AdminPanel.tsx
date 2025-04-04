import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Autosuggest from 'react-autosuggest';

interface Participant {
  userId: string;
  name: string;
  participationPoints: number;
}

const AdminPanel: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [points, setPoints] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Participant[]>([]);
  const [value, setValue] = useState<string>('');
  const adminId = 'admin123'; // Ideally, this comes from your authentication mechanism

  // Fetch participants on component mount.
  useEffect(() => {
    fetch('http://localhost:3000/admin/participants', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'admin-id': adminId, // This header is used by your Express middleware to verify admin access
      },
    })
      .then(response => response.json())
      .then((data: Participant[]) => setParticipants(data))
      .catch(error => console.error('Error fetching participants:', error));
  }, []);

  // Function to update points (positive to add, negative to remove)
  const updatePoints = (userId: string, points: number) => {
    fetch(`http://localhost:3000/admin/modify/${userId}`, {
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
      console.log(`Updated points for ${userId}: ${points}`);
  };

  // Handler for form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const names = value
      .split(',')
      .map(n => n.trim().toLowerCase())
      .filter(n => n.length > 0);
  
    if (names.length === 0 || !points) return;
  
    const matched = participants.filter(p =>
      names.includes(p.name.toLowerCase())
    );
  
    if (matched.length === 0) {
      console.error('No matching participants found.');
      return;
    }
  
    matched.forEach(participant => {
      updatePoints(participant.userId, Number(points));
    });
  
    setValue('');
    setPoints('');
  };
  

  // Handlers for input changes
  const handlePointsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPoints(e.target.value);
  };

  // Autosuggest handlers
  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestions = (input: string) => {
    const lastWord = input.split(',').pop()?.trim().toLowerCase() || '';
    if (lastWord.length === 0) return [];
  
    return participants.filter(p =>
      p.name.toLowerCase().startsWith(lastWord)
    );
  };

  const getSuggestionValue = (suggestion: Participant) => suggestion.name;

  const renderSuggestion = (suggestion: Participant) => (
    <div>
      {suggestion.name}
    </div>
  );

  const onChange = (_event: FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (
    _event: React.FormEvent<any>,
    { suggestion }: { suggestion: Participant }
  ) => {
    const parts = value.split(',');
    parts[parts.length - 1] = suggestion.name; // Replace the last part
    const newValue = parts.join(', ').replace(/\s+,/g, ','); // Clean up space/comma formatting
    setValue(newValue);
  };

  const inputProps = {
    placeholder: 'Type a participant name / Must click name from dropdown',
    value,
    onChange,
    className: 'w-full border border-gray-300 rounded-md p-2',
  };

  return (
    <div className='flex flex-col w-full mt-24 bg-white p-4'>
      <h1 className='text-center text-2xl font-bold mb-4'>Admin Panel</h1>
      <h2 className='text-xl font-semibold mb-2'>Participants List:</h2>
      <ul className='mb-8'>
        {participants.map((p) => (
          <li key={p.userId} className='mb-1'>
            - {p.name} - Points: {p.participationPoints}
          </li>
        ))}
      </ul>
      <h2 className='text-xl font-semibold mb-4'>Update Participant Points</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          onSuggestionSelected={onSuggestionSelected}
          theme={{
            container: 'relative',
            suggestionsContainer: 'absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1',
            suggestion: 'p-2',
            suggestionHighlighted: 'bg-gray-200'
          }}
        />
        <div className='flex flex-row'>
        <p className='text-center'>Points to Update</p>
          <input
            type="number"
            value={points}
            onChange={handlePointsChange}
            placeholder="Points (positive to add, negative to remove)"
            className='w-full p-2 border border-gray-300 rounded-md'
          />
        </div>
        <button className='bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600' type="submit">Update Points</button>
      </form>
    </div>
  );
};

export default AdminPanel;
