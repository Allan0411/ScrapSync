import React, { useEffect, useState, useContext } from "react";
import { Pie, Bar, Radar } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";
import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "./App";
import Coin from "./Coin.jsx";
import Hand from "./hand.jsx";
import { AnimatePresence, motion } from 'motion/react';

export default function Dashboard() {
    const [habitData, setHabitData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, data } = useContext(AuthContext);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const q = query(collection(db, "habits"), where("creator", "==", data.id));
                const querySnapshot = await getDocs(q);
                const HabitsArray = querySnapshot.docs.map(doc => ({
                    name: doc.data().name,
                    streak: doc.data().streak
                }));
                setHabitData(HabitsArray);
            } catch (error) {
                console.error("Error fetching habits", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHabits();
    }, [data?.id]);

    const labels = habitData.map(habit => habit.name);
    const streaks = habitData.map(habit => habit.streak);

    const generateRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    const backgroundColors = labels.map(() => generateRandomColor());

    const data1 = {
        labels: labels,
        datasets: [
            {
                label: "Habit Streaks",
                data: streaks,
                backgroundColor: backgroundColors,
                borderColor: "#AA8F66",
                borderWidth: 1,
            },
        ],
    };


    if (loading) {
        return <div className="dashboard"><Hand></Hand></div>;
    }

    return habitData.length > 0 ? (
        <motion.div className="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: 2 }}>
            {data && data.Name ? <h1>{data.Name}</h1> : <Hand />}

            <div className="dashboard-points">
                <div className="points">
                    <Coin />
                    {data && data.Name ? <h3>{data.Points}</h3> : <Hand></Hand>}
                </div>
            </div>

            <div className="bar">
                <h1>Your habits</h1>
                <Bar data={data1} />
            </div>

            <div className="bar">
                <Radar data={data1} />
            </div>

            <div className="bar">
                <Pie data={data1} />
            </div>
        </motion.div>
    ) : (
        <motion.div className="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: 2 }}>
            {data && data.Name ? <h1>{data.Name}</h1> : <Hand></Hand>}

            <div className="dashboard-points">
                <div className="points">
                    <Coin />
                    {data && data.Points ? <h3>{data.Points}</h3> :<h3>0</h3>}
                </div>
            </div>
            <div className="bar">
                    <p>No habits found. Start tracking your habits!</p>
                    </div>
        </motion.div>
    );
}
