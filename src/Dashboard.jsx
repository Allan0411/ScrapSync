import React, { useEffect, useRef } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as CartJS } from "chart.js/auto";

const data = {
    labels: ["Eat", "Sleep", "Study"],
    datasets: [
        {
            label: "Streaks",
            data: [10, 20, 15],
            backgroundColor: ["#BA3B46", "#61C9A8", "#ED9B40"],
            borderColor: "AA8F66",
            borderWidth: 1,
        },
    ],
};

export default function Dashboard() {

    return (
        <div>
            <div className="bar">
                <h1>Your habbits</h1>
                <Pie data={data} />
                </div>
        </div>
    );
}
