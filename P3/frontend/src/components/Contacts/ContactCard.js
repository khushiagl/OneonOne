import React from 'react'
import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';


function ContactCard ({ contact }) {

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
          delete(contact.contact_email);
        }
      };
    
    const deleteContact = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/contacts/${contact.contact_email}/`, {
                method: 'DELETE',
                headers: {headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token in the Authorization header
                  }}
            });
            if (!response.ok) throw new Error('Failed to delete contact');
            console.log('Contact deleted');
        }
        catch (err) {
            console.error(err.message);
        }
    }

    const editContact = () => {
    
    }

    
    return (
        <div className='contact_card'>
            <img src={contact.image} alt={contact.name} />
            <h2>{contact.name}</h2>
            <p>{contact.email}</p>
            <p>{contact.phone}</p>
            <button onClick={editContact()}>Edit</button>
            <button onClick={handleDelete()}>Delete</button>
        </div>
    )
}

export default ContactCard
