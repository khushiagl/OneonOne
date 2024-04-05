import React, { useState, useEffect } from 'react';

function ContactModal({ isOpen, onClose, onSave, contact }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', image: null });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Reset image preview
    setImagePreview('');
    // If editing an existing contact, populate the form with its details
    if (contact) {
      setFormData(contact);
      // Set image preview if there's an existing image
      if (contact.image) {
        setImagePreview(contact.image);
      }
    }
  }, [contact]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      // Handle file inputs separately
      const file = files[0];
      setFormData(prev => ({ ...prev, image: file }));
      // Update image preview
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      // Handle other inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // If your backend expects multipart/form-data for file upload, convert formData to FormData
    const submissionData = new FormData();
    Object.keys(formData).forEach(key => {
      submissionData.append(key, formData[key]);
    });

    onSave(submissionData); // Adjust onSave to handle FormData if necessary
    onClose(); // Close modal after saving
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <form onSubmit={handleSubmit}>
        {/* Other inputs */}
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        {/* Image Input and Preview */}
        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px' }} />}
        <input
          type="file"
          name="image"
          onChange={handleChange}
        />
        {/* Submit and Cancel buttons */}
        <button type="submit">Save</button>
        <button onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}

export default ContactModal;
