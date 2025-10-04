const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fallbackMappings = require('./fallback-mappings.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache for feature data
const featureCache = new Map();

/**
 * Check feature compatibility and get suggestions
 * @param {string} featureName - The web feature to check
 * @returns {Promise<Object>} Feature compatibility data
 */
async function checkFeatureCompatibility(featureName) {
  // Check cache first
  if (featureCache.has(featureName)) {
    return featureCache.get(featureName);
  }

  // Check curated fallback mappings first
  const curatedMapping = fallbackMappings[featureName.toLowerCase()];
  if (curatedMapping) {
    const result = {
      feature: featureName,
      supportPercentage: curatedMapping.supportPercentage,
      status: curatedMapping.status,
      alternative: curatedMapping.alternative,
      fallbackSnippet: curatedMapping.fallbackSnippet,
      explanation: curatedMapping.explanation,
      source: 'curated'
    };
    featureCache.set(featureName, result);
    return result;
  }

  try {
    // Try to fetch from web-features data or MDN compatibility data
    const baselineData = await fetchBaselineData(featureName);
    
    if (baselineData) {
      const result = {
        feature: featureName,
        supportPercentage: baselineData.supportPercentage || 50,
        status: baselineData.status || 'limited',
        alternative: baselineData.alternative || 'Check polyfills or alternative implementations',
        fallbackSnippet: baselineData.fallbackSnippet || '// Fallback implementation needed',
        explanation: baselineData.explanation || 'This feature may not be widely supported.',
        source: 'baseline'
      };
      featureCache.set(featureName, result);
      return result;
    }
  } catch (error) {
    console.warn(`Failed to fetch baseline data for ${featureName}:`, error.message);
  }

  // Fallback to AI-generated suggestion (placeholder for now)
  const aiSuggestion = await generateAISuggestion(featureName);
  
  const result = {
    feature: featureName,
    supportPercentage: 60, // Conservative estimate
    status: 'unknown',
    alternative: aiSuggestion.alternative,
    fallbackSnippet: aiSuggestion.fallbackSnippet,
    explanation: aiSuggestion.explanation,
    source: 'ai'
  };
  
  featureCache.set(featureName, result);
  return result;
}

/**
 * Fetch baseline compatibility data
 * @param {string} featureName - Feature name to look up
 * @returns {Promise<Object|null>} Baseline data or null
 */
async function fetchBaselineData(featureName) {
  try {
    // This is a placeholder - in a real implementation, you'd query
    // the @web-features package or MDN Browser Compatibility Data
    // For now, we'll return null to fall back to curated mappings
    return null;
  } catch (error) {
    console.error('Error fetching baseline data:', error);
    return null;
  }
}

/**
 * Generate AI suggestion for unknown features
 * @param {string} featureName - Feature name
 * @returns {Promise<Object>} AI-generated suggestion
 */
async function generateAISuggestion(featureName) {
  // Placeholder AI integration - replace with actual OpenAI API call
  // For hackathon demo, return generic responses
  return {
    alternative: `Consider using established alternatives to ${featureName}`,
    fallbackSnippet: `// TODO: Implement fallback for ${featureName}\n// Check feature support and provide graceful degradation`,
    explanation: `${featureName} may have limited browser support. Consider progressive enhancement.`
  };
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/checkFeature', async (req, res) => {
  try {
    const { feature } = req.body;
    
    if (!feature) {
      return res.status(400).json({ 
        error: 'Feature name is required',
        example: { feature: 'css-container-queries' }
      });
    }

    const result = await checkFeatureCompatibility(feature);
    res.json(result);
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.get('/features', (req, res) => {
  const availableFeatures = Object.keys(fallbackMappings);
  res.json({
    count: availableFeatures.length,
    features: availableFeatures
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CompatBuddy backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Available features: http://localhost:${PORT}/features`);
});

module.exports = app;