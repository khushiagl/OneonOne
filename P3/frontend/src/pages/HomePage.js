import React, { useEffect, useState } from 'react';
import FinalTimeTable from'../components/FinalTimeTable'; // Assuming the path to the FinalTimeTable component file

function HomePage() {
    const [meetings, setMeetings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/schedules/finalized/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                console.log(data);

                setMeetings(data);
                // setEditedTitle(data.name); 
                // setParticipants(participantsData);
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
      <div className="flex-grow p-6">
      <FinalTimeTable meetings={meetings} schedules={[]}/> 
      </div>
    </div>
    </main>
    
  );
}

export default HomePage;
