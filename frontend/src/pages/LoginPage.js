import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import backgroundImage from '../images/pexels-picjumbocom-196650.jpg';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function LoginPage() {
  const navigate = useNavigate();
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Reset error message on new submission
    
    try {
      const response = await fetch(backendUrl + `/api/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to login. Please check your credentials.');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access);
      localStorage.setItem('refresh', data.refresh);
      navigate("/");

    } catch (error) {
      setError(error.message); // Set a more specific error message if the backend provides it
      console.error('Login error:', error);
    }
  };

  return (
    <main> 
      <div className="flex h-screen bg-gray-200">
      <div className="flex w-1/2">
        <img src={backgroundImage} alt="Login Visual" className="object-cover w-full h-full" />
      </div>
      <div className="flex w-1/2 justify-center items-center">
        <form onSubmit={handleSubmit} className="max-w-sm m-4 w-full">
          <h2 className="text-3xl font-semibold mb-2">Welcome!</h2>
          <div className="mb-4">
            <label htmlFor="username" className="block mb-2">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white text-lg">Log In</button>
          {error && <p className="text-red-500 italic">{error}</p>}
          <div className="mt-4 text-center">
            <p className="text-sm">Don't have an account? <NavLink to="/register" className="text-blue-600 hover:underline">
            Register here
          </NavLink></p>
          </div>
        </form>
    </div></div>  
  </main>
    
  );
}

export default LoginPage;
