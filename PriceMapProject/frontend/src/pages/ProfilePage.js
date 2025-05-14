import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    bio: '',
    phone: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view your profile');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/auth/user/', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          bio: response.data.profile?.bio || '',
          phone: response.data.profile?.phone || '',
        });

        if (response.data.profile?.profile_image) {
          setPreviewImage(`http://localhost:8000${response.data.profile.profile_image}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to update your profile');
        setLoading(false);
        return;
      }

      // Create FormData object to handle multipart/form-data
      const formDataObj = new FormData();
      formDataObj.append('first_name', formData.first_name);
      formDataObj.append('last_name', formData.last_name);
      formDataObj.append('email', formData.email);
      formDataObj.append('bio', formData.bio);
      formDataObj.append('phone', formData.phone);
      
      if (profileImage) {
        formDataObj.append('profile_image', profileImage);
      }

      const response = await axios.put(
        'http://localhost:8000/api/auth/profile/update/',
        formDataObj,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(response.data);
      setSuccess('Profile updated successfully!');
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <h2>Edit Profile</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-image-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ maxWidth: '150px', maxHeight: '150px', margin: '0 auto', overflow: 'hidden', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.2)' }}>
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" style={{ width: '100%', height: 'auto' }} />
            ) : (
              <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: 'rgba(255,255,255,0.5)' }}>
                <span>👤</span>
              </div>
            )}
          </div>
          <div style={{ marginTop: '10px' }}>
            <label htmlFor="profile-image-input" style={{ cursor: 'pointer', padding: '8px 15px', backgroundColor: 'rgba(33, 150, 243, 0.8)', color: 'white', borderRadius: '4px', display: 'inline-block' }}>
              Choose Image
            </label>
            <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-control"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 