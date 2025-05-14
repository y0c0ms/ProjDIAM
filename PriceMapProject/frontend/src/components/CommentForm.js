import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const CommentForm = ({ locationId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value));
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
        { text, rating }
      );

      setSuccess('Comment added successfully!');
      setText('');
      setRating(1);

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
        <div className="star-rating">
          <input 
            type="radio" 
            id="star5" 
            name="rating" 
            value="5" 
            checked={rating === 5} 
            onChange={handleRatingChange} 
          />
          <label htmlFor="star5" title="5 stars"></label>
          
          <input 
            type="radio" 
            id="star4" 
            name="rating" 
            value="4" 
            checked={rating === 4} 
            onChange={handleRatingChange} 
          />
          <label htmlFor="star4" title="4 stars"></label>
          
          <input 
            type="radio" 
            id="star3" 
            name="rating" 
            value="3" 
            checked={rating === 3} 
            onChange={handleRatingChange} 
          />
          <label htmlFor="star3" title="3 stars"></label>
          
          <input 
            type="radio" 
            id="star2" 
            name="rating" 
            value="2" 
            checked={rating === 2} 
            onChange={handleRatingChange} 
          />
          <label htmlFor="star2" title="2 stars"></label>
          
          <input 
            type="radio" 
            id="star1" 
            name="rating" 
            value="1" 
            checked={rating === 1} 
            onChange={handleRatingChange} 
          />
          <label htmlFor="star1" title="1 star"></label>
        </div>
        
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