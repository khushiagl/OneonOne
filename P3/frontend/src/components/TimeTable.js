import React, { useState } from 'react';
import fetchWithToken from '../refresh';

const TimeTable = ({ schedule, isInvite }) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
    // Helper function to generate time slots
    const generateTimeSlots = () => {
      const slots = [];
      for (let hour = 9; hour < 17; hour++) {
        const time = `${hour < 10 ? '0' + hour : hour}:00`; 
        slots.push(time);
      }
      return slots;
    };
  
    const timeSlots = generateTimeSlots();
  
    // Initialize state  with the schedule data
    const [slots, setSlots] = useState(timeSlots.map((timeSlot, index) => {
      return daysOfWeek.map((day, dayIndex) => {
        const daySchedule = schedule.non_busy_times[day] || {};
        const level = daySchedule[timeSlot] || 0;
        return { available: level > 0, level: level };
      });
    }));


    const updateScheduleInDb = async (newNonBusyTimes) => {
        try {
          if (isInvite) {
            await fetchWithToken(`/api/schedules/invitations/${schedule.id}/responses/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ non_busy_times: newNonBusyTimes }),
          });
        } else {
          await fetchWithToken(`/api/schedules/${schedule.id}/preferences/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ non_busy_times: newNonBusyTimes }),
          });
        }
        } catch (error) {
          console.error('Failed to update schedule', error);
        }
      };
    
  

  const cyclePreference = (slotIndex, dayIndex) => {
    const updatedSlots = slots.map((daySlots, i) => {
      if (i === slotIndex) {
        return daySlots.map((daySlot, j) => {
          if (j === dayIndex) {
            let nextLevel = daySlot.level + 1;
            if (nextLevel > 3) {
              nextLevel = 0;
            }
            return { available: nextLevel !== 0, level: nextLevel };
          }
          return daySlot;
        });
      }
      return daySlots;
    });
    setSlots(updatedSlots);
    // Construct the updated non_busy_times from the updatedSlots
    const newNonBusyTimes = daysOfWeek.reduce((acc, day, index) => {
        const daySlots = updatedSlots.map((slot, i) => ({
          time: timeSlots[i],
          level: slot[index].level,
        })).filter(slot => slot.level > 0)
          .reduce((acc, { time, level }) => {
            acc[time] = level;
            return acc;
          }, {});
  
        if (Object.keys(daySlots).length > 0) {
          acc[day] = daySlots;
        }
  
        return acc;
      }, {});
  
      // Update the schedule in the database
      updateScheduleInDb(newNonBusyTimes);  
  };

  // Determine background color based on preference level
  const getBackgroundColor = (level) => {
    switch (level) {
      case 1:
        return 'bg-yellow-200';
      case 2:
        return 'bg-green-200';
      case 3:
        return 'bg-blue-200';
      default:
        return '';
    }
  };

  const LegendItem = ({ color, text }) => (
    <div className="flex items-center mb-2">
      <span className={`${color} w-6 h-6 rounded-full mr-2`} />
      {text}
    </div>
  );

  // Render the timetable and legend
  return (
    <div class="bg-white shadow-lg overflow-hidden rounded-lg">
      <table className="min-w-full max-w-lg mx-auto border-collapse block md:table text-sm">
        <thead className="block md:table-header-group">
          <tr className="border md:table-row absolute -top-full md:relative md:top-auto">
            <th className="border-r p-2 block md:table-cell w-1/6">Time</th>
            <th className="border-r p-2 block md:table-cell w-1/6">Monday</th>
            <th className="border-r p-2 block md:table-cell w-1/6">Tuesday</th>
            <th className="border-r p-2 block md:table-cell w-1/6">Wednesday</th>
            <th className="border-r p-2 block md:table-cell w-1/6">Thursday</th>
            <th className="border-r p-2 block md:table-cell w-1/6">Friday</th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          {slots.map((daySlots, slotIndex) => (
            <tr key={slotIndex} className="bg-white md:table-row">
              <td className="p-2 border md:table-cell">{timeSlots[slotIndex]}</td>
              {daySlots.map((daySlot, dayIndex) => (
                <td
                  key={dayIndex}
                  className={`p-2 border md:table-cell cursor-pointer ${getBackgroundColor(daySlot.level)}`}
                  onClick={() => cyclePreference(slotIndex, dayIndex)}
                >
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      {/* <div className="mt-2 p-2">
        <h3 className="text-lg mb-2">Legend</h3>
        <LegendItem color="bg-yellow-200" text="Low Priority" />
        <LegendItem color="bg-green-200" text="Medium Priority" />
        <LegendItem color="bg-blue-200" text="High Priority" />
        <LegendItem color="border" text="Not Available" />
      </div> */}
    </div>
  );
};

export default TimeTable;
