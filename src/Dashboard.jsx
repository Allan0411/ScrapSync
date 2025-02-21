import React, { useEffect, useState, useRef, useContext } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as CartJS } from "chart.js/auto";
import {db} from "./firebase";
import {collection,getDocs,query,where} from "firebase/firestore";
import { AuthContext } from "./App";



export default function Dashboard() {

    const [habitData,setHabitData]=useState([]);
    const {user,data}=useContext(AuthContext);
    useEffect(()=>{
        const fetchHabits = async()=>{
            try{
                const q= query(collection(db,"habits"),where("creator","==",data.id));
                const querySnapshot=await getDocs(q);
                const HabitsArray=querySnapshot.docs.map(doc=>({
                    name:doc.data().name,
                    streak:doc.data().streak
                }));
                setHabitData(HabitsArray);
            } 
            catch(error)
            {
                console.error("Error fetchingg habits" ,error);

            }
        };
        fetchHabits();
    },[data?.id]);

    const label=habitData.map(habit=>habit.name);
    const streak=habitData.map(habit=>habit.streak);

    const data1 = {

        labels: label,
        datasets: [
            {
                label: "Habit Streaks",
                data: streak,
                backgroundColor: ["#BA3B46", "#61C9A8", "#ED9B40","#72BF78"],
                borderColor: "AA8F66",
                borderWidth: 1,
            },
        ],
    };
    

    return (
        <div>
            <div className="bar">
                <h1>Your habbits</h1>
                <Pie data={data1} />
                </div>
        </div>
    );
}
