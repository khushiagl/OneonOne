import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../images/logo.svg'; 

function Navbar() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "mr-5 hover:text-gray-400 text-white bg-gray-700 rounded px-3 py-2" : "mr-5 hover:text-gray-400";
  };

  return (
    <nav className="bg-gray-900 text-white body-font shadow w-full">
      <div className="container mx-auto flex flex-wrap p-5 flex-row items-center">
        <NavLink to="/" className="flex title-font font-medium items-center text-white md:justify-start">
          <img src={logo} className="h-16 md:w-20 md:h-20 p-2" alt="Logo" />
          <span className="hidden md:inline-block text-xl">1on1 Meeting Scheduler</span>
        </NavLink>
        <div className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
          <NavLink to="/schedules" className={getNavLinkClass}>Schedules</NavLink>
          <NavLink to="/contacts" className={getNavLinkClass}>Contacts</NavLink>
          <NavLink to="/login" className={getNavLinkClass}>Sign Out</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
