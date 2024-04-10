import React from 'react';
import { NavLink, useNavigate} from 'react-router-dom';
import logo from '../images/logo.svg'; 

function Navbar() {
  const navigate = useNavigate();
  const hiddenPaths = ['/login', '/register'];
  const shouldHideNavbar = hiddenPaths.includes(window.location.pathname);
  if (shouldHideNavbar) {
    return null;
  }

  const getNavLinkClass = ({ isActive }) => {
    return isActive ? "mr-2 hover:text-gray-400 text-white bg-gray-700 rounded px-3 py-1" : "mr-2 hover:text-gray-400";
  };

  const handleSignOut = (event) => {
    event.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white body-font shadow w-full top-0 fixed z-10">
      <div className="container mx-auto flex flex-wrap p-5 flex-row items-center">
        <NavLink to="/" className="flex title-font font-medium items-center text-white md:justify-start">
          <img src={logo} className="h-10 md:w-20 md:h-16 p-2" alt="Logo" />
          <span className="hidden md:inline-block text-xl">1on1 Meeting Scheduler</span>
        </NavLink>
        <div className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
          <NavLink to="/schedules" className={getNavLinkClass}>Schedules</NavLink>
          <NavLink to="/contacts" className={getNavLinkClass}>Contacts</NavLink>
          <NavLink to="/profile" className={getNavLinkClass}>Profile</NavLink>
          <a href="/login" onClick={handleSignOut} className="cursor-pointer mr-2 hover:text-gray-400">Sign Out</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
