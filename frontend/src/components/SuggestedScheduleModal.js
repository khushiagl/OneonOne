import React, { useState, useEffect } from 'react';
import SuggestedTimeTable from './SuggestedTimeTable';

import fetchWithToken from '../refresh';


const SuggestedScheduleModal = ({ onClose, id }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    console.log("Fetching schedule for ID:", id);
    const fetchScheduleData = async () => {
      try {
        const response = await fetchWithToken(`/api/schedules/${id}/suggestions/`, {
          headers: {
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setSchedules(data);
        console.log(data);
      } catch (error) {
        setError(error.message);
        console.error("Fetching schedules failed:", error.message);
      }
    };

    fetchScheduleData();
  }, [id]);

  const finalizeSchedule = async () => {
    const suggestionId = schedules[selectedScheduleIndex]?.id;
    if (!suggestionId) return;

    try {
      const response = await fetchWithToken(`/api/schedules/suggestions/${suggestionId}/finalize/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Error finalizing schedule: ${response.status}`);
      }
      const data = await response.json();
      console.log("Schedule finalized successfully", data);
       // Optionally close the modal upon success
      alert("Schedule finalized successfully");
      onClose();

    } catch (error) {
      setError(error.message);
      console.error("Error finalizing schedule:", error.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Handling the schedule navigation
  const changeSchedule = (direction) => {
    setSelectedScheduleIndex((currentIndex) => {
      let newIndex = currentIndex + direction;
      if (newIndex < 0) {
        newIndex = schedules.length - 1; // cycle back to the last schedule
      } else if (newIndex >= schedules.length) {
        newIndex = 0; // cycle forward to the first schedule
      }
      return newIndex;
    });
    console.log(selectedScheduleIndex)
  };
  

  return (
    <div className="pt-16 md:pt-20 fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full" id="my-modal" onClick={onClose}>
  <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white  max-h-md mx-auto" onClick={e => e.stopPropagation()}>
    <div className="mt-3 text-center">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Suggested Schedules</h3>
      {/* Navigation Buttons */}
      <div className="flex justify-between mb-4 space-x-4">
  <button
    onClick={() => changeSchedule(-1)}
    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out text-base font-medium"
  >
    &lt; Previous
  </button>
  <button
    onClick={() => changeSchedule(1)}
    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150 ease-in-out text-base font-medium"
  >
    Next &gt;
  </button>
</div>

      
        {/* Schedule Table */}
        <div className='flex-grow'>
        {schedules[selectedScheduleIndex] && <SuggestedTimeTable meetings={schedules[selectedScheduleIndex].suggested_times} id={schedules[selectedScheduleIndex].id}></SuggestedTimeTable>}
        </div>
      <div className="flex justify-between items-center px-4 py-3 space-x-4">
  <button
    onClick={finalizeSchedule}
    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300 transition duration-150 ease-in-out text-base font-medium shadow-sm w-full mr-2"
  >
    Finalize Schedule
  </button>
  <button
    onClick={onClose}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-150 ease-in-out text-base font-medium shadow-sm w-full"
  >
    Close
  </button>
</div>

    </div>
  </div>
  
</div>

  );
};

export default SuggestedScheduleModal;
