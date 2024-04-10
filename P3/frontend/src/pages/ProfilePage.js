import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserProfilePage() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
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
        const response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (profile.password !== profile.passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    // Replace with the actual token retrieval method and API endpoint
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/profile/', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: profile.password,
          password2: profile.confirmPassword
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      console.log('Updated profile');

      alert('Profile updated successfully');
      navigate('/'); // or any other route for successful update
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteProfile = async () => {
    // Replace with the actual token retrieval method and API endpoint
    const token = localStorage.getItem('token');
    const confirmation = window.confirm('Are you sure you want to delete your profile?');
    if (confirmation) {
      try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete profile');
        }

        alert('Profile deleted successfully');
        localStorage.removeItem('token'); // or handle logout logic
        navigate('/login'); // Redirect to login page or homepage
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main>
    <div className="container mx-auto mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1>User Profile</h1>
        <p>First Name: {profile.firstName}</p>
        <p>Last Name: {profile.lastName}</p>
        <p>Username: {profile.username}</p>
        <p>Email: {profile.email}</p>
        <h1 className="text-xl mb-4 font-bold">User Profile</h1>
        <form>
          <h2>Change Password</h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              New Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="New Password"
              name="password"
              value={profile.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmPassword"
              type="password"
              placeholder="Confirm New Password"
              name="confirmPassword"
              value={profile.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button
              className="bg-transparent hover:bg-gray-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
              type="button"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleDeleteProfile}
            >
              Delete Profile
            </button>
          </div>
        </form>
      </div>
    </div>
    </main>
  );
}

export default UserProfilePage;
