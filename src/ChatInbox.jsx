import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc, where, updateDoc, arrayRemove, addDoc, serverTimestamp } from "firebase/firestore";
import "./Chat.css";
import { AuthContext } from "./App";
export default function ChatInbox() {
    
    return(
        <div>
            <h1>Inbox</h1>
            <button>click</button>
            
        </div>
    )
}
