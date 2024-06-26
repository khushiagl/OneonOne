import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TimeTable from '../components/TimeTable';
import InviteParticipantsModal from '../components/InviteParticipantsModal';
import SuggestedScheduleModal from '../components/SuggestedScheduleModal';
import FinalTimeTable from '../components/FinalTimeTable';
import fetchWithToken from '../refresh';

function ScheduleEditPage() {
    const { id } = useParams();
    const [schedule, setSchedule] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); 
    const [editedTitle, setEditedTitle] = useState(''); 
    const [participants, setParticipants] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [showSuggestedScheduleModal, setShowSuggestedScheduleModal] = useState(false);


    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const response = await fetchWithToken(`/api/schedules/${id}/`, {
                    headers: {
                        
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();

                // Placeholder fetchWithToken for participants, replace URL as needed
                const participantsResponse = await fetchWithToken(`/api/schedules/${id}/invitations/`, {
                    headers: {
                        
                    }
                });
                if (!participantsResponse.ok) {
                    throw new Error(`Error: ${participantsResponse.status}`);
                }
                const participantsData = await participantsResponse.json();
                // const participantsData = ["a", "b", "c", "d"]
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
    }, [id, showInviteModal, showSuggestedScheduleModal]);

    useEffect(() => {
        if(schedule && schedule.is_finalized){
        const fetchMeetings = async () => {
            try {
                const response = await fetchWithToken(`/api/schedules/${id}/meetings/`, {
                    headers: {
                        
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const data = await response.json();

                setMeetings(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMeetings();
    }}, [id, schedule]);

      

    useEffect(() => {
        const fetchAllContacts = async () => {
            try {
                const response = await fetchWithToken('/api/contacts/all_contacts/', {
                    headers: {
                        
                    }
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                const contactsData = await response.json();
                setAllContacts(contactsData);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchAllContacts();
    }, []); 

    
    const handleInviteButtonClick = () => {
        setShowInviteModal(true);
    };

    const closeInviteModal = () => {
        setShowInviteModal(false);
    };

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
                const response = await fetchWithToken(`/api/schedules/${id}/`, {
                    method: 'PUT', 
                    headers: {
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
    
    const closeSuggestedScheduleModal = () => {
        setShowSuggestedScheduleModal(false);
    };

    const handleViewSuggestions = () => {
        const allSubmitted = participants.every(participant => participant.is_submitted);
        
        if (allSubmitted && participants.length > 0) {
          // If all participants have submitted, show the modal
          setShowSuggestedScheduleModal(true);
        } else if (participants.length === 0) {
          // If not all participants have submitted, alert the user
          alert("Invite atleast one participant");
        }
        else {
            alert("All participants need to submit their availabilities in order to view suggestions.");
        }
      };

    const sendEmail = (participant) => {
        const email = participant.invited_user.email; // Assuming invited_user is an object with an email property
        const subject = encodeURIComponent("Reminder to Submit Availability");
        const body = encodeURIComponent(`Please submit your availability using the link below:\nhttps://master.d33yqvyddcsopz.amplifyapp.com/invitations/${participant.id}\n\n Copy and paste the link above to view the invitation page.\n\nThank you for your cooperation!`);

        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    
        window.location.href = mailtoLink;
      };
    

    if (loading) return <main className="pt-10 md:pt-20"><div>Loading...</div></main>;
    if (error) return <main className="pt-10 md:pt-20"><div>Error: {error}</div></main>;

    const LegendItem = ({ color, text }) => (
        <div className="flex items-center mb-2">
          <span className={`${color} border w-3 h-3 mr-2`} />
          {text}
        </div>
      );

      if (schedule.is_finalized) {
        return (
            <main className="pt-16 md:pt-20">
                
                <div className="container mx-auto px-10 pt-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 p-6">
                
                    <>
                        <h2 onClick={handleTitleClick} className="text-3xl font-bold cursor-pointer">
                            {schedule.name}
                        </h2>
                       
                    </>
            </div>
            
        </div>
    </div>
    
                    
                    <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
        <div className="flex-grow p-6">
            <FinalTimeTable meetings={meetings} schedules={[]}/>
        </div>
    
        <div className='p-6 flex flex-col'>
          <div className="mt-2 border bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="border">
                        <th className="p-2 flex items-center">Participants</th>
                    </tr>
                </thead>
                <tbody>
        {participants.map((participant, index) => (
            <tr key={index} className="border">
                <td className="p-2 flex items-center">
                    {participant.invited_user.first_name}
                    </td>
                    
            </tr>
        ))}
    </tbody>
    
            </table>
        </div>
    </div>
    
        
        </div>
        </div>
    
        

    
    
    
            </main>
        );
      }
    else {
        return (
            <main className="pt-16 md:pt-20">
                
                <div className="container mx-auto px-10 pt-8">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 p-6">
                {isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={handleTitleChange}
                            onKeyDown={handleKeyDown}
                            className="text-3xl font-bold"
                            autoFocus
                            onBlur={() => setIsEditing(false)}
                        />
                    </>
                ) : (
                    <>
                        <h2 onClick={handleTitleClick} className="text-3xl font-bold cursor-pointer">
                            {schedule.name}
                        </h2>
                        <svg onClick={handleTitleClick} className="h-6 w-6 text-gray-700 cursor-pointer" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z"/>
                            <path d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"/>
                            <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3"/>
                            <line x1="16" y1="5" x2="19" y2="8"/>
                        </svg>
                    </>
                )}
            </div>
            <div className='p-6 flex flex-col'>
            <button onClick={handleViewSuggestions} className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded">
                Suggest Schedules
            </button>
            </div>
        </div>
    </div>
    
                    
                    <div className='flex flex-col md:flex-row justify-center gap-8 md:gap-4 items-start px-10'>
        <div className="flex-grow p-6">
            <TimeTable schedule={schedule} isInvite={false}/>
        </div>
    
        {/* Participants Table */}
        <div className='p-6 flex flex-col'>
        <div className="p-2 border bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
            <h3 className="text mb-2">Legend</h3>
            <LegendItem color="bg-yellow-200" text="Low Priority" />
            <LegendItem color="bg-green-200" text="Medium Priority" />
            <LegendItem color="bg-blue-200" text="High Priority" />
            <LegendItem color="border" text="Not Available" />
          </div>
          <div className="mt-2 border bg-white shadow-lg overflow-hidden rounded-lg max-w-md">
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
                <thead>
                    <tr className="border">
                        <th className="p-2 flex items-center" colSpan={"2"}>Participants</th>
                    </tr>
                </thead>
                <tbody>
        {participants.map((participant, index) => (
            <tr key={index} className="border">
                <td className="p-2 flex items-center">
                    {participant.invited_user.first_name}
                    </td>
                    <td>
                    {participant.is_submitted && (
                        <svg className="w-4 h-4 text-green-800 ml-2" xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
                    )}
                    {!participant.is_submitted && (
                        <svg onClick={() => sendEmail(participant)} class="w-[20px] h-[20px] text-red-800 ml-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="6" height="6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.133 12.632v-1.8a5.407 5.407 0 0 0-4.154-5.262.955.955 0 0 0 .021-.106V3.1a1 1 0 0 0-2 0v2.364a.933.933 0 0 0 .021.106 5.406 5.406 0 0 0-4.154 5.262v1.8C6.867 15.018 5 15.614 5 16.807 5 17.4 5 18 5.538 18h12.924C19 18 19 17.4 19 16.807c0-1.193-1.867-1.789-1.867-4.175Zm-13.267-.8a1 1 0 0 1-1-1 9.424 9.424 0 0 1 2.517-6.391A1.001 1.001 0 1 1 6.854 5.8a7.43 7.43 0 0 0-1.988 5.037 1 1 0 0 1-1 .995Zm16.268 0a1 1 0 0 1-1-1A7.431 7.431 0 0 0 17.146 5.8a1 1 0 0 1 1.471-1.354 9.424 9.424 0 0 1 2.517 6.391 1 1 0 0 1-1 .995ZM8.823 19a3.453 3.453 0 0 0 6.354 0H8.823Z"/>
                      </svg>               
                      
                    )}
                </td>
            </tr>
        ))}
    </tbody>
    
            </table>
        </div>
        <div className="flex justify-end p-4">
            <button onClick={handleInviteButtonClick} className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg">
                Invite Participants
            </button>
        </div>
    </div>
    
        
        </div>
        </div>
    
        {showInviteModal && (
                    <InviteParticipantsModal
                        onClose={closeInviteModal}
                        allContacts={allContacts.filter(contact => !participants.some(participant => participant.invited_user.username === contact.contact.username))} 
                        id={id}
                    />
                )}
    
    {showSuggestedScheduleModal && (
        <SuggestedScheduleModal
            onClose={closeSuggestedScheduleModal}
            id={id}
        />
    )}
    
    
    
            </main>
        );
    }

    
}

export default ScheduleEditPage;
