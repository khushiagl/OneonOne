import React, { useEffect, useState } from 'react';
import FinalTimeTable from'../components/FinalTimeTable'; // Assuming the path to the FinalTimeTable component file
import fetchWithToken from '../refresh';

function HomePage() {
    const [meetings, setMeetings] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    


    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const response = await fetchWithToken(`/api/schedules/finalized/`, {
                    headers: {
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);

                setMeetings(data);
                // Initialize a new Map for unique schedules
                const schedulesMap = new Map();
                data.forEach(meeting => {
                    const { id, name } = meeting.schedule;
                    if (!schedulesMap.has(id)) {
                        schedulesMap.set(id, { id, name });
                    }
                });

                const uniqueSchedules = Array.from(schedulesMap.values());
                setSchedules(uniqueSchedules);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleData();
    }, []);

    
    

    if (loading) return <main className="pt-10 md:pt-20"><div>Loading...</div></main>;
    if (error) return <div>Error: {error}</div>;

  return (
    <main className="pt-16 md:pt-20">
      <div>
      <h2>Home Page</h2>
      
      <FinalTimeTable meetings={meetings} schedules={schedules}/> 
    </div>
    </main>
    
  );
}

export default HomePage;
