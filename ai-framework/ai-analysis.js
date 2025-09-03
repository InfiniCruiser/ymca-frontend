const express = require('express');
const router = express.Router();
require('dotenv').config();

// Azure OpenAI configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

// Validate required environment variables
if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT) {
    console.error('❌ Missing required Azure OpenAI environment variables');
    console.error('Required: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT');
}

/**
 * POST /api/ai-analysis
 * Proxies AI analysis requests to Azure OpenAI
 */
router.post('/ai-analysis', async (req, res) => {
    try {
        const { prompt, context } = req.body;
        
        if (!prompt || !prompt.system || !prompt.user) {
            return res.status(400).json({
                error: 'Invalid prompt format. Expected {system, user}',
                received: prompt
            });
        }
        
        if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT) {
            return res.status(500).json({
                error: 'Azure OpenAI not configured',
                missing: {
                    endpoint: !AZURE_OPENAI_ENDPOINT,
                    apiKey: !AZURE_OPENAI_API_KEY,
                    deployment: !AZURE_OPENAI_DEPLOYMENT
                }
            });
        }
        
        console.log('🚀 Processing AI analysis request for:', context?.ymcaName || 'Unknown YMCA');
        
        // Construct the Azure OpenAI API request
        const azureUrl = `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${AZURE_OPENAI_API_VERSION}`;
        
        const azureRequest = {
            messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user }
            ],
            max_tokens: 2000,
            temperature: 0.7,
            top_p: 0.95,
            frequency_penalty: 0,
            presence_penalty: 0
        };
        
        console.log('📡 Calling Azure OpenAI at:', azureUrl);
        
        const azureResponse = await fetch(azureUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': AZURE_OPENAI_API_KEY
            },
            body: JSON.stringify(azureRequest)
        });
        
        if (!azureResponse.ok) {
            const errorText = await azureResponse.text();
            console.error('❌ Azure OpenAI API error:', azureResponse.status, errorText);
            throw new Error(`Azure OpenAI API error: ${azureResponse.status} ${azureResponse.statusText}`);
        }
        
        const azureData = await azureResponse.json();
        
        if (!azureData.choices || !azureData.choices[0] || !azureData.choices[0].message) {
            console.error('❌ Unexpected Azure OpenAI response format:', azureData);
            throw new Error('Unexpected response format from Azure OpenAI');
        }
        
        const aiContent = azureData.choices[0].message.content;
        
        console.log('✅ Azure OpenAI response received, length:', aiContent?.length || 0);
        
        // Return the response in the format expected by the frontend
        res.json({
            success: true,
            content: aiContent,
            usage: azureData.usage || {},
            model: azureData.model || AZURE_OPENAI_DEPLOYMENT,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ AI analysis error:', error);
        res.status(500).json({
            error: error.message,
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
