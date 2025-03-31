import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './UserProfile.css';
import { getUserByEmail, updateUser } from '../api'; // Adjust path to api.js

const UserProfile = () => {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });
  const [fetchError, setFetchError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !user?.email) return;
      try {
        const token = await getAccessTokenSilently();
        const response = await getUserByEmail(user.email, token); // Full response: { message, user }
        const fetchedUser = response.user; // Extract the 'user' object
        setUserData(fetchedUser);
        setFormData({
          name: fetchedUser.name || '',
          email: fetchedUser.email || '',
          phone: fetchedUser.phone || '',
          address: {
            street: fetchedUser.address.street || '',
            city: fetchedUser.address.city || '',
            state: fetchedUser.address.state || '',
            zipCode: fetchedUser.address.zipCode || '',
          },
        });
      } catch (err) {
        setFetchError(err.message || 'Failed to load user profile.');
      }
    };
    fetchUserData();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const token = await getAccessTokenSilently();
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        address: JSON.stringify(formData.address), // Backend expects stringified address
      };
      const updatedUser = await updateUser(userData._id, updatedData, token);
      setUserData(updatedUser);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000); // Clear success message after 3s
    } catch (err) {
      setUpdateError('Failed to update profile. Please try again.');
    }
  };

  // Handle cancel (reset form to original data)
  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: {
        street: userData.address.street || '',
        city: userData.address.city || '',
        state: userData.address.state || '',
        zipCode: userData.address.zipCode || '',
      },
    });
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in to view your profile.</div>;
  if (fetchError || !userData) return <div className="profile-section-p">{fetchError || 'User not found'}</div>;

  return (
    <div className="profile-section-p">
      <h1>My Profile</h1>
      <p>Manage your account settings and preferences</p>

      {/* Personal Information */}
      <div className="section">
        <h2>Personal Information</h2>
        <div className="form-group">
          <div className="input-field">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>
          <div className="input-field">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              placeholder="Email Address"
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-field">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Add Phone Number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="section">
        <h2>Address</h2>
        <div className="form-group">
          <div className="input-field">
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              placeholder={formData.address.street ? 'Street Address' : 'Add your street address'}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-field">
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              placeholder={formData.address.city ? 'City' : 'Add your city'}
            />
          </div>
          <div className="input-field">
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleInputChange}
              placeholder={formData.address.state ? 'State' : 'Add your state'}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="input-field">
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleInputChange}
              placeholder={formData.address.zipCode ? 'Zipcode' : 'Add your zipcode'}
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="form-actions">
        <button className="save-btn" onClick={handleSubmit}>
          Save Changes
        </button>
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      </div>

      {/* Feedback Messages */}
      {updateSuccess && <p className="success-message">Profile updated successfully!</p>}
      {updateError && <p className="error-message">{updateError}</p>}
    </div>
  );
};

export default UserProfile;
