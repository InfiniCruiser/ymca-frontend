/**
 * AI Configuration Manager for YMCA Management Hub
 * Handles Azure OpenAI configuration and environment variables
 */

class AIConfigManager {
    constructor() {
        this.config = null;
        this.init();
    }
    
    async init() {
        this.config = await this.loadConfiguration();
        this.validateConfiguration();
    }
    
    async loadConfiguration() {
        // Try to load from secure API first
        let config = null;
        let useSecureAPI = false;
        
        try {
            const response = await fetch('/api/ai-config');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    config = data.config;
                    useSecureAPI = true;
                    console.log('✅ Loaded AI configuration from secure API');
                }
            }
        } catch (error) {
            console.warn('⚠️ Could not load configuration from API, using fallback');
        }
        
        // Fallback to environment variables or defaults
        if (!config) {
            config = {
                azureOpenAI: {
                    apiKey: null, // Will be loaded from backend
                    endpoint: 'https://taalk-ai.openai.azure.com',
                    deployment: 'Prod4',
                    apiVersion: '2024-02-15-preview',
                    model: 'gpt-4'
                },
                features: {
                    enableAI: this.getEnvVar('ENABLE_AI_ADVISORS', 'true') === 'true',
                    enableFallback: this.getEnvVar('ENABLE_FALLBACK_ANALYSIS', 'true') === 'true',
                    maxTokens: parseInt(this.getEnvVar('MAX_TOKENS', '2000')),
                    temperature: parseFloat(this.getEnvVar('TEMPERATURE', '0.3')),
                    cacheEnabled: this.getEnvVar('ENABLE_AI_CACHING', 'true') === 'true'
                },
                monitoring: {
                    enableLogging: this.getEnvVar('ENABLE_AI_LOGGING', 'true') === 'true',
                    enableMetrics: this.getEnvVar('ENABLE_AI_METRICS', 'true') === 'true',
                    logLevel: this.getEnvVar('AI_LOG_LEVEL', 'info')
                }
            };
        }
        
        // Add secure API flag
        config.useSecureAPI = useSecureAPI;
        
        return config;
    }
    
    getEnvVar(key, defaultValue = null) {
        // Try to get from environment variables
        if (typeof process !== 'undefined' && process.env) {
            return process.env[key] || defaultValue;
        }
        
        // Try to get from window object (browser)
        if (typeof window !== 'undefined' && window.AI_CONFIG) {
            return window.AI_CONFIG[key] || defaultValue;
        }
        
        // Try to get from localStorage (browser)
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                const stored = localStorage.getItem(`AI_CONFIG_${key}`);
                return stored || defaultValue;
            } catch (error) {
                console.warn('Could not read from localStorage:', error);
                return defaultValue;
            }
        }
        
        return defaultValue;
    }
    
    validateConfiguration() {
        // Safety check - ensure config is loaded before validation
        if (!this.config) {
            console.error('❌ Cannot validate configuration: config not loaded yet');
            return;
        }
        
        const { azureOpenAI, features, useSecureAPI } = this.config;
        
        // Safety check - ensure azureOpenAI exists
        if (!azureOpenAI) {
            console.error('❌ Cannot validate configuration: azureOpenAI config missing');
            return;
        }
        
        if (features.enableAI) {
            if (useSecureAPI) {
                // Using secure API - no need for frontend API key
                console.log('✅ Using secure API endpoint for AI calls');
            } else if (!azureOpenAI.apiKey) {
                console.warn('⚠️ Azure OpenAI API key not provided. AI advisors will use fallback mode.');
                this.config.features.enableAI = false;
            }
            
            if (!azureOpenAI.endpoint) {
                console.warn('⚠️ Azure OpenAI endpoint not provided. AI advisors will use fallback mode.');
                this.config.features.enableAI = false;
            }
            
            if (!azureOpenAI.deployment) {
                console.warn('⚠️ Azure OpenAI deployment name not provided. Using default: gpt-4');
            }
        }
        
        // Validate numeric values
        if (features.maxTokens < 100 || features.maxTokens > 8000) {
            console.warn('⚠️ Invalid max tokens. Using default: 2000');
            this.config.features.maxTokens = 2000;
        }
        
        if (features.temperature < 0 || features.temperature > 2) {
            console.warn('⚠️ Invalid temperature. Using default: 0.3');
            this.config.features.temperature = 0.3;
        }
    }
    
    getAzureOpenAIConfig() {
        return this.config?.azureOpenAI || null;
    }
    
    getFeatureConfig() {
        return this.config?.features || null;
    }
    
    getMonitoringConfig() {
        return this.config?.monitoring || null;
    }
    
    isAIEnabled() {
        return this.config?.features?.enableAI || false;
    }
    
    isFallbackEnabled() {
        return this.config?.features?.enableFallback || false;
    }
    
    isUsingSecureAPI() {
        return this.config?.useSecureAPI === true;
    }
    
    getStatus() {
        return {
            hasConfig: !!this.config,
            isAIEnabled: this.isAIEnabled(),
            useSecureAPI: this.isUsingSecureAPI(),
            hasAzureConfig: !!this.config?.azureOpenAI,
            azureConfig: this.config?.azureOpenAI ? {
                hasEndpoint: !!this.config.azureOpenAI.endpoint,
                hasDeployment: !!this.config.azureOpenAI.deployment,
                hasApiKey: !!this.config.azureOpenAI.apiKey
            } : null
        };
    }
    
    // Update configuration at runtime
    updateConfig(key, value) {
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        console.log(`✅ Updated config: ${key} = ${value}`);
    }
    
    // Get configuration summary for debugging
    getConfigSummary() {
        return {
            aiEnabled: this.isAIEnabled(),
            fallbackEnabled: this.isFallbackEnabled(),
            hasApiKey: this.config?.azureOpenAI?.apiKey ? true : false,
            hasEndpoint: this.config?.azureOpenAI?.endpoint ? true : false,
            deployment: this.config?.azureOpenAI?.deployment || 'Not configured',
            model: this.config?.azureOpenAI?.model || 'Not configured',
            maxTokens: this.config?.features?.maxTokens || 2000,
            temperature: this.config?.features?.temperature || 0.3,
            useSecureAPI: this.isUsingSecureAPI()
        };
    }
    
    // Export configuration for external use
    exportConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }
}

// Browser configuration helper
if (typeof window !== 'undefined') {
    // Allow setting config via window object
    window.AI_CONFIG = window.AI_CONFIG || {};
    
    // Helper function to set config from browser
    window.setAIConfig = function(key, value) {
        window.AI_CONFIG[key] = value;
        console.log(`✅ Set AI config: ${key} = ${value}`);
    };
    
    // Helper function to get config from browser
    window.getAIConfig = function(key) {
        return window.AI_CONFIG[key];
    };
    
    // Example usage:
    // window.setAIConfig('AZURE_OPENAI_API_KEY', 'your-api-key-here');
    // window.setAIConfig('AZURE_OPENAI_ENDPOINT', 'https://your-resource.openai.azure.com/');
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AIConfigManager = AIConfigManager;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIConfigManager;
}
