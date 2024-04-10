import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import ContactCard from '../components/Contacts/ContactCard';
import ContactModal from '../components/Contacts/ContactModal';
import fetchWithToken from '../refresh';



function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newContactUsername, setNewContactUsername] = useState(''); // State for the new contact's username




  const fetchContacts = useCallback(async () => {
    setLoading(true); // Ensure loading is set before the fetchWithToken operation
    try {
      const contactsResponse = await fetchWithToken('/api/contacts/all_contacts/', {
        headers: {
        }
      });
      if (!contactsResponse.ok) throw new Error('Failed to fetchWithToken contacts');
      const contactsData = await contactsResponse.json();
      setContacts(contactsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   const performLogin = async () => {
  //     fetchContacts(); // Ensure fetchContacts is called after a successful login
  //   };
  //   performLogin();
  // }, [fetchContacts]); // Includes fetchContacts in the dependency array since it's being called here
  
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]); // Dependencies array includes `fetchContacts`
  
  // Pass `fetchContacts` to child components
  const allContacts = contacts.map((contact, index) => {
    return <ContactCard key={index} contact={contact} resetContacts={fetchContacts} />;
  });

  const addContact = async (username) => {
    try {
      console.log(username);
      const response = await fetchWithToken('/api/contacts/add_contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact: username }), // Adjust according to your backend's expected format
      });

      if (!response.ok) {
        const errorData = await response.json(); // Assuming the server sends back JSON with an 'error' key

        // Handle specific errors based on the response from the server
        if (response.status === 400) {
          if (errorData.error === "Contact username is required.") {
            alert("Please enter a username to add.");
          } else if (errorData.error === "You cannot add yourself as a contact.") {
            alert("You cannot add yourself as a contact.");
          } else if (errorData.error === "This contact already exists.") {
            alert("This contact already exists in your contacts.");
          } else {
            alert("An error occurred: " + errorData.error);
          }
        } else if (response.status === 404) {
          // Assuming you have a div with the ID 'errorContainer' to display the error and button
          const errorContainer = document.getElementById('errorContainer');
          errorContainer.innerHTML = `<p>The user with this username does not exist.</p>
                                      <button id="inviteButton">Invite to Register</button>`;
          
          const inviteButton = document.getElementById('inviteButton');
          inviteButton.style.padding = "10px 40px";
          inviteButton.style.fontSize = "16px";
          inviteButton.style.backgroundColor = "#4CAF50";
          inviteButton.style.color = "white";
          inviteButton.style.border = "none";
          inviteButton.style.borderRadius = "5px";
          inviteButton.style.cursor = "pointer";
          inviteButton.style.marginTop = "10px";
          inviteButton.style.textAlign = "center";
          inviteButton.onclick = function() {
              const subject = encodeURIComponent('Invitation to Join Our App');
              const body = encodeURIComponent('Hello, \n\nI wanted to invite you to join our amazing app. You can sign up and find more information at: https://localhost:3000');
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
          };
        } else {
          throw new Error('Failed to add contact');
        }
        return; // Stop the function here if there was an error
      }
      await fetchContacts(); // Refresh the contacts list after adding a new contact
    } catch (err) {
      console.error('Add contact error:', err.message);
      setError(err.message); // Optionally update the error state to display an error message
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addContact(newContactUsername);
    setNewContactUsername(''); // Reset the input field
  };
 

  return (
    <main className="mx-auto max-w-4xl">
  <h1 className="text-4xl text-center font-bold mt-32 mb-5">Contacts</h1>
  <div className="mb-10">
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <input
        type="text"
        value={newContactUsername}
        onChange={(e) => setNewContactUsername(e.target.value)}
        className="form-input px-4 py-2 w-full max-w-md border-2 border-gray-200 rounded shadow"
        placeholder="Enter username"
      />
      <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-8 rounded transition duration-150">
        Add Contact
      </button>
    </form>

    <div id="errorContainer"></div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {allContacts}
  </div>
</main>

    );
}

export default ContactsPage;



