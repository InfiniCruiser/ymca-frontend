/**
 * AI Advisory Configuration Template
 * Copy this file and fill in your Azure OpenAI credentials
 * 
 * USAGE:
 * 1. Copy this file to ai-config.js
 * 2. Fill in your Azure OpenAI credentials
 * 3. Include ai-config.js in your HTML before the AI advisory scripts
 */

// Azure OpenAI Configuration
window.AI_CONFIG = {
    // Your Azure OpenAI API Key
    AZURE_OPENAI_API_KEY: 'your-azure-openai-api-key-here',
    
    // Your Azure OpenAI Endpoint (e.g., https://your-resource.openai.azure.com/)
    AZURE_OPENAI_ENDPOINT: 'https://your-resource.openai.azure.com/',
    
    // Your Azure OpenAI Deployment Name (e.g., gpt-4, gpt-35-turbo)
    AZURE_OPENAI_DEPLOYMENT_NAME: 'gpt-4',
    
    // Azure OpenAI API Version (usually 2024-02-15-preview)
    AZURE_OPENAI_API_VERSION: '2024-02-15-preview',
    
    // Model to use (e.g., gpt-4, gpt-35-turbo)
    AZURE_OPENAI_MODEL: 'gpt-4',
    
    // Feature flags
    ENABLE_AI_ADVISORS: 'true',
    ENABLE_FALLBACK_ANALYSIS: 'true',
    ENABLE_AI_CACHING: 'true',
    
    // AI parameters
    MAX_TOKENS: '2000',
    TEMPERATURE: '0.3',
    
    // Monitoring
    ENABLE_AI_LOGGING: 'true',
    ENABLE_AI_METRICS: 'true',
    AI_LOG_LEVEL: 'info'
};

// Alternative: Set configuration programmatically
// window.setAIConfig('AZURE_OPENAI_API_KEY', 'your-key-here');
// window.setAIConfig('AZURE_OPENAI_ENDPOINT', 'https://your-endpoint.azure.com/');

console.log('🔧 AI Configuration template loaded');
console.log('💡 Please copy this file to ai-config.js and fill in your credentials');

// Example of how to set configuration at runtime
function setupAzureOpenAI(apiKey, endpoint, deploymentName = 'gpt-4') {
    if (!apiKey || !endpoint) {
        console.error('❌ API Key and Endpoint are required');
        return false;
    }
    
    // Set the configuration
    window.setAIConfig('AZURE_OPENAI_API_KEY', apiKey);
    window.setAIConfig('AZURE_OPENAI_ENDPOINT', endpoint);
    window.setAIConfig('AZURE_OPENAI_DEPLOYMENT_NAME', deploymentName);
    
    console.log('✅ Azure OpenAI configuration set successfully');
    console.log('🔄 Reinitializing AI Advisory system...');
    
    // Reinitialize the AI Advisory system with new configuration
    if (window.aiAdvisoryIntegration) {
        window.aiAdvisoryIntegration.updateConfiguration({
            'azureOpenAI.apiKey': apiKey,
            'azureOpenAI.endpoint': endpoint,
            'azureOpenAI.deployment': deploymentName
        });
    }
    
    return true;
}

// Example usage:
// setupAzureOpenAI('your-api-key', 'https://your-endpoint.azure.com/', 'gpt-4');

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupAzureOpenAI,
        AI_CONFIG: window.AI_CONFIG
    };
}
