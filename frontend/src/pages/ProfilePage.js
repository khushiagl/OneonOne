import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchWithToken from '../refresh';

const backendUrl = process.env.REACT_APP_BACKEND_URL;


function UserProfilePage() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      // Replace with the actual token retrieval method and API endpoint
      const token = localStorage.getItem('token');
      try {
        const response = await fetchWithToken('/api/users/profile/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(prevState => ({ ...prevState, ...data }));
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);


  return (
    <main  className="pt-16 md:pt-20">
    <div className="container mx-auto mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-xl mb-4 font-bold">My Profile</h1>
        <p>First Name: {profile.first_name}</p>
        <p>Last Name: {profile.last_name}</p>
        <p>Username: {profile.username}</p>
        <p>Email: {profile.email}</p>
      </div>
    </div>
    </main>
  );
}

export default UserProfilePage;
