import React, { useState, useEffect } from 'react';
import SuggestedTimeTable from './SuggestedTimeTable';


const SuggestedScheduleModal = ({ onClose, id }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Fetching schedule for ID:", id);
    const fetchScheduleData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/schedules/${id}/suggestions/`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Handling the schedule navigation
  const changeSchedule = (direction) => {
    let newIndex = selectedScheduleIndex + direction;
    if (newIndex < 0) {
      newIndex = schedules.length - 1; // cycle back to the last schedule
    } else if (newIndex >= schedules.length) {
      newIndex = 0; // cycle forward to the first schedule
    }
    setSelectedScheduleIndex(newIndex);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Suggested Schedules</h3>
          {/* Navigation Buttons */}
          <div className="flex justify-between mb-4">
            <button onClick={() => changeSchedule(-1)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              &lt; Previous
            </button>
            <button onClick={() => changeSchedule(1)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
              Next &gt;
            </button>
          </div>
          <div className="mt-2">
            {/* Schedule Table */}
            <div className="overflow-x-auto">
            {schedules[selectedScheduleIndex] && <SuggestedTimeTable meetings={schedules[selectedScheduleIndex].suggested_times}></SuggestedTimeTable>}
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestedScheduleModal;
