import React, { useState, useEffect } from 'react';

function InviteParticipantsModal({ onClose, allContacts, id }) {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [deadline, setDeadline] = useState('');
    const [isSendingInvites, setIsSendingInvites] = useState(false);

    const handleCheckboxChange = (contactId) => {
        setSelectedContacts(prev => {
            if (prev.includes(contactId)) {
                return prev.filter(id => id !== contactId);
            } else {
                return [...prev, contactId];
            }
        });
    };

    // Using useEffect to log the updated state
    useEffect(() => {
        console.log(selectedContacts);
    }, [selectedContacts]);

    const handleDeadlineChange = (e) => {
        setDeadline(e.target.value);
    };

    const onSendInvites = async (selectedContacts, deadline) => {
        setIsSendingInvites(true);
        const today = new Date();
        const selectedDate = new Date(deadline);
        if (selectedDate < today) {
            alert('Please select a deadline that is in the future.');
            setIsSendingInvites(false);
            return;
        }
        console.log(selectedContacts)

        for (const contactId of selectedContacts) {
            console.log(JSON.stringify({ "invited_user": contactId, "deadline": deadline }))
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/schedules/${id}/invitations/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ "invited_user_id": contactId, "deadline": deadline }),
                });

                if (!response.ok) {
                    // Handle non-2xx responses here
                    console.error('Failed to send invitation:', response.statusText);
                    // Continue sending the rest of the invitations
                }
            } catch (error) {
                console.error('Error sending invitation:', error);
                // Handle errors (e.g., network error) and continue sending the rest of the invitations
            }
        }
        setIsSendingInvites(false);
        onClose(); // Close the modal after sending all invites
    };

    const handleSendInvites = () => {
        if (selectedContacts.length > 0 && deadline) {
            // Call the onSendInvites function passed as a prop with the selected contacts and deadline
            onSendInvites(selectedContacts, deadline);
            onClose(); // Close the modal after sending invites
        } else {
            alert('Please select at least one contact and set a deadline.');
        }
    };

    return (
        <div className="pt-16 md:pt-20 fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Invite Participants</h3>
                <div className="mt-2">
                    <label htmlFor="deadline">Deadline:</label>
                    <input type="date" id="deadline" value={deadline} onChange={handleDeadlineChange} className="mt-1 p-2 border rounded-md" />
                </div>
                <div className="mt-4">
                    <h4 className="text-md">Select Contacts:</h4>
                    {allContacts.map(contact => (
                        console.log(contact),
                        <div key={contact.contact.id} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`contact-${contact.contact.id}`}
                                checked={selectedContacts.includes(contact.contact.id)}
                                onChange={() => handleCheckboxChange(contact.contact.id)}
                                className="mr-2"
                            />
                            <label htmlFor={`contact-${contact.contact.id}`}>{contact.contact.first_name}</label>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleSendInvites} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mr-2">
                        Invite
                    </button>
                    <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InviteParticipantsModal;
