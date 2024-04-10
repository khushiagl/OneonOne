import React, { useState, useEffect } from 'react';
import fetchWithToken from '../refresh';

const SuggestedTimeTable = ({ meetings, id }) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour < 10 ? `0${hour}` : hour}:00`);
    }
    return slots;
  };

  const [slots, setSlots] = useState([]);
  const [draggedMeeting, setDraggedMeeting] = useState(null);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const initSlots = timeSlots.map((timeSlot) =>
      daysOfWeek.map((day) => ({ day, timeSlot, label: '' }))
    );

    meetings.forEach((meeting) => {
      const dayIndex = daysOfWeek.indexOf(meeting.day);
      const timeIndex = timeSlots.indexOf(meeting.time);

      if (dayIndex !== -1 && timeIndex !== -1) {
        const label = `Meeting with ${meeting.user}`;
        initSlots[timeIndex][dayIndex].label = label;
        initSlots[timeIndex][dayIndex].meeting = meeting; // Store the whole meeting object for easy access
      }
    });

    setSlots(initSlots);
  }, [meetings]);

  const handleDragStart = (event, meeting) => {
    setDraggedMeeting(meeting);

    setSlots(slots.map((daySlots) =>
      daySlots.map((slot) => {
        // Determine if the slot is available based on meeting's available times
        const isAvailable = meeting.available_times.some(availableTime => 
          availableTime.day === slot.day && availableTime.time === slot.timeSlot
        );

        // If meeting.forced is true, set available to true unless the slot is already scheduled
        // Assuming there's a property in slot to indicate if a meeting is already scheduled (e.g., slot.isScheduled)
        let available;
        if (meeting.forced) {
          available = !slot.meeting;
        } else {
          available = isAvailable && !slot.meeting;
        }

        return {
          ...slot,
          available,
        };
      })
    ));
};


  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (event, newDay, newTimeSlot) => {
    event.preventDefault();
    const timeIndex = timeSlots.indexOf(newTimeSlot);
      const dayIndex = daysOfWeek.indexOf(newDay);
    if (draggedMeeting && slots[timeIndex][dayIndex].available) {
      // Remove the meeting from its original slot
      const newSlots = slots.map((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          if (cell.meeting === draggedMeeting) {
            return { ...cell, label: '', meeting: undefined }; // Clear the meeting from its original position
          }
          return cell;
        })
      );
  
      // Add/update the meeting to its new slot
      
      if (timeIndex !== -1 && dayIndex !== -1) {
        const label = `Meeting with ${draggedMeeting.user}`;
        newSlots[timeIndex][dayIndex] = { ...newSlots[timeIndex][dayIndex], label, meeting: draggedMeeting };
      }
  
      setSlots(newSlots);
  
      const updatedMeetings = meetings.map(meeting => {
        if (meeting.day === draggedMeeting.day && meeting.time === draggedMeeting.time) {
          return { ...meeting, day: newDay, time: newTimeSlot };
        }
        return meeting;
      });
      updateScheduleInDb(updatedMeetings);
  
      setDraggedMeeting(null); 
    }
  };
  

  const handleDragEnd = () => {
    setSlots(slots.map(daySlots => daySlots.map(slot => ({ ...slot, available: false }))));
    setDraggedMeeting(null);
  };

  const updateScheduleInDb = async (updatedMeetings) => {
    try {
       await fetchWithToken(`/api/schedules/suggestions/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggested_times: updatedMeetings }),
      });
    } catch (error) {
      console.error('Failed to update suggested schedule', error);
    }
  };

  return (
    <div className='flex flex-col md:flex-row justify-center items-start px-10'>
      <div className="bg-white shadow-lg overflow-hidden rounded-lg w-full md:w-auto"> {/* Adjusted to ensure full width on smaller screens and auto width on medium screens */}
        <table className="min-w-full md:min-w-xl mx-auto border-collapse block md:table text-xs"> {/* Adjusted minimum width for medium screens */}
          <thead className="block md:table-header-group">
            <tr className="border md:table-row absolute -top-full md:relative md:top-auto">
              <th className="border-r p-1 block md:table-cell w-[16%] md:w-[15%]">Time</th> {/* Adjusted width for 'Time' column */}
              {daysOfWeek.map(day => (
                <th key={day} className="border-r p-1 block md:table-cell w-[16%] md:w-[17%]">{day}</th> 
              ))}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {slots.map((daySlots, slotIndex) => (
              <tr key={slotIndex} className="bg-white md:table-row">
                <td className="p-1 border md:table-cell text-xs w-[16%] md:w-[15%]">{timeSlots[slotIndex]}</td> {/* Adjust width accordingly */}
                {daySlots.map((daySlot, dayIndex) => (
                  <td
                    key={dayIndex}
                    className="p-1 border md:table-cell cursor-pointer text-xs w-[16%] md:w-[17%]" 
                    draggable={daySlot.label !== ''}
                    onDragStart={(event) => handleDragStart(event, daySlot.meeting)}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, daysOfWeek[dayIndex], timeSlots[slotIndex])}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: daySlot.meeting && daySlot.meeting.forced ? 'red' : daySlot.available ? 'lightgreen' : 'transparent', 
                    }}
                  >
                    {daySlot.label}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
};
export default SuggestedTimeTable;
