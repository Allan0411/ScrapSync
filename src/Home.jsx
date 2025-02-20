import React, { useContext } from 'react';
import { AuthContext } from "./App"; 

export default function Home() {
    const { user } = useContext(AuthContext); 

    return (
        <div>
          Home
        </div>
    );
}
