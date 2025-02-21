import React from 'react'
import { NavLink } from "react-router-dom";
export default function Navbar() {
  return (
      <nav className='navigation'>
          <ul>
              <li>
                  <NavLink to="/Home" activeStyle={{ color:'#5754a8' }}className={"nv"}>Home</NavLink>
              </li>
              <li>
                <NavLink to="/Community" className={"nv"}>Community</NavLink>
              </li>
              <li>
                  <NavLink to="/Profile" className={"nv"}>Profile</NavLink>
              </li>
              <li>
                  <NavLink to="/Dashboard" className={"nv"}>Dashboard</NavLink>
              </li>
          </ul>
   </nav>
 )
}
