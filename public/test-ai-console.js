// AI Analysis Console Test Script
// Run this in the browser console to test the AI analysis functionality

console.log('🧪 AI Analysis Console Test Script Loaded');

// Test function to check if AI advisory integration is available
function testAIIntegration() {
    console.log('🔍 Testing AI Integration...');
    
    // Check if AI advisory integration exists
    if (window.aiAdvisoryIntegration) {
        console.log('✅ AI Advisory Integration found');
        console.log('Status:', window.aiAdvisoryIntegration.getStatus());
        return true;
    } else {
        console.log('❌ AI Advisory Integration not found');
        return false;
    }
}

// Test function to manually trigger AI analysis
async function testAIAnalysis() {
    console.log('🧪 Testing AI Analysis...');
    
    try {
        const response = await fetch('/api/ai-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: {
                    system: 'You are a YMCA performance analyst. Provide a brief analysis.',
                    user: 'Analyze this YMCA performance: Total Score: 75/80 (93.75%). What are the key strengths and areas for improvement?'
                },
                context: {
                    ymcaName: 'Test YMCA',
                    totalScore: 75,
                    maxScore: 80
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ AI analysis successful');
            console.log('Response:', data.content);
            return data.content;
        } else {
            throw new Error(data.error || 'AI analysis failed');
        }
    } catch (error) {
        console.error('❌ AI analysis test failed:', error);
        throw error;
    }
}

// Test function to check event listeners
function testEventListeners() {
    console.log('🔍 Testing Event Listeners...');
    
    const generateBtn = document.querySelector('#generate-analysis-btn');
    const refreshBtn = document.querySelector('#refresh-analysis-btn');
    
    if (generateBtn) {
        console.log('✅ Generate button found');
        
        // Check if it has event listeners
        const listeners = getEventListeners(generateBtn);
        console.log('Generate button event listeners:', listeners);
        
        // Test click
        console.log('🔘 Simulating generate button click...');
        generateBtn.click();
        
    } else {
        console.log('❌ Generate button not found');
    }
    
    if (refreshBtn) {
        console.log('✅ Refresh button found');
        
        // Check if it has event listeners
        const listeners = getEventListeners(refreshBtn);
        console.log('Refresh button event listeners:', listeners);
        
    } else {
        console.log('❌ Refresh button not found');
    }
}

// Helper function to get event listeners (if available)
function getEventListeners(element) {
    if (window.getEventListeners) {
        return window.getEventListeners(element);
    } else {
        return 'getEventListeners not available (Chrome DevTools only)';
    }
}

// Test function to force AI advisory integration
async function forceAIIntegration() {
    console.log('🔄 Forcing AI Advisory Integration...');
    
    if (window.aiAdvisoryIntegration) {
        window.aiAdvisoryIntegration.forceIntegration();
        window.aiAdvisoryIntegration.forceUIInjection();
        return true;
    } else {
        console.log('❌ AI Advisory Integration not available');
        return false;
    }
}

// Test function to check AI status
async function testAIStatus() {
    console.log('🔍 Testing AI Status...');
    
    try {
        const response = await fetch('/api/ai-status');
        const data = await response.json();
        
        console.log('AI Status:', data);
        return data;
    } catch (error) {
        console.error('❌ Failed to get AI status:', error);
        throw error;
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Running All AI Tests...');
    
    try {
        // Test 1: Check AI integration
        const integrationOk = testAIIntegration();
        
        // Test 2: Check AI status
        const status = await testAIStatus();
        
        // Test 3: Test AI analysis
        const analysis = await testAIAnalysis();
        
        // Test 4: Check event listeners
        testEventListeners();
        
        // Test 5: Force integration if needed
        if (!integrationOk) {
            await forceAIIntegration();
        }
        
        console.log('✅ All tests completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export functions to global scope
window.testAIIntegration = testAIIntegration;
window.testAIAnalysis = testAIAnalysis;
window.testEventListeners = testEventListeners;
window.forceAIIntegration = forceAIIntegration;
window.testAIStatus = testAIStatus;
window.runAllTests = runAllTests;

console.log('✅ AI Analysis Console Test Script Ready');
console.log('Available functions:');
console.log('- testAIIntegration()');
console.log('- testAIAnalysis()');
console.log('- testEventListeners()');
console.log('- forceAIIntegration()');
console.log('- testAIStatus()');
console.log('- runAllTests()');
