import React, { useState } from 'react';
import ContactModal from './ContactModal';

function ContactCard({contact, resetContacts}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${contact.contact_name}?`)) {
            try {
                const response = await fetch(`http://localhost:8000/api/contacts/${contact.contact_email}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to delete contact');
                console.log('Contact deleted');
                // Optionally close the modal here if it's open
            }
            catch (err) {
                console.error(err.message);
            }
        }
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    return (
        <div className='max-w-sm rounded overflow-hidden shadow-lg bg-white'>
            <img className='w-full h-48 object-cover' src={contact.image} alt={contact.contact_name} />
            <div className='px-6 py-4'>
                <div className='font-bold text-xl mb-2'>{contact.contact_name}</div>
                <p className='text-gray-700 text-base'>{contact.contact_email}</p>
            </div>
            <div className='px-6 pt-4 pb-2'>
                <button onClick={toggleModal} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2'>
                    Edit
                </button>
                <button onClick={handleDelete} className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
                    Delete
                </button>
            </div>
            {isModalOpen && <ContactModal onContactsUpdated={fetchContacts} contact={contact} onClose={toggleModal} />}
        </div>
    );
}

export default ContactCard;
