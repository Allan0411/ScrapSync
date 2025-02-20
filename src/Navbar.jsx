import React from 'react'
import { NavLink } from "react-router-dom";
import { Outlet } from 'react-router';
export default function Navbar() {
  return (
      <nav className='navigation'>
          <ul>
              <li>
                  <NavLink to="/Home" className={"nv"}>Home</NavLink>
              </li>
              <li>
                  <NavLink to="/Profile" className={"nv"}>Profile</NavLink>
              </li>
          </ul>
   </nav>
 )
}
