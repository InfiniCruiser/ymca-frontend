/**
 * AI Advisory Integration for YMCA Management Hub
 * Main entry point that connects all AI advisory components
 */

console.log('🚀 AI Advisory Integration script loaded and executing!');

class AIAdvisoryIntegration {
    constructor() {
        console.log('🏗️ AI Advisory Integration constructor called');
        this.configManager = null;
        this.advisorManager = null;
        this.aiAdvisoryUI = null;
        this.isInitialized = false;
        this.retryAttempted = false;
        console.log('🏗️ Constructor completed, will initialize later...');
        // Don't call init() here - it will be called externally
    }
    
    async init() {
        console.log('🚀 AI Advisory Integration init() called');
        try {
            console.log('🚀 Initializing AI Advisory Framework...');
            
            // Initialize configuration manager
            this.configManager = new AIConfigManager();
            
            // Wait for configuration to load
            await this.configManager.init();
            
            // Check if AI is enabled
            if (!this.configManager.isAIEnabled()) {
                throw new Error('🚫 AI is REQUIRED but disabled. Cannot proceed without Azure OpenAI.');
            }
            
            // Initialize Azure OpenAI provider
            const azureConfig = this.configManager.getAzureOpenAIConfig();
            console.log('✅ Azure OpenAI configuration loaded:', {
                hasApiKey: !!azureConfig.apiKey,
                hasEndpoint: !!azureConfig.endpoint,
                deployment: azureConfig.deployment,
                model: azureConfig.model
            });
            
            // Initialize advisor manager with full config
            this.advisorManager = new AdvisorManager({
                azureOpenAI: azureConfig,
                useSecureAPI: this.configManager.isUsingSecureAPI()
            });
            
            // Wait for advisor manager to initialize
            await this.advisorManager.init();
            
            // Initialize UI
            this.aiAdvisoryUI = new AIAdvisoryUI(this.advisorManager);
            
            // Setup dashboard integration
            this.setupDashboardIntegration();
            
            this.isInitialized = true;
            console.log('✅ AI Advisory Framework initialized successfully');
            
            // Show configuration status
            this.showConfigurationStatus();
            
        } catch (error) {
            console.error('❌ Failed to initialize AI Advisory Framework:', error);
            console.error('Error message:', error.message);
            console.error('Error name:', error.name);
            console.error('Error stack:', error.stack);
            if (this.configManager) {
                console.error('Config status:', this.configManager.getStatus());
            }
            
            // NO FALLBACK MODE - FAIL FAST AND SHOW ERROR
            console.error('🚫 INITIALIZATION FAILED - NO FALLBACK MODE ALLOWED');
            throw error; // Re-throw to prevent system from starting
        }
    }
    
    initializeFallbackMode() {
        console.log('🔄 Initializing fallback mode...');
        
        // Create advisor manager with no AI provider (fallback only)
        this.advisorManager = new AdvisorManager({});
        
        // Initialize UI
        this.aiAdvisoryUI = new AIAdvisoryUI(this.advisorManager);
        
        // Setup dashboard integration
        this.setupDashboardIntegration();
        
        this.isInitialized = true;
        console.log('✅ Fallback mode initialized');
        
        // Show fallback status
        this.showFallbackStatus();
    }
    
    setupDashboardIntegration() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.integrateWithDashboard();
            });
        } else {
            this.integrateWithDashboard();
        }
        
        // Also listen for dynamic content changes
        this.observeDashboardChanges();
    }
    
    integrateWithDashboard() {
        console.log('🔗 Integrating AI Advisory with dashboard...');
        
        // Wait for DOM to be fully ready and dashboard to be populated
        this.waitForDashboardReady();
    }
    
    waitForDashboardReady() {
        const maxAttempts = 10;
        let attempts = 0;
        
        const checkDashboard = () => {
            attempts++;
            
            
            const dashboard = document.querySelector('main.dashboard');
            const hasContent = dashboard && dashboard.children.length > 0;
            
            if (hasContent) {
                console.log('✅ Dashboard ready, injecting AI Advisory sections...');
                this.injectAdvisorySections();
                this.setupDashboardEventListeners();
                
                if (this.aiAdvisoryUI) {
                    this.aiAdvisoryUI.injectAdvisoryUI();
                }
                
                console.log('✅ Dashboard integration completed');
            } else if (attempts < maxAttempts) {

                setTimeout(checkDashboard, 500);
            } else {
                console.log('⚠️ Dashboard not ready after max attempts, will retry later');
                // Don't use fallback injection - let normal injection handle it
            }
        };
        
        // Start checking
        setTimeout(checkDashboard, 500);
    }
    
    injectAdvisorySections() {
        console.log('🔧 Starting AI Advisory section injection...');
        
        // Inject into Detail view if it exists
        const detailInjected = this.injectIntoDetailView();
        
        // Inject into Overview if it exists
        const overviewInjected = this.injectIntoOverview();
        
        // Inject into any other views that might exist
        this.injectIntoOtherViews();
        
        // Check if any sections were injected
        const totalSections = document.querySelectorAll('.ai-advisory-section').length;
        console.log(`📊 Injection summary: Detail=${detailInjected}, Overview=${overviewInjected}, Total=${totalSections}`);
        
        if (totalSections === 0) {
            console.log('⚠️ No sections injected, will retry once...');
            if (!this.retryAttempted) {
                this.retryAttempted = true;
                setTimeout(() => this.injectAdvisorySections(), 1000);
            } else {
                console.log('⚠️ Injection retry limit reached, will retry later');
                // Don't use fallback injection - let normal injection handle it
            }
        } else {
            console.log('✅ AI Advisory sections successfully injected');
        }
    }
    
    injectIntoDetailView() {
        console.log('🔧 Injecting AI Advisory into Detail view...');
        
        // Look for the dedicated AI Advisory section
        const aiAdvisorySection = document.querySelector('#ai-advisory-section');
        if (!aiAdvisorySection) {
            console.log('📍 AI Advisory section container not found');
            return false;
        }
        
        // Check if AI Advisory content already exists
        const existingContent = aiAdvisorySection.querySelector('.ai-advisory-content');
        if (existingContent) {
            console.log('✅ AI Advisory content already exists in Detail view');
            return true;
        }
        
        // Inject the AI Advisory content into the dedicated section
        aiAdvisorySection.innerHTML = this.getAIAdvisorySection();
        
        // Setup event listeners for this section
        this.setupDetailViewEventListeners(aiAdvisorySection);
        
        console.log('✅ AI Advisory content injected into Detail view');
        return true;
    }
    
    injectIntoOverview() {
        // Look for overview page containers
        const overviewMain = document.querySelector('.overview-main') ||
                            document.querySelector('main.overview-main') ||
                            document.querySelector('.overview-container') ||
                            document.querySelector('.main-content');
        
        if (!overviewMain) {
            console.log('📍 Overview container not found (this is normal for main dashboard)');
            return;
        }
        
        // Check if already injected
        if (overviewMain.querySelector('.ai-advisory-section')) {
            console.log('📍 AI Advisory already injected in Overview');
            return;
        }
        
        console.log('📍 Injecting AI Advisory into Overview...', overviewMain.className);
        
        // Create and inject advisory section
        const advisorySection = this.createOverviewAdvisorySection();
        overviewMain.appendChild(advisorySection);
        
        // Setup event listeners for this section
        this.setupOverviewEventListeners(advisorySection);
        
        console.log('✅ AI Advisory section injected into Overview');
    }
    
    injectIntoOtherViews() {
        // Look for other potential view containers
        const viewContainers = document.querySelectorAll('[class*="view"], [class*="dashboard"], [class*="main"]');
        
        viewContainers.forEach(container => {
            if (container.classList.contains('detail-view') || 
                container.classList.contains('overview-main') ||
                container.querySelector('.ai-advisory-section')) {
                return; // Skip already handled containers
            }
            
            // Check if this looks like a main content area
            if (container.children.length > 3 && container.offsetHeight > 200) {
                console.log('📍 Found potential view container:', container.className);
                // Could inject advisory section here if needed
            }
        });
    }
    
    getAIAdvisorySection() {
        return `
            <div class="ai-advisory-content">
                <div class="advisory-header">
                    <h3>AI Advisory Insights</h3>
                    <div class="advisory-controls">
                        <button class="btn btn-primary" id="generate-analysis-btn">
                            Generate AI Analysis
                        </button>
                    </div>
                </div>
                <div class="advisory-body">
                    <p class="advisory-prompt">
                        Click 'Generate AI Analysis' to get intelligent insights and recommendations for this YMCA.
                    </p>
                    <div id="ai-analysis-results" class="ai-analysis-results" style="display: none;">
                        <!-- AI analysis results will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    createDetailAdvisorySection() {
        const section = document.createElement('section');
        section.className = 'ai-advisory-section detail-advisory';
        section.innerHTML = `
            <div class="advisory-header">
                <h3>AI Advisory Insights</h3>
                <div class="advisory-controls">
                    <button class="btn btn-primary" id="generate-analysis-btn">
                        <span class="btn-text">Generate AI Analysis</span>
                        <span class="btn-loading" style="display: none;">
                            <i class="spinner"></i> Analyzing...
                        </span>
                    </button>
                    <button class="btn btn-secondary" id="refresh-analysis-btn" style="display: none;">
                        <i class="refresh-icon">🔄</i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="advisory-content" id="advisory-content">
                <div class="advisory-placeholder">
                    <p>Click "Generate AI Analysis" to get intelligent insights and recommendations for this YMCA.</p>
                </div>
            </div>
            
            <div class="advisory-status" id="advisory-status"></div>
        `;
        
        return section;
    }
    
    createOverviewAdvisorySection() {
        const section = document.createElement('section');
        section.className = 'ai-advisory-section overview-advisory';
        section.innerHTML = `
            <div class="advisory-header">
                <h3>Network-Wide AI Insights</h3>
                <div class="advisory-controls">
                    <button class="btn btn-primary" id="generate-network-analysis-btn">
                        <span class="btn-text">Generate Network Analysis</span>
                        <span class="btn-loading" style="display: none;">
                            <i class="spinner"></i> Analyzing Network...
                        </span>
                    </button>
                </div>
            </div>
            
            <div class="advisory-content" id="overview-advisory-content">
                <div class="advisory-placeholder">
                    <p>Get AI-powered insights across all YMCAs in the network.</p>
                </div>
            </div>
        `;
        
        return section;
    }
    
    setupDetailViewEventListeners(section) {
        const generateBtn = section.querySelector('#generate-analysis-btn');
        const refreshBtn = section.querySelector('#refresh-analysis-btn');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDetailAnalysis());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDetailAnalysis());
        }
    }
    
    setupOverviewEventListeners(section) {
        const generateBtn = section.querySelector('#generate-network-analysis-btn');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateNetworkAnalysis());
        }
    }
    
    setupDashboardEventListeners() {
        // Listen for YMCA selection changes
        document.addEventListener('ymcaSelected', (event) => {
            this.onYMCAChange(event.detail);
        });
        
        // Listen for performance data updates
        document.addEventListener('performanceDataUpdated', (event) => {
            this.onPerformanceDataUpdate(event.detail);
        });
        
        // Listen for view changes
        document.addEventListener('viewChanged', (event) => {
            this.onViewChange(event.detail);
        });
        
        // Listen for data loading
        document.addEventListener('dataLoaded', (event) => {
            this.onDataLoaded(event.detail);
        });
    }
    
    observeDashboardChanges() {
        // Use MutationObserver to watch for dynamic content changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkForNewViews(node);
                        }
                    });
                }
            });
        });
        
        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👀 Dashboard change observer started');
    }
    
    checkForNewViews(node) {
        // Check if this is a new view that needs AI Advisory integration
        if (node.classList && (
            node.classList.contains('detail-view') ||
            node.classList.contains('overview-main') ||
            node.classList.contains('dashboard-view')
        )) {
            console.log('🆕 New view detected:', node.className);
            setTimeout(() => {
                this.integrateWithDashboard();
            }, 100);
        }
        
        // Check children as well
        if (node.querySelectorAll) {
            const viewContainers = node.querySelectorAll('.detail-view, .overview-main, .dashboard-view');
            viewContainers.forEach(container => {
                if (!container.querySelector('.ai-advisory-section')) {
                    console.log('🆕 New view container detected in child:', container.className);
                    setTimeout(() => {
                        this.injectAdvisorySections();
                    }, 100);
                }
            });
        }
    }
    
    // Event handlers
    async generateDetailAnalysis() {
        if (!this.advisorManager) {
            this.showError('AI Advisory system not initialized');
            return;
        }
        
        const currentYMCA = this.getCurrentYMCA();
        if (!currentYMCA) {
            this.showError('No YMCA selected. Please select a YMCA first.');
            return;
        }
        
        try {
            // Show loading modal
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.showLoadingModal();
            }
            
            this.showStatus('Generating AI analysis...', 'info');
            
            const analysis = await this.advisorManager.generateComprehensiveAnalysis(currentYMCA);
            
            // 🔍 DEBUG: Log the analysis object
            console.log('🎯 ANALYSIS OBJECT RECEIVED:', analysis);
            console.log('🎯 Analysis type:', typeof analysis);
            console.log('🎯 Analysis keys:', Object.keys(analysis));
            console.log('🎯 Analysis structure:', JSON.stringify(analysis, null, 2));
            
            this.renderDetailAnalysis(analysis);
            
            this.showStatus('Analysis completed successfully', 'success');
            
            // Hide loading modal
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.hideLoadingModal();
            }
            
        } catch (error) {
            console.error('Error generating analysis:', error);
            this.showError('Failed to generate AI analysis. Please try again.');
            
            // Hide loading modal on error
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.hideLoadingModal();
            }
        }
    }
    
    async generateNetworkAnalysis() {
        if (!this.advisorManager) {
            this.showError('AI Advisory system not initialized');
            return;
        }
        
        try {
            // Show loading modal
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.showLoadingModal();
            }
            
            this.showStatus('Generating network analysis...', 'info');
            
            const networkData = this.getNetworkData();
            if (!networkData || !networkData.organizations) {
                throw new Error('No network data available');
            }
            
            const networkAnalysis = await this.generateNetworkInsights(networkData.organizations);
            this.renderNetworkAnalysis(networkAnalysis);
            
            this.showStatus('Network analysis completed', 'success');
            
            // Hide loading modal
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.hideLoadingModal();
            }
            
        } catch (error) {
            console.error('Error generating network analysis:', error);
            this.showError('Failed to generate network analysis. Please try again.');
            
            // Hide loading modal on error
            if (this.aiAdvisoryUI) {
                this.aiAdvisoryUI.hideLoadingModal();
            }
        }
    }
    
    async refreshDetailAnalysis() {
        // Clear any cached analysis and regenerate
        if (this.aiAdvisoryUI && this.aiAdvisoryUI.currentAnalysis) {
            const cacheKey = `ymca_${this.aiAdvisoryUI.currentAnalysis.ymcaId}`;
            this.aiAdvisoryUI.analysisCache.delete(cacheKey);
        }
        
        await this.generateDetailAnalysis();
    }
    
    onYMCAChange(ymcaData) {
        console.log('🔄 YMCA changed:', ymcaData?.name);
        
        // Clear current analysis
        if (this.aiAdvisoryUI) {
            this.aiAdvisoryUI.onYMCAChange(ymcaData);
        }
        
        // Update advisory content
        this.updateAdvisoryContent(ymcaData);
    }
    
    onPerformanceDataUpdate(performanceData) {
        console.log('🔄 Performance data updated');
        
        // Clear analysis cache
        if (this.aiAdvisoryUI) {
            this.aiAdvisoryUI.onPerformanceDataUpdate(performanceData);
        }
    }
    
    onViewChange(viewData) {
        console.log('🔄 View changed:', viewData?.view);
        
        // Inject advisory sections if needed
        setTimeout(() => {
            this.injectAdvisorySections();
        }, 200);
    }
    
    onDataLoaded(data) {
        console.log('🔄 Data loaded:', data?.type);
        
        // Check if we need to inject advisory sections
        setTimeout(() => {
            this.injectAdvisorySections();
        }, 100);
    }
    
    // Utility methods
    getCurrentYMCA() {
        // Try to get from the current YMCA selection
        if (window.currentData?.organization) {
            return window.currentData.organization;
        }
        
        // Try to get from the dropdown
        const dropdown = document.getElementById('ymca-select');
        if (dropdown && dropdown.value) {
            return { 
                id: dropdown.value, 
                name: dropdown.options[dropdown.selectedIndex].text 
            };
        }
        
        return null;
    }
    
    getNetworkData() {
        // Try to get from the overview data
        if (window.ymcaData && window.ymcaData.organizations) {
            return { organizations: window.ymcaData.organizations };
        }
        
        return null;
    }
    
    async generateNetworkInsights(organizations) {
        // Generate network-wide insights
        const insights = {
            timestamp: new Date().toISOString(),
            totalYMCAs: organizations.length,
            performanceDistribution: this.calculatePerformanceDistribution(organizations),
            topPerformers: this.identifyTopPerformers(organizations),
            improvementOpportunities: this.identifyImprovementOpportunities(organizations),
            crossCuttingThemes: this.identifyCrossCuttingThemes(organizations),
            recommendations: this.generateNetworkRecommendations(organizations)
        };
        
        return insights;
    }
    
    calculatePerformanceDistribution(organizations) {
        const distribution = { high: 0, moderate: 0, low: 0 };
        
        organizations.forEach(org => {
            const score = org.totalPoints || 0;
            const maxScore = org.maxPoints || 80;
            const percentage = (score / maxScore) * 100;
            
            if (percentage >= 70) distribution.high++;
            else if (percentage >= 40) distribution.moderate++;
            else distribution.low++;
        });
        
        return distribution;
    }
    
    identifyTopPerformers(organizations) {
        return organizations
            .filter(org => org.totalPoints && org.maxPoints)
            .sort((a, b) => (b.totalPoints / b.maxPoints) - (a.totalPoints / a.maxPoints))
            .slice(0, 5)
            .map(org => ({
                name: org.name,
                score: org.totalPoints,
                maxScore: org.maxPoints,
                percentage: Math.round((org.totalPoints / org.maxPoints) * 100)
            }));
    }
    
    identifyImprovementOpportunities(organizations) {
        return organizations
            .filter(org => org.totalPoints && org.maxPoints)
            .filter(org => (org.totalPoints / org.maxPoints) < 0.5)
            .slice(0, 5)
            .map(org => ({
                name: org.name,
                score: org.totalPoints,
                maxScore: org.maxPoints,
                percentage: Math.round((org.totalPoints / org.maxPoints) * 100),
                improvementNeeded: Math.round(((org.maxPoints - org.totalPoints) / org.maxPoints) * 100)
            }));
    }
    
    identifyCrossCuttingThemes(organizations) {
        // Analyze common patterns across organizations
        const themes = [
            { theme: 'Financial Management', frequency: 0, priority: 'Medium' },
            { theme: 'Staff Development', frequency: 0, priority: 'Medium' },
            { theme: 'Program Quality', frequency: 0, priority: 'Medium' },
            { theme: 'Community Engagement', frequency: 0, priority: 'Medium' }
        ];
        
        // This would be enhanced with actual AI analysis
        return themes;
    }
    
    generateNetworkRecommendations(organizations) {
        return {
            immediate: [
                'Review performance distribution across network',
                'Identify best practices from top performers',
                'Develop support strategies for struggling YMCAs'
            ],
            shortTerm: [
                'Create peer learning opportunities',
                'Establish mentorship programs',
                'Develop standardized improvement frameworks'
            ],
            longTerm: [
                'Build sustainable improvement culture',
                'Establish network-wide performance standards',
                'Create continuous learning systems'
            ]
        };
    }
    
    renderDetailAnalysis(analysis) {
        console.log('🎯 Rendering detail analysis:', analysis);
        console.log('🎯 Analysis object type:', typeof analysis);
        console.log('🎯 Analysis object keys:', Object.keys(analysis));
        console.log('🎯 Analysis object structure:', JSON.stringify(analysis, null, 2));
        
        // Try to find the AI advisory section
        const aiSection = document.getElementById('ai-advisory-section');
        if (!aiSection) {
            console.error('❌ AI advisory section not found');
            return;
        }
        
        if (this.aiAdvisoryUI) {
            console.log('✅ Using AI Advisory UI to render analysis');
            this.aiAdvisoryUI.renderAnalysis(analysis);
        } else {
            console.log('⚠️ AI Advisory UI not available, using fallback rendering');
            // Fallback rendering directly in the section
            aiSection.innerHTML = this.buildAnalysisHTML(analysis);
        }
        
        // Show refresh button if it exists
        const refreshBtn = document.getElementById('refresh-analysis-btn');
        if (refreshBtn) refreshBtn.style.display = 'inline-block';
    }
    
    renderNetworkAnalysis(analysis) {
        const content = document.getElementById('overview-advisory-content');
        if (!content) return;
        
        if (this.aiAdvisoryUI) {
            this.aiAdvisoryUI.renderNetworkAnalysis(analysis);
        } else {
            // Fallback rendering
            content.innerHTML = this.buildNetworkAnalysisHTML(analysis);
        }
    }
    
    buildAnalysisHTML(analysis) {
        // Simplified HTML building for fallback
        const { overallAssessment, advisorInsights, crossCuttingRecommendations, actionPlan } = analysis;
        
        return `
            <div class="analysis-overview">
                <h4>Overall Assessment</h4>
                <p>Performance Level: ${overallAssessment.performanceLevel}</p>
                <p>Support Needed: ${overallAssessment.supportNeeded}</p>
                <p>Score: ${overallAssessment.score}/${overallAssessment.maxScore} (${overallAssessment.percentage}%)</p>
            </div>
            <div class="advisor-insights">
                <h4>Advisor Insights</h4>
                <p>Analysis completed successfully with ${Object.keys(advisorInsights).length} advisors.</p>
            </div>
        `;
    }
    
    buildNetworkAnalysisHTML(analysis) {
        // Simplified HTML building for fallback
        return `
            <div class="network-analysis">
                <h4>Network Analysis</h4>
                <p>Total YMCAs: ${analysis.totalYMCAs}</p>
                <p>Analysis completed successfully.</p>
            </div>
        `;
    }
    
    updateAdvisoryContent(ymcaData) {
        const aiSection = document.getElementById('ai-advisory-section');
        if (!aiSection) return;
        
        aiSection.innerHTML = `
            <div class="ai-advisory-content">
                <div class="advisory-header">
                    <h3>🤖 AI Advisory Insights</h3>
                    <div class="advisory-controls">
                        <button class="btn btn-primary" id="generate-analysis-btn">
                            Generate AI Analysis
                        </button>
                    </div>
                </div>
                <div class="advisory-body">
                    <p class="advisory-prompt">
                        Click 'Generate AI Analysis' to get intelligent insights and recommendations for ${ymcaData?.name || 'this YMCA'}.
                    </p>
                    <div id="ai-analysis-results" class="ai-analysis-results" style="display: none;">
                        <!-- AI analysis results will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        // Setup event listeners for the new button
        const generateBtn = document.getElementById('generate-analysis-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateDetailAnalysis());
        }
        
        // Hide refresh button if it exists
        const refreshBtn = document.getElementById('refresh-analysis-btn');
        if (refreshBtn) refreshBtn.style.display = 'none';
    }
    
    showStatus(message, type = 'info') {
        const status = document.getElementById('advisory-status');
        if (!status) return;
        
        status.innerHTML = `<div class="status-message ${type}">${message}</div>`;
        status.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            status.style.display = 'none';
        }, 5000);
    }
    
    showError(message) {
        this.showStatus(message, 'error');
    }
    
    showConfigurationStatus() {
        const configSummary = this.configManager.getConfigSummary();
        
        console.log('🔧 AI Advisory Configuration Status:', configSummary);
        
        if (configSummary.aiEnabled) {
            console.log('✅ AI advisors are enabled and ready');
        } else {
            console.log('⚠️ AI advisors are disabled - using fallback mode');
        }
    }
    
    showFallbackStatus() {
        console.log('🔄 Running in fallback mode - no AI provider available');
        console.log('💡 To enable AI advisors, provide Azure OpenAI configuration');
    }
    
    // Public API methods
    getStatus() {
        return {
            initialized: this.isInitialized,
            aiEnabled: this.configManager?.isAIEnabled() || false,
            hasAdvisorManager: !!this.advisorManager,
            hasAdvisoryUI: !!this.aiAdvisoryUI,
            config: this.configManager?.getConfigSummary()
        };
    }
    
    updateConfiguration(newConfig) {
        if (this.configManager) {
            Object.entries(newConfig).forEach(([key, value]) => {
                this.configManager.updateConfig(key, value);
            });
            
            console.log('✅ Configuration updated');
            this.showConfigurationStatus();
        }
    }
    
    // Method to manually trigger integration (useful for debugging)
    forceIntegration() {
        console.log('🔄 Forcing dashboard integration...');
        this.integrateWithDashboard();
    }
    
    // Force UI injection specifically
    forceUIInjection() {
        console.log('🔄 Forcing AI Advisory UI injection...');
        
        // Force inject into current page
        setTimeout(() => {
            this.injectAdvisorySections();
            console.log('✅ Forced UI injection completed');
        }, 500);
    }
    
    // Fallback injection method removed - no longer needed with dedicated HTML section
}

// Initialize the AI Advisory Integration when the page loads
let aiAdvisoryIntegration = null;

async function initializeAIAdvisory() {
    console.log('🚀 initializeAIAdvisory() function called');
    if (!aiAdvisoryIntegration) {
        console.log('🚀 Starting AI Advisory Integration...');
        aiAdvisoryIntegration = new AIAdvisoryIntegration();
        console.log('🚀 Calling init() on new instance...');
        await aiAdvisoryIntegration.init();
    } else {
        console.log('🚀 AI Advisory Integration already exists');
    }
    return aiAdvisoryIntegration;
}

// Auto-initialize when DOM is ready
console.log('🔄 AI Advisory script loaded, readyState:', document.readyState);

if (document.readyState === 'loading') {
    console.log('🔄 DOM still loading, adding event listener...');
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🔄 DOMContentLoaded fired, initializing...');
        await initializeAIAdvisory();
    });
} else {
    // DOM is already ready
    console.log('🔄 DOM already ready, initializing immediately...');
    initializeAIAdvisory().catch(console.error);
}

// Also initialize when window loads (for dynamic content)
window.addEventListener('load', async () => {
    if (!aiAdvisoryIntegration) {
        console.log('🔄 Window loaded, initializing AI Advisory...');
        setTimeout(async () => {
            try {
                await initializeAIAdvisory();
            } catch (error) {
                console.error('❌ Failed to initialize AI Advisory on window load:', error);
            }
        }, 1000);
    }
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AIAdvisoryIntegration = AIAdvisoryIntegration;
    window.initializeAIAdvisory = initializeAIAdvisory;
    window.aiAdvisoryIntegration = aiAdvisoryIntegration;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAdvisoryIntegration;
}
