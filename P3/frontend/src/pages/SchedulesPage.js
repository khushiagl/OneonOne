import React, { useState, useEffect } from 'react';

function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State to manage which sections are open
  const [openSections, setOpenSections] = useState({
    finalized: true,
    tentative: true,
    invited: true,
  });

  const [newScheduleName, setNewScheduleName] = useState('');
  const [showNewScheduleInput, setShowNewScheduleInput] = useState(false);


  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/login/', { // Adjust the URL to your backend's login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json(); // Assuming the backend responds with a JSON object containing the token
      console.log('Login successful:', data);
  
      // Here you would typically save the token to local storage and redirect the user
      localStorage.setItem('token', data.access); // Adjust depending on how your token is returned
      // Redirect user or perform other actions upon successful login
    } catch (error) {
      console.error('Login error:', error.message);
      // Handle errors, e.g., show an error message to the user
    }
  };
  
  useEffect(() => {
    login("a", "Hello@123");
    const fetchSchedules = async () => {
      try {
        // Fetching schedules
        const schedulesResponse = await fetch(' http://127.0.0.1:8000/api/schedules/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token in the Authorization header
  }
});
        if (!schedulesResponse.ok) throw new Error('Failed to fetch schedules');
        const schedulesData = await schedulesResponse.json();

        // Fetching invitations
        const invitationsResponse = await fetch(' http://127.0.0.1:8000/api/schedules/invitations/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token in the Authorization header
          }
        });
        if (!invitationsResponse.ok) throw new Error('Failed to fetch invitations');
        const invitationsData = await invitationsResponse.json();

        setSchedules(schedulesData);
        setInvitations(invitationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


  // Toggle section open/close
  const toggleSection = (section) => {
    setOpenSections(prevState => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // Render schedules by finalized status
  const renderSchedulesByFinalizedStatus = (isFinalized) => {
    return schedules
      .filter(schedule => schedule.is_finalized === isFinalized)
      .map(schedule => (
        <li key={schedule.id} className="bg-white rounded-lg shadow mb-2 p-4">
          {schedule.name}
        </li>
      ));
  };

  // Render invited schedules
  const renderInvitedSchedules = () => {
    return invitations.map(invitation => (
      <li key={invitation.id} className="bg-white rounded-lg shadow mb-2 p-4">
        {invitation.schedule.name}
      </li>
    ));
  };

  const handleAddSchedule = async (e) => {
    if (e.key === 'Enter' && newScheduleName.trim()) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/schedules/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newScheduleName.trim() }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to add schedule');
        }
  
        const addedSchedule = await response.json();
        setSchedules((prevSchedules) => [...prevSchedules, addedSchedule]);
        setNewScheduleName('');
        setShowNewScheduleInput(false); // Optionally hide the input field again
      } catch (error) {
        console.error('Failed to add schedule:', error);
      }
    }
  };
  

  return (
    <div className="container mx-auto px-8 py-12">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-3xl font-bold px-4">Schedules</h2>
  </div>
    <div className="mb-4">
      <h3 
        className="text-xl font-semibold mb-2 cursor-pointer flex justify-between items-center py-4 px-10 bg-gradient-to-r from-white via-gray-200 to-white text-gray-800"
        onClick={() => toggleSection('finalized')}
      >
        Finalized <span>{openSections.finalized ? '-' : '+'}</span>
      </h3>
      <ul className={`transition-all duration-300 ease-in-out ${openSections.finalized ? 'max-h-screen px-10' : 'max-h-0 overflow-hidden'}`}>
        {renderSchedulesByFinalizedStatus(true)}
      </ul>
    </div>
  
    <div className="mb-4">
      <h3 
        className="text-xl font-semibold mb-2 cursor-pointer flex justify-between items-center py-4 px-10 bg-gradient-to-r from-white via-gray-300 to-white text-gray-800"
        onClick={() => toggleSection('tentative')}
      >
        Tentative <span>{openSections.tentative ? '-' : '+'}</span>
      </h3>
      <ul className={`transition-all duration-300 ease-in-out ${openSections.tentative ? 'max-h-screen px-10' : 'max-h-0 overflow-hidden'}`}>
        {renderSchedulesByFinalizedStatus(false)}
      </ul>
      {showNewScheduleInput && (
        <div  className="px-10">
  <input
    type="text"
    autoFocus
    className="bg-white rounded-lg shadow py-4 mb-2 w-full px-10"
    placeholder="Enter schedule name"
    value={newScheduleName}
    onChange={(e) => setNewScheduleName(e.target.value)}
    onKeyDown={handleAddSchedule}
    onBlur={() => setShowNewScheduleInput(false)}
  />
  </div>
)}
      <div className="flex items-center justify-center my-4 px-10">
        <div className="border-t border-gray-400 flex-grow mr-2"></div>
        <button
          className=" bg-white text-gray-800 font-bold"
          onClick={() => setShowNewScheduleInput(true)}
        >
          +
        </button>
        <div className="border-t border-gray-400 flex-grow ml-2"></div>
      </div>
    </div>
  
    <div className="mb-4">
      <h3 
        className="text-xl font-semibold mb-2 cursor-pointer flex justify-between items-center py-4 px-10 bg-gradient-to-r from-white via-gray-400 to-white text-gray-800 "
        onClick={() => toggleSection('invited')}
      >
        Invited <span>{openSections.invited ? '-' : '+'}</span>
      </h3>
      <ul className={`transition-all duration-300 ease-in-out ${openSections.invited ? 'max-h-screen px-10' : 'max-h-0 overflow-hidden'}`}>
        {renderInvitedSchedules()}
      </ul>
    </div>
  </div>
  


  );
};

export default SchedulesPage;