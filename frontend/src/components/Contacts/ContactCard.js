import React, { useState } from 'react';
import ContactModal from './ContactModal';
import fetchWithToken from '../../refresh';

function ContactCard({contact, resetContacts}) {


    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${contact.contact.username}?`)) {
            try {
                const response = await fetchWithToken(`/api/contacts/delete_contact/`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json' // Set the content type to application/json
                    },
                    body: JSON.stringify({
                        username: contact.contact.id
                    })
                });
                console.log(response);
                if (!response.ok) throw new Error('Failed to delete contact');
                console.log('Contact deleted');
                // Optionally close the modal here if it's open
            }
            catch (err) {
                console.error(err.message);
            }
            finally {
                resetContacts();
            }
        }
    };


    return (
        <div className='flex items-center justify-between max-w-sm rounded border border-gray-200 overflow-hidden shadow-lg bg-white p-4'>
  <div className='flex-1'>
    <div className='font-bold text-lg'>{contact.contact.username}</div>
  </div>
  <button onClick={handleDelete} className='ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150'>
    Delete
  </button>
</div>

    );
}

export default ContactCard;
