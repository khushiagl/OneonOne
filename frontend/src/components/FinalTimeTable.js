import React, { useState, useEffect} from 'react';

const FinalTimeTable = ({ meetings, schedules }) => {
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
    const [selectedSchedules, setSelectedSchedules] = useState(new Set());

    const timeSlots = generateTimeSlots();

    useEffect(() => {
      if (schedules.length == 0 && meetings[0]){
        const newSelectedSchedules = new Set(selectedSchedules);
          newSelectedSchedules.add(meetings[0].schedule.id);
        setSelectedSchedules(newSelectedSchedules);
        
      }
      else {
        const allScheduleIds = schedules.map(schedule => schedule.id);
      setSelectedSchedules(new Set(allScheduleIds));
      }
  }, [schedules]);

    useEffect(() => {
        const initSlots = timeSlots.map(timeSlot => 
            daysOfWeek.map(day => ({ day, timeSlot, label: '', id: null }))
        );

        // Loop through meetings and assign labels to matching day and time slots
        meetings.forEach(meeting => {
            // Check if the meeting's schedule ID is in the list of allowed schedule IDs
            if (selectedSchedules.has(meeting.schedule.id)) {
                const meetingTimeWithoutSeconds = meeting.time.substring(0, 5);
                const dayIndex = daysOfWeek.indexOf(meeting.day);
                const timeIndex = timeSlots.indexOf(meetingTimeWithoutSeconds);
        
                if (dayIndex !== -1 && timeIndex !== -1) {
                    // Determine label based on whether the user is the owner or invited
                    const label = meeting.is_owned_by_current_user ? `Meeting with ${meeting.invited_user.first_name}` : `Invited by ${meeting.owner.first_name}`;
                    initSlots[timeIndex][dayIndex].label = label;
                    initSlots[timeIndex][dayIndex].id = meeting.schedule.id;
                }
            }
        });

        setSlots(initSlots);
        
    }, [meetings, selectedSchedules]);

    const handleCheckboxChange = (e, scheduleId) => {
      const newSelectedSchedules = new Set(selectedSchedules);
      if (e.target.checked) {
          newSelectedSchedules.add(scheduleId);
      } else {
          newSelectedSchedules.delete(scheduleId);
      }
      setSelectedSchedules(newSelectedSchedules);
      
  };

    const getBackgroundColor = (id) => {
        if (!id) return ''; 
        const hue = parseInt(id) * 137 % 360; 
        const color = `hsl(${hue}, 70%, 80%)`; 
   
    
        return color;
    };

    return (
      <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
        
        {/* Conditionally render schedules table */}
        {schedules.length > 0 && (
                <div className='p-6 flex flex-col'>
                    <div className="mt-2 border bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border">
                                        <th className="p-4" colSpan="2">Schedules</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((schedule) => (
                                        <tr key={schedule.id} className="border">
                                            <td className="p-2 text-center whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSchedules.has(schedule.id)}
                                                    onChange={(e) => handleCheckboxChange(e, schedule.id)}
                                                />
                                            </td>
                                            <td className='p-2'>{schedule.name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
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
                      style={{ backgroundColor: getBackgroundColor(daySlot.id) }}
                      
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

export default FinalTimeTable;
