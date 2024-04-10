import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const backendUrl = process.env.REACT_APP_BACKEND_URL;

function RegisterPage() {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const validateForm = () => {
    let formIsValid = true;
    let errors = {};

    if (!userData.username) {
      errors['username'] = 'Username is required';
      formIsValid = false;
    }

    if (!userData.email) {
      errors['email'] = 'Email is required';
      formIsValid = false;
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors['email'] = 'Email is invalid';
      formIsValid = false;
    }

    if (!userData.password) {
      errors['password'] = 'Password is required';
      formIsValid = false;
    }

    if (userData.password !== userData.passwordConfirmation) {
      errors['passwordConfirmation'] = 'Passwords do not match';
      formIsValid = false;
    }

    setErrors(errors);
    return formIsValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(backendUrl + '/api/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            password2: userData.passwordConfirmation,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          setErrors(result);
          throw new Error('Network response was not ok');
        }

        // Registration successful, navigate to login page
        navigate('/login'); // Redirect to login page after successful registration
      } catch (error) {
        console.error('Registration error:', error);
      }
    }
  };

  return (
    <main>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-700">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-3">
            <div className="w-1/2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name:</label>
            <input
                type="text"
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            </div>
            <div>
            <label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name:</label>
            <input
                type="text"
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            </div>
        </div>
        <div>
          <label htmlFor="username" className="text-sm font-medium text-gray-700">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="passwordConfirmation" className="text-sm font-medium text-gray-700">Confirm Password:</label>
          <input
            type="password"
            id="passwordConfirmation"
            name="passwordConfirmation"
            value={userData.passwordConfirmation}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.passwordConfirmation && <p className="text-red-500 text-xs italic">{errors.passwordConfirmation}</p>}
        </div>
        <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Register
            </button>
          </div>
      </form>
      <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="#" onClick={() => navigate('/login')} className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </a>
          </p>
        </div>
    </div>
    </div>
    </main>
  );
}


export default RegisterPage;
