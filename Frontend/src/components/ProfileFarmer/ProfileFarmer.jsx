import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { FaEdit, FaFilePdf } from 'react-icons/fa';
import './ProfileFarmer.css';
import { getFarmerByEmail, updateFarmer } from '../api';

const ProfileFarmer = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    bio: '',
    deliveryCharge: '0.00',
  });

  const [certificates, setCertificates] = useState({
    fssai: { file: null, fileName: '', url: '' },
    organic: { file: null, fileName: '', url: '' },
  });

  const [farmerId, setFarmerId] = useState(null); // Store farmer _id
  const [editSections, setEditSections] = useState({
    profile: false,
    description: false,
    deliveryCharges: false,
    fssaiCertificate: false,
    organicCertificate: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fssaiFileInputRef = useRef(null);
  const organicFileInputRef = useRef(null);

  useEffect(() => {
    const fetchFarmerData = async () => {
      if (!isAuthenticated || !user?.email) return;
      try {
        const token = await getAccessTokenSilently();
        const farmerData = await getFarmerByEmail(user.email, token);
        if (farmerData) {
          setFarmerId(farmerData._id); // Store _id
          setFormData({
            name: farmerData.name || '',
            email: farmerData.email || '',
            phone: farmerData.phone || '',
            address: farmerData.address?.street || '',
            city: farmerData.address?.city || '',
            state: farmerData.address?.state || '',
            zipcode: farmerData.address?.zipCode || '',
            bio: farmerData.description || '',
            deliveryCharge: farmerData.deliveryCharge?.toString() || '0.00',
          });
          setCertificates({
            fssai: {
              file: null,
              fileName: farmerData.certificates?.fssai ? 'FSSAI_Certificate.pdf' : '',
              url: farmerData.certificates?.fssai || '',
            },
            organic: {
              file: null,
              fileName: farmerData.certificates?.organicFarm ? 'Organic_Certificate.pdf' : '',
              url: farmerData.certificates?.organicFarm || '',
            },
          });
        }
      } catch (err) {
        setError('Failed to load farmer data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmerData();
  }, [isAuthenticated, user?.email, getAccessTokenSilently]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e, certificateType) => {
    const file = e.target.files[0];
    if (file) {
      setCertificates({
        ...certificates,
        [certificateType]: {
          ...certificates[certificateType],
          file,
          fileName: file.name,
        },
      });
    }
  };

  const handleEdit = (section) => {
    setEditSections({ ...editSections, [section]: true });
  };

  const handleCancel = (section) => {
    setEditSections({ ...editSections, [section]: false });
    if (section === 'fssaiCertificate' || section === 'organicCertificate') {
      setCertificates({
        ...certificates,
        [section === 'fssaiCertificate' ? 'fssai' : 'organic']: {
          ...certificates[section === 'fssaiCertificate' ? 'fssai' : 'organic'],
          file: null,
        },
      });
    }
  };

  const handleSubmit = async (section) => {
    if (!isAuthenticated || !farmerId) return;
    try {
      const token = await getAccessTokenSilently();
      const formDataToSend = new FormData();

      const address = {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipcode,
      };

      if (section === 'profile') {
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('address', JSON.stringify(address));
      } else if (section === 'description') {
        formDataToSend.append('description', formData.bio);
      } else if (section === 'deliveryCharges') {
        formDataToSend.append('deliveryCharge', formData.deliveryCharge);
      } else if (section === 'fssaiCertificate' && certificates.fssai.file) {
        formDataToSend.append('fssaiCert', certificates.fssai.file);
      } else if (section === 'organicCertificate' && certificates.organic.file) {
        formDataToSend.append('organicCert', certificates.organic.file);
      }

      const updatedFarmer = await updateFarmer(farmerId, formDataToSend, token);
      console.log(`Saved ${section} data:`, updatedFarmer);

      if (section === 'fssaiCertificate' || section === 'organicCertificate') {
        setCertificates({
          ...certificates,
          [section === 'fssaiCertificate' ? 'fssai' : 'organic']: {
            ...certificates[section === 'fssaiCertificate' ? 'fssai' : 'organic'],
            url: updatedFarmer.certificates[section === 'fssaiCertificate' ? 'fssai' : 'organicFarm'],
            file: null,
          },
        });
      }

      setEditSections({ ...editSections, [section]: false });
    } catch (err) {
      console.error(`Error saving ${section}:`, err);
      setError(`Failed to save ${section}.`);
    }
  };

  const triggerFileInput = (inputRef) => {
    inputRef.current.click();
  };

  if (loading) return <div className="fp-profile-container">Loading...</div>;
  if (error) return <div className="fp-profile-container">{error}</div>;

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
            <img
              src={formData.profilePic || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="fp-profile-image"
            />
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
                disabled
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
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter State"
                  disabled={!editSections.profile}
                />
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
              <div className="fp-certificate-filename">
                {certificates.fssai.fileName || 'No FSSAI Certificate Uploaded'}
              </div>
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
              <div className="fp-certificate-filename">
                {certificates.organic.fileName || 'No Organic Certificate Uploaded'}
              </div>
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