/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

import React, { useState } from 'react';
import axios from 'axios';
import authService from '../services/authService';
import badWordsService from '../services/badWordsService';
import config from '../services/config';
import StarRating from './StarRating';

/**
 * CommentForm component for adding comments and ratings to locations
 * Features:
 * - Star rating selection (1-5 stars)
 * - Profanity filtering with preview before posting
 * - Error handling and validation
 *
 * @param {number} locationId - The ID of the location being commented on
 * @param {Function} onCommentAdded - Callback function triggered when a comment is successfully added
 */
const CommentForm = ({ locationId, onCommentAdded }) => {
  const [formState, setFormState] = useState({
    text: '',
    rating: 1,
    previewText: '',
    showPreview: false,
    isProcessing: false,
    error: '',
    success: ''
  });

  /**
   * Update a single form state property
   */
  const updateFormState = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormState({
      text: '',
      rating: 1,
      previewText: '',
      showPreview: false,
      isProcessing: false,
      error: '',
      success: ''
    });
  };

  /**
   * Handle changes to the comment text
   */
  const handleChange = (e) => {
    setFormState(prev => ({
      ...prev,
      text: e.target.value,
      error: '',
      success: '',
      showPreview: false
    }));
  };

  /**
   * Handle changes to the star rating
   */
  const handleRatingChange = (e) => {
    updateFormState('rating', parseInt(e.target.value));
  };

  // Destructure state for easier access
  const { 
    text, 
    rating, 
    previewText, 
    showPreview, 
    isProcessing, 
    error, 
    success 
  } = formState;

  /**
   * Check for profanity in comment and show preview if found
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!authService.isLoggedIn()) {
      updateFormState('error', 'You must be logged in to post a comment.');
      return;
    }

    if (!text.trim()) {
      updateFormState('error', 'Comment text cannot be empty.');
      return;
    }

    updateFormState('isProcessing', true);

    try {
      // Check for profanity
      const profanityCheck = badWordsService.checkProfanity(text);

      if (profanityCheck.bad_words_total > 0) {
        // Profanity detected, show censored preview
        const censoredText = badWordsService.censorProfanity(text);
        setFormState(prev => ({
          ...prev,
          previewText: censoredText,
          showPreview: true,
          isProcessing: false
        }));
      } else {
        // No profanity, submit directly
        submitComment(text);
      }
    } catch (err) {
      console.error('Error checking profanity:', err);
      // If profanity check fails, just continue with the original text
      submitComment(text);
    }
  };

  /**
   * Confirm after seeing preview and submit censored comment
   */
  const confirmAndSubmit = () => {
    submitComment(previewText);
  };

  /**
   * Submit the comment to the API
   */
  const submitComment = async (commentText) => {
    updateFormState('isProcessing', true);
    
    try {
      // Get token from localStorage directly
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${config.apiUrl}/comments/`, 
        {
          location: locationId,
          text: commentText,
          rating
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          }
        }
      );
      
      setFormState(prev => ({
        ...prev,
        isProcessing: false,
        success: 'Comment posted successfully!',
        showPreview: false
      }));
      
      resetForm();
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      let errorMsg = 'Failed to post comment.';
      
      if (err.response?.data) {
        // Try to get more specific error message from the API
        const responseData = err.response.data;
        if (typeof responseData === 'string') {
          errorMsg = responseData;
        } else if (typeof responseData === 'object') {
          // Find the first error message in the object
          const firstError = Object.values(responseData)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMsg = firstError[0];
          }
        }
      }
      
      setFormState(prev => ({
        ...prev,
        isProcessing: false,
        error: errorMsg,
        showPreview: false
      }));
    }
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
              onClick={() => updateFormState('showPreview', false)}
              className="cancel-btn secondary"
            >
              Edit Comment
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <StarRating value={rating} onChange={handleRatingChange} />
          
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