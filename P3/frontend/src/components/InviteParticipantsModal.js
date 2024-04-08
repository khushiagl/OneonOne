import React, { useState } from 'react';

function InviteParticipantsModal({ onClose, allContacts }) {
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [deadline, setDeadline] = useState('');

    const handleCheckboxChange = (contactId) => {
        setSelectedContacts(prev => {
            if (prev.includes(contactId)) {
                return prev.filter(id => id !== contactId);
            } else {
                return [...prev, contactId];
            }
        });
    };

    const handleDeadlineChange = (e) => {
        setDeadline(e.target.value);
    };

    const onSendInvites = (selectedContacts, deadline) => {
        
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
                        <div key={contact.contact.username} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`contact-${contact.contact.username}`}
                                checked={selectedContacts.includes(contact.contact.username)}
                                onChange={() => handleCheckboxChange(contact.contact.username)}
                                className="mr-2"
                            />
                            <label htmlFor={`contact-${contact.contact.username}`}>{contact.contact.first_name}</label>
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
