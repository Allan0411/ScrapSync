import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import Firebase config
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const HomePage = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch habits on component mount
  useEffect(() => {
    const fetchHabits = async () => {
      const habitsCollection = await getDocs(collection(db, 'habits'));
      setHabits(habitsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchHabits();
  }, []);

  const addHabit = async () => {
    const docRef = await addDoc(collection(db, 'habits'), { name: newHabit, streak: 0, lastCompletedDate: null });
    setHabits([...habits, { id: docRef.id, name: newHabit, streak: 0, lastCompletedDate: null }]);
    setNewHabit("");
    setIsModalOpen(false); // Close the modal after adding the habit
  };

  const deleteHabit = async (id) => {
    await deleteDoc(doc(db, 'habits', id));
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const markDone = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedStreak = habit.lastCompletedDate === today ? habit.streak : habit.streak + 1;
    await updateDoc(doc(db, 'habits', habit.id), { streak: updatedStreak, lastCompletedDate: today });
    setHabits(habits.map(h => h.id === habit.id ? { ...h, streak: updatedStreak, lastCompletedDate: today } : h));
  };

  return (
    <div style={{ padding: '20px', position: 'relative', minHeight: '100vh' }}>
      <h1>Habit Tracker</h1>
      
      <div>
        {habits.map(habit => (
          <div key={habit.id} style={{ border: '1px solid', margin: '10px', padding: '10px' }}>
            <h2>{habit.name}</h2>
            <p>Streak: {habit.streak}</p>
            <button onClick={() => markDone(habit)}>Mark as Done</button>
            <button onClick={() => deleteHabit(habit.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#6200ea',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '24px',
          cursor: 'pointer',
        }}
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>

      {/* Modal for adding a habit */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '300px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h2>Add New Habit</h2>
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              placeholder="Enter habit name"
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: '#ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  backgroundColor: '#6200ea',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
