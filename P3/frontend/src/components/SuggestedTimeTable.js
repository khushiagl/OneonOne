import React, { useState, useEffect} from 'react';

const SuggestedTimeTable = ({ meetings}) => {
    const daysOfWeek = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Helper function to generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            slots.push(`${hour < 10 ? `0${hour}` : hour}:00`);
        }
        return slots;
    };

    const [slots, setSlots] = useState([]);

    const timeSlots = generateTimeSlots();


    useEffect(() => {
        const initSlots = timeSlots.map(timeSlot => 
            daysOfWeek.map(day => ({ day, timeSlot, label: ''}))
        );

        // Loop through meetings and assign labels to matching day and time slots
        meetings.forEach(meeting => {
                const dayIndex = daysOfWeek.indexOf(meeting.day);
                const timeIndex = timeSlots.indexOf(meeting.time);
        
                if (dayIndex !== -1 && timeIndex !== -1) {
                    // Determine label based on whether the user is the owner or invited
                    const label = `Meeting with ${meeting.user}`;
                    initSlots[timeIndex][dayIndex].label = label;
                }
            });

        setSlots(initSlots);
    }, [meetings]);


    return (
      <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
        
      <div className="flex-grow p-6">
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
                      className={`p-2 border md:table-cell cursor-pointer`}
                    //   style={{ backgroundColor: getBackgroundColor(daySlot.id) }}
                      
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
        </div>
      );
};

export default SuggestedTimeTable;
