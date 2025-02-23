import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, where,query, deleteField, Timestamp, arrayUnion  } from 'firebase/firestore';
import { AuthContext } from './App';
import { AnimatePresence, motion } from 'motion/react';
import { div } from 'motion/react-client';


const HomePage = () => {

  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, setUser, data, setData } = useContext(AuthContext);
  const [isloading, setisloading] = useState(false);
      const profileCollection = collection(db, "Profile");
 
    console.log(data);
useEffect(() => {
  const fetchHabits = async () => {
    try {
      setisloading(true);
      if (!data?.id) return; 

      const q = query(collection(db, 'habits'), where("creator", "==", data.id));
      const habitsCollection = await getDocs(q);

      setHabits(habitsCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching habits:", error);
    }
    finally {
      setisloading(false);
    }
  };

  fetchHabits();
}, [data?.id]);

  const addHabit = async () => {
    const docRef = await addDoc(collection(db, 'habits'), { name: newHabit, streak: 0, lastCompletedDate: null,creator:data.id });
    setHabits([...habits, { id: docRef.id, name: newHabit, streak: 0, lastCompletedDate: null,creator:data.id }]);
    setNewHabit("");
    setIsModalOpen(false); 
    const currentUser = doc(db, "Profile", data.id);
await updateDoc(currentUser, { [newHabit]: new Array(12).fill(0) });


  };

  const deleteHabit = async (id, hname) => {
    console.log(hname);
    await deleteDoc(doc(db, 'habits', id));
    setHabits(habits.filter(habit => habit.id !== id));
    const currentUser = doc(db, "Profile", data.id);
      await updateDoc(currentUser, {[hname]: deleteField() 
  });
  };

  const markDone = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedStreak = habit.lastCompletedDate === today ? habit.streak : habit.streak + 1;
  if (updatedStreak > habit.streak) {
  const newPoints = (data.Points || 0) + 1; 
  const currentUser = doc(db, "Profile", data.id);

  await updateDoc(currentUser, { Points: newPoints }); 
  await updateDoc(currentUser, { [habit.name]: today });

  setData({ ...data, Points: newPoints }); 
  console.log("Updated Points:", newPoints);
}

    await updateDoc(doc(db, 'habits', habit.id), { streak: updatedStreak, lastCompletedDate: today });
    setHabits(habits.map(h => h.id === habit.id ? { ...h, streak: updatedStreak, lastCompletedDate: today } : h));
  };

  return (
    <motion.div
      style={{backgroundColor:"#fff"}}
    initial={{opacity: 0 }} 
      animate={{ opacity: 1 }} className='home' >
    <div style={{ padding: '20px', position: 'relative', minHeight: '100vh' }}>
      <h1>Habit Tracker</h1>
       
      <div>
            {habits.map((habit, i) => (
         <motion.div
  key={habit.id}
style={{
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.08)", 
  margin: "1rem",
  marginBottom:"3rem",
  padding: "10px",
  borderRadius: "1rem",
  background: "#f7f8fa"
}}

  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
       whileHover={{ scale: 1.04, transition: { duration: 0.2 } }} 
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "stretch",
      gap: "10px",
      width: "100%",
    }}
  >
    <h2 style={{ flexGrow: 1 }}>{habit.name}</h2>
    <p>Streak: {habit.streak}</p>
    
    <div style={{ width: "20px", textAlign: "center", marginRight:"4px"}}>
      {habit.streak > 0 && <i className="bi bi-fire" style={{ color: "red" }}></i>}
    </div>
  </div>

  <div style={{ display: "flex" }}>
    <motion.button  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => markDone(habit)}>Mark as Done</motion.button>
    <motion.button  whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={() => deleteHabit(habit.id, habit.name)}>Delete</motion.button>
  </div>
</motion.div>

        ))}
      </div>


        <motion.button
           whileTap={{ scale: 0.7 }} whileHover={{ scale: 1.05 }}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#4c5fd5',
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
      </motion.button>

    
        {isModalOpen && (
          <AnimatePresence>
          <motion.div
                     initial={{ opacity: 0 }} 
            animate={{ opacity: 1, transition: 2 }}
              exit={{ opacity: 0, transition: 2 }}
              

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
                height: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "stretch",
             
                
            }}
          >
              <div style={{ width: "100%", justifyItems: "center", alignItems: "center", marginBottom:"8px" }}>
                <h2>Add New Habit</h2></div>
            <input
                type="text"
                  maxLength={90}
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
                <motion.button
          whileTap={{ scale: 0.7 }} whileHover={{ scale: 1.05 }}
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
              </motion.button>
                <motion.button
                    whileTap={{ scale: 0.7 }} whileHover={{ scale: 1.05 }}
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
              </motion.button>
            </div>
          </div>
            </motion.div>
            </AnimatePresence>
      )}
      </div>
      </motion.div>
  );
};

export default HomePage;
