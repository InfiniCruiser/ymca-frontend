// AI Framework Initialization Script
// This script initializes the AI framework components when the analytics page loads

window.initializeAIFramework = function() {
  console.log('🚀 Initializing AI Framework...');
  
  // Initialize the overview functionality
  if (typeof window.initializeOverview === 'function') {
    window.initializeOverview();
  }
  
  // Initialize the AI advisory UI
  if (typeof window.AIAdvisoryUI !== 'undefined') {
    new window.AIAdvisoryUI();
  }
  
  // Initialize the API service
  if (typeof window.APIService !== 'undefined') {
    window.apiService = new window.APIService();
  }
  
  console.log('✅ AI Framework initialized successfully');
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.initializeAIFramework);
} else {
  window.initializeAIFramework();
}
