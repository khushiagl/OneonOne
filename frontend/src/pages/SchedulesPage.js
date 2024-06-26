import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';
import fetchWithToken from '../refresh';

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

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        // Fetching schedules
        const schedulesResponse = await fetchWithToken('/api/schedules/', {
  headers: {
    
  }
});
        if (!schedulesResponse.ok) throw new Error('Failed to fetchWithToken schedules');
        const schedulesData = await schedulesResponse.json();

        // Fetching invitations
        const invitationsResponse = await fetchWithToken('/api/schedules/invitations/', {
          headers: {
            
          }
        });
        if (!invitationsResponse.ok) throw new Error('Failed to fetchWithToken invitations');
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

  const handleDeleteSchedule = async (scheduleId, e) => {
    e.stopPropagation(); // Prevent navigation to the schedule's page
  
    // Confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this schedule?');
    if (!isConfirmed) {
      return; // Early return if the user cancels the operation
    }
  
    try {
      const response = await fetchWithToken(`/api/schedules/${scheduleId}/delete/`, {
        method: 'DELETE',
        headers: {
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }
  
      // Remove the deleted schedule from local state
      setSchedules(schedules.filter(schedule => schedule.id !== scheduleId));
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      // Optionally, update your error handling state here
    }
  };
  


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
        <li onClick={() => navigate(`/schedules/${schedule.id}`)} key={schedule.id} className="bg-white rounded-lg shadow mb-2 p-4 flex justify-between items-center">
          <span className='text-lg'>{schedule.name}</span>
          <div className="flex items-center space-x-2"> {/* Container for icons with spacing */}
            <svg onClick={() => navigate(`/schedules/${schedule.id}`)} className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"/>
              <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"/>
              <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3"/>
              <line x1="16" y1="5" x2="19" y2="8"/>
            </svg>
            <svg onClick={(e) => handleDeleteSchedule(schedule.id, e)} className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z"/>
              <line x1="4" y1="7" x2="20" y2="7"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/>
              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>
            </svg>
          </div>
        </li>
      ));
  };
  
  // Render invited schedules
  const renderInvitedSchedules = () => {
    return invitations.map(invitation => (
      <li onClick={() => navigate(`/invitations/${invitation.id}`)} key={invitation.id} className="bg-white rounded-lg shadow mb-2 p-4 flex justify-between items-center">
        <span className='text-lg'>{invitation.schedule.name} by {invitation.schedule.user.first_name}</span>
        <svg onClick={() => navigate(`/invitations/${invitation.id}`)} class="h-6 w-6 text-gray-700"  viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3" />  <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />  <line x1="16" y1="5" x2="19" y2="8" /></svg>
      </li>
    ));
  };
  

  const handleAddSchedule = async (e) => {
    if (e.key === 'Enter' && newScheduleName.trim()) {
      try {
        const response = await fetchWithToken('/api/schedules/', {
          method: 'POST',
          headers: {
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
    < main className="pt-20">
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
  </main>
  


  );
};

export default SchedulesPage;