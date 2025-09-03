/**
 * AI Configuration API Route
 * Provides non-sensitive configuration to frontend
 */

const express = require('express');
const router = express.Router();

// GET /api/ai-config - Get AI configuration (non-sensitive)
router.get('/ai-config', (req, res) => {
    try {
        // Only send non-sensitive configuration
        const config = {
            azureOpenAI: {
                endpoint: process.env.AZURE_OPENAI_ENDPOINT,
                deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
                apiVersion: process.env.AZURE_OPENAI_API_VERSION,
                model: process.env.AZURE_OPENAI_MODEL
            },
            features: {
                enableAI: process.env.ENABLE_AI_ADVISORS === 'true',
                enableFallback: process.env.ENABLE_FALLBACK_ANALYSIS === 'true',
                enableCaching: process.env.ENABLE_AI_CACHING === 'true',
                maxTokens: parseInt(process.env.MAX_TOKENS) || 2000,
                temperature: parseFloat(process.env.TEMPERATURE) || 0.3
            },
            monitoring: {
                enableLogging: process.env.ENABLE_AI_LOGGING === 'true',
                enableMetrics: process.env.ENABLE_AI_METRICS === 'true',
                logLevel: process.env.AI_LOG_LEVEL || 'info'
            }
        };
        
        res.json({
            success: true,
            config: config,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error providing AI config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load AI configuration',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/ai-analysis - Proxy AI analysis requests
router.post('/ai-analysis', async (req, res) => {
    try {
        const { prompt, context } = req.body;
        
        if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT) {
            return res.status(400).json({
                success: false,
                error: 'Azure OpenAI not configured',
                fallback: true
            });
        }
        
        // Make the actual API call to Azure OpenAI
        const response = await fetch(`${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.AZURE_OPENAI_API_KEY
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: prompt.system },
                    { role: 'user', content: prompt.user }
                ],
                max_tokens: parseInt(process.env.MAX_TOKENS) || 2000,
                temperature: parseFloat(process.env.TEMPERATURE) || 0.3,
                top_p: 0.9,
                frequency_penalty: 0.1,
                presence_penalty: 0.1
            })
        });
        
        if (!response.ok) {
            throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        res.json({
            success: true,
            content: data.choices[0].message.content,
            usage: data.usage,
            model: process.env.AZURE_OPENAI_MODEL,
            source: 'azure-openai'
        });
        
    } catch (error) {
        console.error('Error in AI analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            fallback: true
        });
    }
});

// GET /api/ai-status - Get AI system status
router.get('/ai-status', (req, res) => {
    const status = {
        configured: !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT),
        hasApiKey: !!process.env.AZURE_OPENAI_API_KEY,
        hasEndpoint: !!process.env.AZURE_OPENAI_ENDPOINT,
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'Not set',
        model: process.env.AZURE_OPENAI_MODEL || 'Not set',
        features: {
            enableAI: process.env.ENABLE_AI_ADVISORS === 'true',
            enableFallback: process.env.ENABLE_FALLBACK_ANALYSIS === 'true',
            enableCaching: process.env.ENABLE_AI_CACHING === 'true'
        },
        timestamp: new Date().toISOString()
    };
    
    res.json({
        success: true,
        status: status
    });
});

module.exports = router;
