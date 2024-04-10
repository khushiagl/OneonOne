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
  }, []);

  const handleDragStart = (event, meeting) => {
    setDraggedMeeting(meeting);

    // Update to handle the availability format as an array of objects
    setSlots(slots.map((daySlots) =>
      daySlots.map((slot) => {
        const isAvailable = meeting.available_times.some(availableTime => 
          availableTime.day === slot.day && availableTime.time === slot.timeSlot
        );
        return {
          ...slot,
          available: isAvailable,
        };
      })
    ));
};

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (event, newDay, newTimeSlot) => {
    event.preventDefault();
    console.log(meetings)
    console.log(draggedMeeting)
    if (draggedMeeting && draggedMeeting.available_times.some(availableTime => 
      availableTime.day === newDay && availableTime.time === newTimeSlot
    )) {
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
      const timeIndex = timeSlots.indexOf(newTimeSlot);
      const dayIndex = daysOfWeek.indexOf(newDay);
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
    <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
      <div className="bg-white shadow-lg overflow-hidden rounded-lg">
        <table className="min-w-full max-w-lg mx-auto border-collapse block md:table text-xs">
          <thead className="block md:table-header-group">
            <tr className="border md:table-row absolute -top-full md:relative md:top-auto">
              <th className="border-r p-1 block md:table-cell w-1/6 text-xs">Time</th>
              {daysOfWeek.map(day => (
                <th key={day} className="border-r p-1 block md:table-cell w-1/6 text-xs">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {slots.map((daySlots, slotIndex) => (
              <tr key={slotIndex} className="bg-white md:table-row">
                <td className="p-1 border md:table-cell text-xs">{timeSlots[slotIndex]}</td>
                {daySlots.map((daySlot, dayIndex) => (
                  <td
                    key={dayIndex}
                    className="p-1 border md:table-cell cursor-pointer text-xs"
                    draggable={daySlot.label !== ''}
                    onDragStart={(event) => handleDragStart(event, daySlot.meeting)}
                    onDragOver={handleDragOver}
                    onDrop={(event) => handleDrop(event, daysOfWeek[dayIndex], timeSlots[slotIndex])}
                    onDragEnd={handleDragEnd}
                    style={{
                      backgroundColor: daySlot.available ? 'lightgreen' : 'transparent', 
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
