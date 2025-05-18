/**
 * Code made by:
 * - Manuel Santos nº 111087
 * - Alexandre Mendes nº 111026
 * - Vlad Ganta nº 110672
 */

// A simple list of bad words to check against
const BAD_WORDS = [
  // Inglês
  'fuck', 'shit', 'asshole', 'bitch', 'cunt', 'dick', 'pussy', 'cock', 
  'whore', 'slut', 'bastard', 'motherfucker', 'piss', 'damn', 'ass',

  // Português (Portugal e Brasil)
  'merda', 'caralho', 'porra', 'puta', 'puto', 'foda', 'fodido', 'foder', 'cu', 'cabrao', 'cabrão',
  'paneleiro','bicha', 'otário', 'otaria', 'arrombado', 'corno', 'corna',
  'burro', 'burra', 'estúpido', 'estupida', 'palhaço', 'palhaca', 'desgraçado', 'desgraçada', 'fdp',
  'safado', 'safada', 'vagabundo', 'vagabunda', 'canalha', 'escroto', 'escrota', 'imbecil', 'idiota',
  'maluco', 'maluca', 'nojento', 'nojenta', 'porcaria', 'retardado', 'retardada', 'tarado', 'tarada',
  'pila', 'piça', 'pinto', 'punheteiro', 'punheteira',
  'chupa', 'chupeta', 'chupador', 'chupadora', 'mamador', 'mamadora', 'corno', 'corna', 'cornudo', 'cornuda',
  'puta que pariu', 'vai tomar no cu', 'vai se foder', 'vai-te foder', 'vai-te lixar', 'crl','vai-te catar'
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