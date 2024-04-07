import React, { useState } from 'react';

function ContactModal({ contact, onClose, resetContacts }) {
    // Initialize state with both current and new contact info
    const [editContact, setEditContact] = useState({
        old_contact_email: contact.contact_email, // Keep the original email to identify the contact on the backend
        new_contact_name: contact.contact_name,
        new_contact_email: contact.contact_email,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditContact(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        try {
            // Ensure your API endpoint and method (PUT/POST) are correct
            const response = await fetch(`http://localhost:8000/api/contacts/edit_contact/`, {
                method: 'PUT', // or 'POST', depending on your backend
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({
                    contact_email: editContact.old_contact_email, // Send the original email to identify the contact
                    new_contact_name: editContact.new_contact_name, // New name
                    new_contact_email: editContact.new_contact_email, // New email
                }),
            });
            if (!response.ok) throw new Error('Failed to save changes');
            console.log('Changes saved:', editContact);
            onClose(); // Close the modal upon successful save
        } catch (err) {
            console.error('Error saving changes:', err.message);
        } 
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Contact</h3>
                    <div className="mt-2 px-7 py-3">
                        <input
                            className="mb-3 w-full px-3 py-2 border border-gray-300 rounded-md"
                            type="text"
                            placeholder="New Contact Name"
                            name="new_contact_name"
                            value={editContact.new_contact_name}
                            onChange={handleInputChange}
                        />
                        <input
                            className="mb-3 w-full px-3 py-2 border border-gray-300 rounded-md"
                            type="email"
                            placeholder="New Contact Email"
                            name="new_contact_email"
                            value={editContact.new_contact_email}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="items-center px-4 py-3">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Cancel
                        </button>
                        <button onClick={handleSaveChanges} className="mt-3 px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactModal;
