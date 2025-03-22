import React, { useState, useRef } from 'react';
import { FiEdit2, FiSave, FiX, FiFile } from 'react-icons/fi';
import './ProfileFarmer.css';
import rajesh from '../../assets/rajesh.jpg'
import { FaEdit } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";

const ProfileFarmer = () => {
  const [formData, setFormData] = useState({
    name: 'John Farmer',
    email: 'john@farmer.com',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    bio: '',
    deliveryCharge: '0.00'
  });

  const [certificates, setCertificates] = useState({
    fssai: {
      file: null,
      fileName: 'FSSAI_Certificate.pdf'
    },
    organic: {
      file: null,
      fileName: 'Organic_Certificate.pdf'
    }
  });

  const [editSections, setEditSections] = useState({
    profile: false,
    description: false,
    deliveryCharges: false,
    fssaiCertificate: false,
    organicCertificate: false
  });

  // Create refs for file inputs
  const fssaiFileInputRef = useRef(null);
  const organicFileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e, certificateType) => {
    const file = e.target.files[0];
    if (file) {
      setCertificates({
        ...certificates,
        [certificateType]: {
          file: file,
          fileName: file.name
        }
      });
    }
  };

  const handleEdit = (section) => {
    setEditSections({
      ...editSections,
      [section]: true
    });
  };

  const handleCancel = (section) => {
    setEditSections({
      ...editSections,
      [section]: false
    });
  };

  const handleSubmit = (section) => {
    // Here you would typically save the data to your backend
    console.log(`Saving ${section} data:`, formData);
    
    // Turn off edit mode for this section
    setEditSections({
      ...editSections,
      [section]: false
    });
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  return (
    <div className="fp-profile-container">
      <h1 className="fp-page-title">Profile & Verification</h1>
      
      <div className="fp-section">
        <div className="fp-section-header">
          <h2>Profile Information</h2>
          {!editSections.profile ? (
            <button className="fp-edit-btn" onClick={() => handleEdit('profile')}>
              <FaEdit /> Edit
            </button>
          ) : (
            <div className="fp-action-buttons">
              <button className="fp-save-btn" onClick={() => handleSubmit('profile')}>
                <FiSave /> Save
              </button>
              <button className="fp-cancel-btn" onClick={() => handleCancel('profile')}>
                <FiX /> Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="fp-profile-content">
          <div className="fp-profile-image-container">
            <img src={rajesh} alt="Profile" className="fp-profile-image" />
          </div>
          
          <div className="fp-form-group-container">
            <div className="fp-form-group">
              <label>Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Enter Name"
                disabled={!editSections.profile}
              />
            </div>
            
            <div className="fp-form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="Enter Email"
                disabled={!editSections.profile}
              />
            </div>
            
            <div className="fp-form-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="Enter Phone Number"
                disabled={!editSections.profile}
              />
            </div>
            
            <div className="fp-form-group fp-full-width">
              <label>Street Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                placeholder="Enter Address"
                disabled={!editSections.profile}
              />
            </div>
            
            <div className="fp-form-row">
              <div className="fp-form-group">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  placeholder="Enter City"
                  disabled={!editSections.profile}
                />
              </div>
              
              <div className="fp-form-group">
                <label>State</label>
                <select 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange}
                  disabled={!editSections.profile}
                >
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  {/* Add more states as needed */}
                </select>
              </div>
              
              <div className="fp-form-group">
                <label>Zipcode</label>
                <input 
                  type="text" 
                  name="zipcode" 
                  value={formData.zipcode} 
                  onChange={handleChange} 
                  placeholder="Enter Zipcode"
                  disabled={!editSections.profile}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="fp-section">
        <div className="fp-section-header">
          <h2>Farmer Description</h2>
          {!editSections.description ? (
            <button className="fp-edit-btn" onClick={() => handleEdit('description')}>
              <FaEdit /> Edit
            </button>
          ) : (
            <div className="fp-action-buttons">
              <button className="fp-save-btn" onClick={() => handleSubmit('description')}>
                <FiSave /> Save
              </button>
              <button className="fp-cancel-btn" onClick={() => handleCancel('description')}>
                <FiX /> Cancel
              </button>
            </div>
          )}
        </div>
        
        <textarea 
          name="bio" 
          value={formData.bio} 
          onChange={handleChange} 
          placeholder="Write a short bio about yourself and your farm..."
          rows="5"
          className="fp-textarea"
          disabled={!editSections.description}
        />
      </div>
      
      <div className="fp-section">
        <div className="fp-section-header">
          <h2>Delivery Charges</h2>
          {!editSections.deliveryCharges ? (
            <button className="fp-edit-btn" onClick={() => handleEdit('deliveryCharges')}>
              <FaEdit /> Edit
            </button>
          ) : (
            <div className="fp-action-buttons">
              <button className="fp-save-btn" onClick={() => handleSubmit('deliveryCharges')}>
                <FiSave /> Save
              </button>
              <button className="fp-cancel-btn" onClick={() => handleCancel('deliveryCharges')}>
                <FiX /> Cancel
              </button>
            </div>
          )}
        </div>
        
        <div className="fp-delivery-charge-container">
          <span className="fp-rupee-sign">₹</span>
          <input 
            type="text" 
            name="deliveryCharge" 
            value={formData.deliveryCharge} 
            onChange={handleChange} 
            className="fp-delivery-charge-input"
            disabled={!editSections.deliveryCharges}
          />
          <span className="fp-per-delivery">per delivery</span>
        </div>
      </div>
      
      <div className="fp-section">
        <div className="fp-section-header">
          <h2>Certificate Upload & Management</h2>
        </div>
        
        <div className="fp-certificate-section">
          <div className="fp-certificate-header">
            <h3>FSSAI Certificate</h3>
            {!editSections.fssaiCertificate ? (
              <button className="fp-edit-btn" onClick={() => handleEdit('fssaiCertificate')}>
                <FaEdit /> Edit/Replace
              </button>
            ) : (
              <div className="fp-action-buttons">
                <button className="fp-save-btn" onClick={() => handleSubmit('fssaiCertificate')}>
                  <FiSave /> Save
                </button>
                <button className="fp-cancel-btn" onClick={() => handleCancel('fssaiCertificate')}>
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="fp-certificate-display">
            <div className="fp-certificate-icon">
              <FaFilePdf className="fp-pdf-icon-large" />
            </div>
            <div className="fp-certificate-content">
              <div className="fp-certificate-filename">{certificates.fssai.fileName}</div>
              {editSections.fssaiCertificate && (
                <div className="fp-file-upload-container">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fssaiFileInputRef}
                    onChange={(e) => handleFileChange(e, 'fssai')}
                    className="fp-file-input"
                  />
                  <button 
                    className="fp-file-upload-btn" 
                    onClick={() => triggerFileInput(fssaiFileInputRef)}
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="fp-certificate-section">
          <div className="fp-certificate-header">
            <h3>Organic Certificate</h3>
            {!editSections.organicCertificate ? (
              <button className="fp-edit-btn" onClick={() => handleEdit('organicCertificate')}>
                <FaEdit /> Edit/Replace
              </button>
            ) : (
              <div className="fp-action-buttons">
                <button className="fp-save-btn" onClick={() => handleSubmit('organicCertificate')}>
                  <FiSave /> Save
                </button>
                <button className="fp-cancel-btn" onClick={() => handleCancel('organicCertificate')}>
                  <FiX /> Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="fp-certificate-display">
            <div className="fp-certificate-icon">
              <FaFilePdf className="fp-pdf-icon-large" />
            </div>
            <div className="fp-certificate-content">
              <div className="fp-certificate-filename">{certificates.organic.fileName}</div>
              {editSections.organicCertificate && (
                <div className="fp-file-upload-container">
                  <input
                    type="file"
                    accept=".pdf"
                    ref={organicFileInputRef}
                    onChange={(e) => handleFileChange(e, 'organic')}
                    className="fp-file-input"
                  />
                  <button 
                    className="fp-file-upload-btn" 
                    onClick={() => triggerFileInput(organicFileInputRef)}
                  >
                    Select File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileFarmer;