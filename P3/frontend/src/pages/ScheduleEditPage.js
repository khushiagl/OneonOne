import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TimeTable from '../components/TimeTable';

function ScheduleEditPage() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {

                const response = await fetch(`http://127.0.0.1:8000/api/schedules/${id}/`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    }
                  });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                setSchedule(data);
            } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
        };

        fetchScheduleData();
    }, [id]); 

    if (loading) return (<main className="pt-10 md:pt-20">
    <div className="container mx-auto px-4 pt-8"><div>Loading...</div></div></main>);
    if (error) return <div>Error: {error}</div>;

    return (
        <main className="pt-16 md:pt-20">
            <div className="container mx-auto px-4 pt-8">
                <h2 className="text-3xl font-bold">{schedule.name}</h2>
                <div className="scale-65 md:scale-70 lg:scale-75 mx-auto">
                    <TimeTable schedule={schedule} />
                </div>
            </div>
        </main>
    );
}

export default ScheduleEditPage;
