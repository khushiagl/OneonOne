import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TimeTable from '../components/TimeTable';
import fetchWithToken from '../refresh';

function InvitationEditPage() {
    const { id } = useParams();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const response = await fetchWithToken(`/api/schedules/invitations/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();

                
                setInvitation(data); 
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScheduleData();
    }, [id]);


    if (loading) return <main className="pt-10 md:pt-20"><div>Loading...</div></main>;
    if (error) return  <main className="pt-10 md:pt-20"><div>Error: {error}</div></main>;

    const LegendItem = ({ color, text }) => (
        <div className="flex items-center mb-2">
          <span className={`${color} w-3 h-3 mr-2`} />
          {text}
        </div>
      );

    return (
        <main className="pt-16 md:pt-20">
            
                
                    <div className="container mx-auto px-10 pt-8 flex items-center gap-4">
                    <h2 className="text-3xl font-bold cursor-pointer">
                        {invitation.schedule.name} by {invitation.schedule.user.first_name}
                    </h2>
                    
                </div>
                
                <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
    <div className="flex-grow p-6">
        <TimeTable schedule={invitation} isInvite={true} />
    </div>

    <div className='p-6 flex flex-col'>
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

export default InvitationEditPage;
