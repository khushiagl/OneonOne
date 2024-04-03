import React from 'react';
import { useState, useEffect } from 'react';
import ContactCard from '../components/Contacts/ContactCard';
import ContactModal from '../components/Contacts/ContactModal';

function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingContact, setEditingContact] = useState(null); // State to track the editing contact
    const [isModalOpen, setIsModalOpen] = useState(false); // State to track if the modal is open
    const onEdit = (contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/users/login/', { // Adjust the URL to your backend's login endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const data = await response.json(); // Assuming the backend responds with a JSON object containing the token
      console.log('Login successful:', data);
      // Here you would typically save the token to local storage and redirect the user
      localStorage.setItem('token', data.access); // Adjust depending on how your token is returned
      // Redirect user or perform other actions upon successful login
    } catch (error) {
      console.error('Login error:', error.message);
      // Handle errors, e.g., show an error message to the user
    }
  };

  useEffect(() => {
    login("a", "Hello@123");
    const fetchContacts = async () => {
      try {
        const contactsResponse = await fetch(' http://127.0.0.1:8000/api/all_contacts/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the token in the Authorization header
          }
        });
        if (!contactsResponse.ok) throw new Error('Failed to fetch contacts');
        const contactsData = await contactsResponse.json();

        setContacts(contactsData);
      }
      catch (err) {
        setError(err.message);
      }
      finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const allContacts = contacts.map((contact) => {
    return <ContactCard key={contact.id} contact={contact} />;
  });

  const editContact = async (contact) => {
    try {
      const response = await fetch(`http://localhost:8000/api/edit_contacts/${contact.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contact)
      });
      if (!response.ok) throw new Error('Failed to edit contact');
      console.log('Contact edited');
    } catch (err) {
      console.error(err.message);
    }
  };


  return (
    <div>
      <h2>Contacts Page</h2>
      {loading && <p>Loading contacts...</p>}
      {error && <p>Error fetching contacts: {error}</p>}
      <div className='all_contacts'>
                {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} onEdit={onEdit} />
                ))}
      </div>
      {isModalOpen && <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} contact={editingContact} onSave={editContact()} />}
    </div>
  );
}

export default ContactsPage;


