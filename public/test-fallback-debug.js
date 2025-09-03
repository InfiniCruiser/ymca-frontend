// AI Fallback Mode Debug Script
// Run this in the browser console to test fallback mode

console.log('🧪 AI Fallback Mode Debug Script Loaded');

// Test function to check fallback mode
function testFallbackMode() {
    console.log('🔍 Testing Fallback Mode...');
    
    // Check if AI Advisory Integration exists
    if (window.AIAdvisoryIntegration) {
        console.log('✅ AI Advisory Integration found');
        
        // Create a new instance in fallback mode
        const aiIntegration = new window.AIAdvisoryIntegration();
        aiIntegration.initializeFallbackMode();
        
        // Check advisor manager
        if (aiIntegration.advisorManager) {
            console.log('✅ Advisor Manager created');
            console.log('Fallback mode:', aiIntegration.advisorManager.fallbackMode);
            console.log('Provider:', aiIntegration.advisorManager.provider);
            
            // Test advisor creation
            const advisors = aiIntegration.advisorManager.registry.getAllAdvisors();
            console.log('Available advisors:', advisors);
            
            // Test a specific advisor
            if (advisors.length > 0) {
                const advisorId = advisors[0];
                const advisor = aiIntegration.advisorManager.registry.getAdvisor(advisorId, aiIntegration.advisorManager.provider);
                console.log(`✅ Created advisor: ${advisorId}`);
                console.log('Advisor provider:', advisor.provider);
                console.log('Advisor name:', advisor.name);
                
                // Test fallback analysis
                const testData = {
                    id: 'test-ymca',
                    name: 'Test YMCA',
                    totalPoints: 45,
                    maxPoints: 80,
                    percentage: 56.25
                };
                
                console.log('🔘 Testing advisor analysis...');
                advisor.analyze(testData).then(result => {
                    console.log('✅ Advisor analysis result:', result);
                    console.log('Source:', result.source);
                    console.log('Executive Summary:', result.executiveSummary);
                }).catch(error => {
                    console.error('❌ Advisor analysis failed:', error);
                });
            }
        } else {
            console.log('❌ Advisor Manager not created');
        }
        
        // Check AI Advisory UI
        if (aiIntegration.aiAdvisoryUI) {
            console.log('✅ AI Advisory UI created');
        } else {
            console.log('❌ AI Advisory UI not created');
        }
        
    } else {
        console.log('❌ AI Advisory Integration not found');
    }
}

// Test function to check script loading
function checkScriptLoading() {
    console.log('🔍 Checking Script Loading...');
    
    const scripts = document.querySelectorAll('script[src*="ai-framework"]');
    console.log(`Found ${scripts.length} AI framework scripts`);
    
    scripts.forEach((script, index) => {
        console.log(`Script ${index + 1}:`, script.src);
    });
    
    // Check global objects
    const globalObjects = [
        'AIProviderInterface',
        'AIConfigManager',
        'AIAdvisoryUI',
        'AIAdvisoryIntegration',
        'APIService',
        'AdvisorManager',
        'AzureOpenAIProvider',
        'BaseAdvisor'
    ];
    
    globalObjects.forEach(objName => {
        if (window[objName]) {
            console.log(`✅ ${objName} is available`);
        } else {
            console.log(`❌ ${objName} is NOT available`);
        }
    });
}

// Test function to force cache refresh
function forceCacheRefresh() {
    console.log('🔄 Forcing cache refresh...');
    
    // Remove existing scripts
    const scripts = document.querySelectorAll('script[src*="ai-framework"]');
    scripts.forEach(script => script.remove());
    
    // Clear global objects
    const globalObjects = [
        'AIProviderInterface',
        'AIConfigManager',
        'AIAdvisoryUI',
        'AIAdvisoryIntegration',
        'APIService',
        'AdvisorManager',
        'AzureOpenAIProvider',
        'BaseAdvisor',
        'aiFrameworkLoading',
        'aiFrameworkLoaded'
    ];
    
    globalObjects.forEach(objName => {
        delete window[objName];
    });
    
    console.log('✅ Cache cleared, reload the page to test fresh scripts');
}

// Export functions to global scope
window.testFallbackMode = testFallbackMode;
window.checkScriptLoading = checkScriptLoading;
window.forceCacheRefresh = forceCacheRefresh;

console.log('✅ AI Fallback Mode Debug Script Ready');
console.log('Available functions:');
console.log('- testFallbackMode()');
console.log('- checkScriptLoading()');
console.log('- forceCacheRefresh()');
