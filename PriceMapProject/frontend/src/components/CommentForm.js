import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const CommentForm = ({ locationId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to add a comment');
        return;
      }

      const response = await axios.post(
        `http://localhost:8000/api/locations/${locationId}/add_comment/`, 
        { text }
      );

      setSuccess('Comment added successfully!');
      setText('');

      // Call the callback to update the parent component
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="comment-form">
      <h3>Add Comment</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            id="text"
            name="text"
            value={text}
            onChange={handleChange}
            placeholder="Write your comment here..."
            required
            rows={4}
          />
        </div>
        
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
};

export default CommentForm; 