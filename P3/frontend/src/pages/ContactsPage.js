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
      const data = await response.json(); 
      console.log('Login successful:', data);
      localStorage.setItem('token', data.access); 
    } catch (error) {
      console.error('Login error:', error.message);
      // Handle errors, e.g., show an error message to the user
    }
  };

  const fetchContacts = async () => {
    try {
      const contactsResponse = await fetch(' http://127.0.0.1:8000/api/contacts/all_contacts/', {
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

  useEffect(() => {
    login("colepurboo", "Nigela123$");
    const fetchContacts = async () => {
      try {
        const contactsResponse = await fetch(' http://127.0.0.1:8000/api/contacts/all_contacts/', {
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

  const resetContacts = () => {
    fetchContacts();
  }

  const allContacts = contacts.map((contact, index) => {
    return <ContactCard resetContacts={resetContacts} key={index} contact={contact} />;
    
  });


  const handleAddContact = () => {
    setEditingContact(null); // Ensure we're in "add" mode
    setIsModalOpen(true);
  };
  
  const saveContact = async (contactDetails) => {

    try {
      const response = await fetch('http://localhost:8000/api/contacts/add_contact/', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Add failed');
      }

      if (!response.ok) throw new Error('Failed to save contact');
      console.log('Contact saved');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err.message);
    }
  };

 

  return (
    <main>
      <h1 className='mt-32 text-red-500'>Contacts</h1>
      <button 
        onClick={handleAddContact}
        className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4'>
        Add Contact
      </button>
        <div>
          {allContacts} 
        </div>
    </main>
    
  );
}

export default ContactsPage;



