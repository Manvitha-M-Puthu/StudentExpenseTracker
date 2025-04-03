// ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUpload, FaEdit, FaSave, FaTimes, FaWallet, FaGraduationCap, FaCalendar, FaPhone, FaEnvelope } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import './ProfilePage.css';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_no: '',
    about: '',
    college: '',
    date_of_birth: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8800/api/profile/${currentUser.user_id}`, {
        withCredentials: true
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone_no: response.data.phone_no || '',
        about: response.data.about || '',
        college: response.data.college || '',
        date_of_birth: response.data.date_of_birth || '',
      });
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
      console.error('Error fetching profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile || !currentUser) return;

    const formDataUpload = new FormData();
    formDataUpload.append('profilePicture', selectedFile);

    try {
      const response = await axios.put(
        `http://localhost:8800/api/profile/${currentUser.user_id}/picture`,
        formDataUpload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
    
      setProfile({
        ...profile,
        profile_picture: response.data.profile_picture
      });
      
      toast.success('Profile picture updated successfully');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      const response = await axios.put(
        `http://localhost:8800/api/profile/${currentUser.user_id}`,
        formData,
        { withCredentials: true }
      );
      setProfile(response.data);
      setEditMode(false);
      toast.success('Profile updated successfully');
      
      if (selectedFile) {
        await uploadProfilePicture();
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    }
  };

  const toggleEditMode = () => {
    if (editMode) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone_no: profile.phone_no || '',
        about: profile.about || '',
        college: profile.college || '',
        date_of_birth: profile.date_of_birth || '',
      });
      setPreviewImage(null);
      setSelectedFile(null);
    }
    setEditMode(!editMode);
  };

  if (!currentUser) return <div className="error">Please log in to view your profile</div>;
  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">No profile data available</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Student Profile</h1>
        <button 
          className={`edit-toggle-btn ${editMode ? 'cancel' : ''}`} 
          onClick={toggleEditMode}
        >
          {editMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit Profile</>}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-picture-container">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="profile-picture" />
            ) : (
              <img 
                src={profile.profile_picture ? `http://localhost:8800/${profile.profile_picture}` : '/default-avatar.png'} 
                alt={profile.name || 'Student'} 
                className="profile-picture" 
              />
            )}
            
            {editMode && (
              <div className="picture-upload-controls">
                <label htmlFor="profile-picture-upload" className="upload-btn">
                  <FaUpload /> Choose Photo
                  <input
                    id="profile-picture-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/jpeg, image/png, image/jpg"
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h2>{profile.name}</h2>
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <span>{profile.email}</span>
            </div>
            
            {profile.phone_no && (
              <div className="info-item">
                <FaPhone className="info-icon" />
                <span>{profile.phone_no}</span>
              </div>
            )}
            
            {profile.college && (
              <div className="info-item">
                <FaGraduationCap className="info-icon" />
                <span>{profile.college}</span>
              </div>
            )}
            
            {profile.date_of_birth && (
              <div className="info-item">
                <FaCalendar className="info-icon" />
                <span>{profile.date_of_birth}</span>
              </div>
            )}
          </div>
          
          <div className="wallet-summary">
            <div className="wallet-header">
              <FaWallet className="wallet-icon" />
              <h3>My Wallet</h3>
            </div>
            <div className="wallet-balance">
              <div className="balance-item">
                <span className="balance-label">Current Balance:</span>
                <span className="balance-value">₹{Number(profile.current_balance || 0).toFixed(2)}</span>
              </div>
              <div className="balance-item">
                <span className="balance-label">Initial Balance:</span>
                <span className="balance-value">₹{Number(profile.initial_balance || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-main">
          {editMode ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone_no">Phone Number</label>
                <input
                  type="tel"
                  id="phone_no"
                  name="phone_no"
                  value={formData.phone_no}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="college">College/University</label>
                <input
                  type="text"
                  id="college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="about">About Me</label>
                <textarea
                  id="about"
                  name="about"
                  rows="4"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Write a short bio about yourself..."
                ></textarea>
              </div>
              
              <button type="submit" className="save-btn">
                <FaSave /> Save Changes
              </button>
            </form>
          ) : (
            <>
            <div className="about-section">
              <h3>About Me</h3>
              <div className="about-content">
                {profile.about ? (
                  <p>{profile.about}</p>
                ) : (
                  <p className="empty-about">No information provided yet. Click Edit Profile to add details about yourself.</p>
                )}
              </div>
            </div>
            <div className="stats-section">
              <h3>Financial Overview</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">Savings Rate</div>
                  <div className="stat-value">
                    {profile.current_balance && profile.initial_balance 
                      ? `${(((Number(profile.initial_balance) - Number(profile.current_balance)) / Number(profile.initial_balance)) * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="stat-label">of initial balance spent</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Balance Status</div>
                  <div className="stat-value" style={{ 
                    color: Number(profile.current_balance) < Number(profile.initial_balance) * 0.3 
                      ? '#d32f2f' 
                      : Number(profile.current_balance) < Number(profile.initial_balance) * 0.7 
                        ? '#ff9800' 
                        : '#4caf50' 
                  }}>
                    {profile.current_balance && profile.initial_balance 
                      ? Number(profile.current_balance) < Number(profile.initial_balance) * 0.3 
                        ? 'Low' 
                        : Number(profile.current_balance) < Number(profile.initial_balance) * 0.7 
                          ? 'Moderate' 
                          : 'Good' 
                      : 'N/A'}
                  </div>
                  <div className="stat-label">based on spending trend</div>
                </div>
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;