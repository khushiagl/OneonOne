import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TimeTable from '../components/TimeTable';

function ScheduleEditPage() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editedTitle, setEditedTitle] = useState(''); 
    const [participants, setParticipants] = useState([]);

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

                // Placeholder fetch for participants, replace URL as needed
                // const participantsResponse = await fetch(`http://127.0.0.1:8000/api/schedules/${id}/participants/`, {
                //     headers: {
                //         'Authorization': `Bearer ${localStorage.getItem('token')}`
                //     }
                // });
                // if (!participantsResponse.ok) {
                //     throw new Error(`Error: ${participantsResponse.status}`);
                // }
                // const participantsData = await participantsResponse.json();
                const participantsData = ["a", "b", "c", "d"]
                setSchedule(data);
                setEditedTitle(data.name); 
                setParticipants(participantsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleData();
    }, [id]);

    const handleTitleClick = () => {
        setIsEditing(true);
    };

    const handleTitleChange = (e) => {
        setEditedTitle(e.target.value);
    };

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            setIsEditing(false); // Exit editing mode

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/schedules/${id}/`, {
                    method: 'PUT', // or 'PUT' if your backend requires
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: editedTitle }), // Update the title
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();
                setSchedule({ ...schedule, name: data.name }); // Update local state
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <main className="pt-10 md:pt-20"><div>Loading...</div></main>;
    if (error) return <div>Error: {error}</div>;

    const LegendItem = ({ color, text }) => (
        <div className="flex items-center mb-2">
          <span className={`${color} w-3 h-3 mr-2`} />
          {text}
        </div>
      );

    return (
        <main className="pt-16 md:pt-20">
            
                {isEditing ? (
                    <div className="container mx-auto px-10 pt-8 flex items-center gap-4">
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={handleTitleChange}
                        onKeyDown={handleKeyDown}
                        className="text-3xl font-bold"
                        autoFocus
                        onBlur={() => setIsEditing(false)}
                    />
                    </div>
                ) : (
                    <div className="container mx-auto px-10 pt-8 flex items-center gap-4">
                    <h2 onClick={handleTitleClick} className="text-3xl font-bold cursor-pointer">
                        {schedule.name}
                    </h2>
                    <svg onClick={handleTitleClick} className="h-6 w-6 text-gray-700 cursor-pointer" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z"/>
                    <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"/>
                    <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3"/>
                    <line x1="16" y1="5" x2="19" y2="8"/>
                </svg>
                </div>
                    
                )}
                
                <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
    <div className="flex-grow p-6">
        <TimeTable schedule={schedule} />
    </div>

    {/* Participants Table */}
    <div className='p-6 flex flex-col'>
    <div className="bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="border">
                        <th className="border-r p-4">Participants</th>
                    </tr>
                </thead>
                <tbody>
                    {participants.map((participant, index) => (
                        <tr key={index} className="border">
                            <td className="p-2 border">{participant}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    <div className="mt-2 p-2 bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
        <h3 className="text-lg mb-2">Legend</h3>
        <LegendItem color="bg-yellow-200" text="Low Priority" />
        <LegendItem color="bg-green-200" text="Medium Priority" />
        <LegendItem color="bg-blue-200" text="High Priority" />
        <LegendItem color="border" text="Not Available" />
      </div>
    </div>
    </div>


        </main>
    );
}

export default ScheduleEditPage;
