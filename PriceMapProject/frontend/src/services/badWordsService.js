// A simple list of bad words to check against
const BAD_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 
  'whore', 'slut', 'bastard', 'motherfucker', 'piss', 'damn', 'ass',
  // Add more words as needed
];

/**
 * Simple local profanity checker - synchronous version
 * @param {string} text - The text to check
 * @returns {Object} - Response with bad words data
 */
const checkProfanity = (text) => {
  try {
    if (!text) return { bad_words_total: 0, bad_words_list: [] };
    
    const lowerText = text.toLowerCase();
    let foundBadWords = [];
    
    // Check each bad word using proper regex for word boundaries
    BAD_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundBadWords.push(word);
      }
    });
    
    // Remove duplicates
    foundBadWords = [...new Set(foundBadWords)];
    
    return {
      bad_words_total: foundBadWords.length,
      bad_words_list: foundBadWords
    };
  } catch (error) {
    console.error('Error checking profanity:', error);
    return { bad_words_total: 0, bad_words_list: [] };
  }
};

/**
 * Simple local profanity censoring function - synchronous version
 * @param {string} text - The text to censor
 * @returns {string} - Censored text
 */
const censorProfanity = (text) => {
  try {
    if (!text) return text;
    
    let censoredText = text;
    
    // Replace each bad word with asterisks
    BAD_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      censoredText = censoredText.replace(regex, '*'.repeat(word.length));
    });
    
    return censoredText;
  } catch (error) {
    console.error('Error censoring profanity:', error);
    return text;
  }
};

const badWordsService = {
  checkProfanity,
  censorProfanity
};

export default badWordsService; 