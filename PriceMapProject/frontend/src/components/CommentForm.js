import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import badWordsService from '../services/badWordsService';
import config from '../services/config';

const CommentForm = ({ locationId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    setText(e.target.value);
    setError('');
    setSuccess('');
    setShowPreview(false);
  };

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value));
  };

  // Check for profanity and show preview if found
  const previewComment = () => {
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Use the synchronous client-side profanity filter
      const result = badWordsService.checkProfanity(text);
      
      if (result.bad_words_total > 0) {
        console.log(`Profanity detected: ${result.bad_words_list.join(', ')}`);
        // Generate censored version
        const censored = badWordsService.censorProfanity(text);
        setPreviewText(censored);
        setShowPreview(true);
      } else {
        // No profanity, submit directly
        submitComment(text);
      }
    } catch (error) {
      console.error('Error checking comment:', error);
      setError('Error processing your comment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit the final comment (original or censored)
  const submitComment = async (contentToSubmit) => {
    try {
      if (!authService.isLoggedIn()) {
        setError('You must be logged in to add a comment');
        return;
      }

      setIsProcessing(true);
      setError('');
      
      const response = await axios.post(
        `${config.apiUrl}/locations/${locationId}/add_comment/`, 
        { text: contentToSubmit, rating }
      );

      setSuccess('Comment added successfully!');
      setText('');
      setRating(1);
      setPreviewText('');
      setShowPreview(false);

      // Call the callback to update the parent component
      if (onCommentAdded) {
        onCommentAdded(response.data);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      if (err.response?.status === 400) {
        setError('Invalid comment data. Please check your input.');
      } else if (err.response?.status === 401) {
        setError('You must be logged in to add a comment.');
      } else if (err.response?.status === 404) {
        setError('Location not found. Please refresh the page and try again.');
      } else {
        setError('Failed to add comment. Please check your connection and try again later.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    previewComment();
  };

  const confirmAndSubmit = () => {
    submitComment(previewText);
  };

  return (
    <div className="comment-form">
      <h3>Add Comment</h3>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {showPreview ? (
        <div className="preview-container">
          <p>Your comment contains inappropriate language and has been censored:</p>
          <div className="censored-preview">{previewText}</div>
          <div className="preview-actions">
            <button 
              onClick={confirmAndSubmit}
              disabled={isProcessing}
              className="submit-btn primary"
            >
              Submit Comment
            </button>
            <button 
              onClick={() => setShowPreview(false)}
              className="cancel-btn secondary"
            >
              Edit Comment
            </button>
          </div>
        </div>
      ) : (
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
          
          <div>
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
          
          <button type="submit" disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Preview & Post Comment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentForm; 