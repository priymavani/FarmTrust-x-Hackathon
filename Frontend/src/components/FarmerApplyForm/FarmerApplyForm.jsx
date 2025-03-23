import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import './FarmerApplyForm.css';

export default function FarmerApplyForm() {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organicFarmDoc: null,
    fssaiDoc: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [farmerStatus, setFarmerStatus] = useState(null); // null: not checked/not found, { isVerified: boolean }: farmer exists

  // Check farmer status and sync formData on load
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.username || user.name || '',
        email: user.email || '',
      }));
      checkFarmerStatus(user.email);
    }
  }, [isAuthenticated, user]);

  // Fetch farmer status from backend
  const checkFarmerStatus = async (email) => {
    try {
      const response = await axios.get(`https://farmtrust-x-hackathon.onrender.com/farmers/${email}`);
      const farmer = response.data.farmer;
      setFarmerStatus({ isVerified: farmer.isVerified });
      setSubmitted(true); // Mark as submitted since farmer exists
    } catch (error) {
      if (error.response?.status === 404) {
        setFarmerStatus(null); // No farmer found, allow form
        setSubmitted(false);
      } else {
        setErrors((prev) => ({
          ...prev,
          fetch: 'Failed to check farmer status. Please try again later.',
        }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'File size must be under 5MB',
        }));
        return;
      }
      if (files[0].type !== 'application/pdf') {
        setErrors((prev) => ({
          ...prev,
          [name]: 'Only PDF files are allowed',
        }));
        return;
      }
      setErrors((prev) => ({ ...prev, [name]: null }));
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.organicFarmDoc) newErrors.organicFarmDoc = 'Organic farm document is compulsory';
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const postResponse = await axios.post('https://farmtrust-x-hackathon.onrender.com/farmers', {
        name: formData.name,
        email: formData.email,
      });
      const farmerId = postResponse.data.farmerId;
      console.log('Farmer created:', postResponse.data);

      const patchFormData = new FormData();
      patchFormData.append('phone', formData.phone);
      if (formData.organicFarmDoc) {
        patchFormData.append('organicCert', formData.organicFarmDoc);
      }
      if (formData.fssaiDoc) {
        patchFormData.append('fssaiCert', formData.fssaiDoc);
      }

      const patchResponse = await axios.patch(
        `https://farmtrust-x-hackathon.onrender.com/farmers/${farmerId}`,
        patchFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('Farmer updated:', patchResponse.data);

      setSubmitted(true);
      setFarmerStatus({ isVerified: false }); // Set to pending after submission
      setFormData((prev) => ({
        ...prev,
        phone: '',
        organicFarmDoc: null,
        fssaiDoc: null,
      }));
    } catch (error) {
      console.error('Submission error:', error.response ? error.response.data : error.message);
      setErrors((prev) => ({
        ...prev,
        submit: error.response?.data?.message || 'Failed to submit application. Please try again.',
      }));
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to apply as a farmer.</div>;
  }

  // If farmer has applied, show status page
  if (submitted || farmerStatus) {
    if (farmerStatus?.isVerified) {
      return (
        <div className="farmer-apply-container">
          <h1>Farmer Application Status</h1>
          <div className="verification-message verified">
            <p>Congratulations! Your farmer application has been verified. You can now start selling your products.</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="farmer-apply-container">
          <h1>Farmer Application Status</h1>
          <div className="verification-message">
            <p>
              Your documents are under verification. This process may take up to 2-3 days. We'll notify you at {formData.email} once reviewed.
            </p>
          </div>
        </div>
      );
    }
  }

  // Show form if no farmer record exists
  return (
    <div className="farmer-apply-container">
      <h1>Apply for Farmer Role</h1>

      <form onSubmit={handleSubmit} className="farmer-apply-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            disabled
            className="disabled"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="instructions-box">
          <p className="instructions">
            <strong>Instructions:</strong> If you are selling packaged products (e.g., packed organic dry fruits), an FSSAI certificate is compulsory. If you have an FSSAI certificate, please upload it below. The organic farm document is mandatory for all applicants. <strong>All documents must be in PDF format and under 5MB.</strong>
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="organicFarmDoc">Organic Farm Document (Compulsory)</label>
          <div className="file-input-wrapper">
            <label htmlFor="organicFarmDoc" className="custom-file-input">Select File</label>
            <input
              type="file"
              id="organicFarmDoc"
              name="organicFarmDoc"
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden-file-input"
            />
          </div>
          {errors.organicFarmDoc && <span className="error">{errors.organicFarmDoc}</span>}
          {formData.organicFarmDoc && (
            <p className="file-info">Selected: {formData.organicFarmDoc.name}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="fssaiDoc">FSSAI Certificate (Optional)</label>
          <div className="file-input-wrapper">
            <label htmlFor="fssaiDoc" className="custom-file-input">Select File</label>
            <input
              type="file"
              id="fssaiDoc"
              name="fssaiDoc"
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden-file-input"
            />
          </div>
          {errors.fssaiDoc && <span className="error">{errors.fssaiDoc}</span>}
          {formData.fssaiDoc && (
            <p className="file-info">Selected: {formData.fssaiDoc.name}</p>
          )}
        </div>

        <button type="submit" className="submit-btn">
          Submit Application
        </button>
        {errors.submit && <span className="error submit-error">{errors.submit}</span>}
        {errors.fetch && <span className="error fetch-error">{errors.fetch}</span>}
      </form>
    </div>
  );
}