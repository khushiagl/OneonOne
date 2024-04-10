import React, { useState, useEffect } from 'react';
import SuggestedTimeTable from './SuggestedTimeTable';
import { useNavigate } from 'react-router-dom';
import fetchWithToken from '../refresh';


const SuggestedScheduleModal = ({ onClose, id }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState(0);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const navigate = useNavigate();

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
    let newIndex = selectedScheduleIndex + direction;
    if (newIndex < 0) {
      newIndex = schedules.length - 1; // cycle back to the last schedule
    } else if (newIndex >= schedules.length) {
      newIndex = 0; // cycle forward to the first schedule
    }
    setSelectedScheduleIndex(newIndex);
  };

  return (
    <div className="pt-16 md:pt-20 fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto w-full" id="my-modal" onClick={onClose}>
  <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white max-w-md max-h-md mx-auto" onClick={e => e.stopPropagation()}>
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
      <div>
        {/* Schedule Table */}
        <div>
        {schedules[selectedScheduleIndex] && <SuggestedTimeTable meetings={schedules[selectedScheduleIndex].suggested_times} id={schedules[selectedScheduleIndex].id}></SuggestedTimeTable>}
        </div>
      </div>
      <div className="flex justify-between items-center px-4 py-3">
            <button onClick={finalizeSchedule} className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
              Finalize Schedule
            </button>
        <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Close
        </button>
      </div>
    </div>
  </div>
  {showSuccessAlert && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2">
          Schedule has been finalized successfully!
        </div>
      )}
</div>

  );
};

export default SuggestedScheduleModal;
