/**
 * AI Advisory UI Integration for YMCA Management Hub
 * Connects AI advisors to the existing dashboard interface
 */

class AIAdvisoryUI {
    constructor(advisorManager) {
        this.advisorManager = advisorManager;
        this.isLoading = false;
        this.currentAnalysis = null;
        this.analysisCache = new Map();
        this.initLoadingModal();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.injectAdvisoryUI();
        console.log('✅ AI Advisory UI initialized');
    }
    
    setupEventListeners() {
        // Listen for YMCA selection changes
        document.addEventListener('ymcaSelected', (event) => {
            this.onYMCAChange(event.detail);
        });
        
        // Listen for performance data updates
        document.addEventListener('performanceDataUpdated', (event) => {
            this.onPerformanceDataUpdate(event.detail);
        });
    }
    
    injectAdvisoryUI() {
        // Inject AI Advisory section into the Detail view
        this.injectDetailViewAdvisory();
        
        // Inject AI Advisory section into the Overview
        this.injectOverviewAdvisory();
    }
    
    injectDetailViewAdvisory() {
        const detailView = document.querySelector('.detail-view');
        if (!detailView) return;
        
        // Check if advisory section already exists
        if (detailView.querySelector('.ai-advisory-section')) return;
        
        const advisorySection = this.createAdvisorySection();
        detailView.appendChild(advisorySection);
    }
    
    injectOverviewAdvisory() {
        const overviewMain = document.querySelector('.overview-main');
        if (!overviewMain) return;
        
        // Check if advisory section already exists
        if (overviewMain.querySelector('.ai-advisory-section')) return;
        
        const advisorySection = this.createOverviewAdvisorySection();
        overviewMain.appendChild(advisorySection);
    }
    
    createAdvisorySection() {
        const section = document.createElement('section');
        section.className = 'ai-advisory-section';
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
        
        // Add event listeners
        const generateBtn = section.querySelector('#generate-analysis-btn');
        const refreshBtn = section.querySelector('#refresh-analysis-btn');
        
        generateBtn.addEventListener('click', () => this.generateAnalysis());
        refreshBtn.addEventListener('click', () => this.refreshAnalysis());
        
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
        
        // Add event listener
        const generateBtn = section.querySelector('#generate-network-analysis-btn');
        generateBtn.addEventListener('click', () => this.generateNetworkAnalysis());
        
        return section;
    }
    
    async generateAnalysis() {
        if (this.isLoading) return;
        
        const currentYMCA = this.getCurrentYMCA();
        if (!currentYMCA) {
            this.showError('No YMCA selected. Please select a YMCA first.');
            return;
        }
        
        this.showLoadingModal();
        this.updateStatus('Analyzing YMCA performance...', 'Please wait while we process your YMCA data');
        
        try {
            // Check cache first
            const cacheKey = `ymca_${currentYMCA.id}`;
            if (this.analysisCache.has(cacheKey)) {
                const cached = this.analysisCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 300000) { // 5 minutes cache
                    this.currentAnalysis = cached.analysis;
                    this.renderAnalysis(cached.analysis);
                    this.showStatus('Analysis loaded from cache', 'success');
                    this.hideLoadingModal();
                    return;
                }
            }
            
            // Generate new analysis
            const analysis = await this.advisorManager.generateComprehensiveAnalysis(currentYMCA);
            
            // Cache the result
            this.analysisCache.set(cacheKey, {
                analysis: analysis,
                timestamp: Date.now()
            });
            
            this.currentAnalysis = analysis;
            this.renderAnalysis(analysis);
            this.showStatus('Analysis completed successfully', 'success');
            
        } catch (error) {
            console.error('Error generating analysis:', error);
            this.showError('Failed to generate AI analysis. Please try again.');
        } finally {
            this.hideLoadingModal();
        }
    }
    
    async generateNetworkAnalysis() {
        if (this.isLoading) return;
        
        this.showLoadingModal();
        this.updateStatus('Analyzing network performance...', 'Please wait while we process your network data');
        
        try {
            // Get network data from the overview
            const networkData = this.getNetworkData();
            if (!networkData || !networkData.organizations) {
                throw new Error('No network data available');
            }
            
            // Generate network-wide insights
            const networkAnalysis = await this.generateNetworkInsights(networkData.organizations);
            this.renderNetworkAnalysis(networkAnalysis);
            this.showOverviewStatus('Network analysis completed', 'success');
            
        } catch (error) {
            console.error('Error generating network analysis:', error);
            this.showOverviewError('Failed to generate network analysis. Please try again.');
        } finally {
            this.hideLoadingModal();
        }
    }
    
    async generateNetworkInsights(organizations) {
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
    
    renderAnalysis(analysis) {
        console.log('🎯 AI Advisory UI rendering analysis:', analysis);
        console.log('🎯 Analysis object type:', typeof analysis);
        console.log('🎯 Analysis object keys:', Object.keys(analysis));
        console.log('🎯 Analysis object structure:', JSON.stringify(analysis, null, 2));
        
        // Find the AI advisory section
        const aiSection = document.getElementById('ai-advisory-section');
        if (!aiSection) {
            console.error('❌ AI advisory section not found');
            return;
        }
        
        console.log('🔧 AI section found:', aiSection);
        console.log('🔧 AI section current content:', aiSection.innerHTML.substring(0, 200) + '...');
        
        // Build the HTML content
        const htmlContent = this.buildAnalysisHTML(analysis);
        console.log('🔧 Generated HTML content length:', htmlContent.length);
        console.log('🔧 Generated HTML preview:', htmlContent.substring(0, 300) + '...');
        
        // Clear the current content and show results
        aiSection.innerHTML = htmlContent;
        
        console.log('🔧 After setting innerHTML, section content:', aiSection.innerHTML.substring(0, 200) + '...');
        console.log('🔧 AI section children count:', aiSection.children.length);
        

        
        // Show the results
        const resultsContainer = aiSection.querySelector('.ai-analysis-results');
        console.log('🔧 Results container found:', !!resultsContainer);
        if (resultsContainer) {
            resultsContainer.style.display = 'block';
            console.log('🔧 Results container display set to block');
        }
        
        // Setup refresh button event listener
        const refreshBtn = aiSection.querySelector('#refresh-analysis-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('🔄 Refresh analysis requested');
                // Trigger refresh through the integration
                if (window.aiAdvisoryIntegration) {
                    window.aiAdvisoryIntegration.refreshDetailAnalysis();
                }
            });
        }
        
        // Setup accordion functionality
        this.setupAccordionEventListeners(aiSection);
        
        this.showRefreshButton();
    }
    
    setupAccordionEventListeners(container) {
        // Find all accordion headers and add click event listeners
        const accordionHeaders = container.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const accordionItem = header.parentElement;
                
                // Toggle the expanded state
                accordionItem.classList.toggle('expanded');
                
                console.log('🔧 Accordion toggled:', accordionItem.classList.contains('expanded'));
            });
        });
        
        console.log('✅ Accordion event listeners set up for', accordionHeaders.length, 'headers');
    }
    
    renderNetworkAnalysis(analysis) {
        const content = document.getElementById('overview-advisory-content');
        if (!content) return;
        
        content.innerHTML = this.buildNetworkAnalysisHTML(analysis);
    }
    
    buildAnalysisHTML(analysis) {
        console.log('🔧 Building analysis HTML for:', analysis);
        console.log('🔧 Analysis keys:', Object.keys(analysis));
        console.log('🔧 Has advisorInsights:', !!analysis.advisorInsights);
        console.log('🔧 Has overallAssessment:', !!analysis.overallAssessment);
        console.log('🔧 Has crossCuttingRecommendations:', !!analysis.crossCuttingRecommendations);
        console.log('🔧 Has actionPlan:', !!analysis.actionPlan);
        
        // Handle the comprehensive analysis format from the AI framework
        if (analysis.advisorInsights && analysis.overallAssessment && analysis.crossCuttingRecommendations && analysis.actionPlan) {
            console.log('🔧 Using COMPREHENSIVE analysis format (AI Framework)');
            return this.buildComprehensiveAnalysisHTML(analysis);
        }
        
        // Handle legacy format (fallback)
        if (analysis.advisorInsights && analysis.overallAssessment) {
            console.log('🔧 Using LEGACY analysis format (fallback)');
            return this.buildLegacyAnalysisHTML(analysis);
        }
        
        // Handle the new comprehensive analysis format
        console.log('🔧 Using COMPREHENSIVE analysis format (new)');
        return this.buildComprehensiveAnalysisHTML(analysis);
    }
    
    buildComprehensiveAnalysisHTML(analysis) {
        console.log('🔧 Building comprehensive analysis HTML');
        
        let html = `
            <div class="ai-advisory-content">
                <div class="advisory-header">
                    <h3>AI Analysis Complete</h3>
                    <p class="results-timestamp">Generated at ${new Date().toLocaleTimeString()}</p>
                    <div class="advisory-controls">
                        <button class="btn btn-secondary" id="refresh-analysis-btn">
                            🔄 Refresh Analysis
                        </button>
                    </div>
                </div>
                
                <div class="ai-analysis-results">
                    ${analysis.overallAssessment ? this.buildOverallAssessmentHTML(analysis.overallAssessment) : ''}
        `;
        
        // Add each advisor's analysis
        if (analysis.advisorInsights && Object.keys(analysis.advisorInsights).length > 0) {
            // Handle AI Framework format with advisorInsights
            Object.entries(analysis.advisorInsights).forEach(([advisorId, advisorAnalysis]) => {
                html += this.buildAdvisorAnalysisHTML(advisorAnalysis, advisorId);
            });
        } else if (analysis.advisors && Array.isArray(analysis.advisors)) {
            // Handle new format with advisors array
            analysis.advisors.forEach((advisorAnalysis, index) => {
                html += this.buildAdvisorAnalysisHTML(advisorAnalysis, index);
            });
        }
        
        // Add cross-cutting insights if available
        if (analysis.crossCuttingRecommendations) {
            html += this.buildCrossCuttingInsightsHTML(analysis.crossCuttingRecommendations);
        }
        
        // Add master action plan if available
        if (analysis.actionPlan) {
            html += this.buildMasterActionPlanHTML(analysis.actionPlan);
        }
        
        html += `
                </div>
            </div>
        `;
        
        return html;
    }
    
    buildAdvisorAnalysisHTML(advisorAnalysis, advisorId) {
        const { category, advisor, executiveSummary, keyInsights, recommendedActions, successMetrics, specialConsiderations } = advisorAnalysis;
        
        // Use advisor name if available, otherwise format the advisor ID
        const advisorName = advisor || this.getAdvisorDisplayName(advisorId);
        
        console.log(`🔧 Building advisor analysis HTML for ${advisorId}:`, {
            hasExecutiveSummary: !!executiveSummary,
            hasKeyInsights: !!(keyInsights && keyInsights.length > 0),
            hasRecommendedActions: !!(recommendedActions && Object.keys(recommendedActions).length > 0),
            hasSuccessMetrics: !!(successMetrics && successMetrics.length > 0),
            hasSpecialConsiderations: !!(specialConsiderations && specialConsiderations.length > 0)
        });
        
        return `
            <div class="accordion-item advisor-analysis" data-advisor="${advisorId}">
                <div class="accordion-header">
                    <h5>${advisorName}</h5>
                    <span class="accordion-icon">▼</span>
                </div>
                
                <div class="accordion-content">
                    ${executiveSummary ? `
                        <div class="section-content">
                            <h6>📋 Executive Summary</h6>
                            <p>${executiveSummary}</p>
                        </div>
                    ` : ''}
                    
                    ${keyInsights && Array.isArray(keyInsights) && keyInsights.length > 0 ? `
                        <div class="section-content">
                            <h6>💡 Key Insights</h6>
                            <ul class="insights-list">
                                ${keyInsights.map(insight => `<li>${insight}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${recommendedActions && typeof recommendedActions === 'object' && Object.keys(recommendedActions).length > 0 ? `
                        <div class="section-content">
                            <h6>🎯 Recommended Actions</h6>
                            ${this.buildRecommendedActionsHTML(recommendedActions)}
                        </div>
                    ` : ''}
                    
                    ${successMetrics && Array.isArray(successMetrics) && successMetrics.length > 0 ? `
                        <div class="section-content">
                            <h6>📊 Success Metrics</h6>
                            <ul class="metrics-list">
                                ${successMetrics.map(metric => `<li>${metric}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${specialConsiderations && Array.isArray(specialConsiderations) && specialConsiderations.length > 0 ? `
                        <div class="section-content">
                            <h6>⚠️ Special Considerations</h6>
                            <ul class="considerations-list">
                                ${specialConsiderations.map(consideration => `<li>${consideration}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    buildRecommendedActionsHTML(recommendedActions) {
        let html = '';
        
        if (!recommendedActions || typeof recommendedActions !== 'object') {
            console.warn('⚠️ buildRecommendedActionsHTML: Invalid recommendedActions:', recommendedActions);
            return html;
        }
        
        Object.entries(recommendedActions).forEach(([timeframe, actions]) => {
            if (actions && Array.isArray(actions) && actions.length > 0) {
                html += `
                    <div class="action-timeframe">
                        <h6>${this.formatTimeframe(timeframe)}</h6>
                        <ul class="actions-list">
                            ${actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else {
                console.log(`🔧 Skipping timeframe ${timeframe}:`, actions, 'type:', typeof actions, 'isArray:', Array.isArray(actions), 'length:', actions?.length);
            }
        });
        
        return html;
    }
    
    formatTimeframe(timeframe) {
        const timeframes = {
            'immediate': '🚀 Immediate (0-30 days)',
            'shortTerm': '📅 Short-term (1-3 months)',
            'longTerm': '🎯 Long-term (3-12 months)'
        };
        return timeframes[timeframe] || timeframe;
    }
    
    buildCrossCuttingInsightsHTML(crossCuttingInsights) {
        if (!crossCuttingInsights || crossCuttingInsights.length === 0) {
            return `
                <div class="accordion-item cross-cutting-insights">
                    <div class="accordion-header">
                        <h5>🔗 Cross-Cutting Insights</h5>
                        <span class="accordion-icon">▼</span>
                    </div>
                    <div class="accordion-content">
                        <div class="cross-cutting-content">
                            <p class="no-insights">No cross-cutting themes identified at this time.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="accordion-item cross-cutting-insights">
                <div class="accordion-header">
                    <h5>🔗 Cross-Cutting Insights</h5>
                    <span class="accordion-icon">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="cross-cutting-content">
                        ${crossCuttingInsights.map(insight => `
                            <div class="cross-cutting-item">
                                <div class="theme-header">
                                    <span class="theme-name">${insight.theme}</span>
                                    <span class="theme-badge priority-${insight.priority.toLowerCase()}">${insight.priority} Priority</span>
                                </div>
                                <p class="theme-details">Mentioned by ${insight.frequency} advisor${insight.frequency !== 1 ? 's' : ''}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    buildMasterActionPlanHTML(masterActionPlan) {
        console.log('🔧 Building master action plan HTML for:', masterActionPlan);
        console.log('🔧 Action plan keys:', Object.keys(masterActionPlan));
        console.log('🔧 Action plan structure:', JSON.stringify(masterActionPlan, null, 2));
        
        const validTimeframes = Object.entries(masterActionPlan)
            .filter(([timeframe, actions]) => {
                const isValid = Array.isArray(actions) && actions.length > 0;
                console.log(`🔧 Timeframe ${timeframe}:`, actions, 'isArray:', Array.isArray(actions), 'length:', actions?.length, 'valid:', isValid);
                return isValid;
            });
        
        if (validTimeframes.length === 0) {
            return `
                <div class="section-content">
                    <h6>📋 Master Action Plan</h6>
                    <div class="master-action-content">
                        <p class="no-actions">No specific actions available at this time. Focus on the individual advisor recommendations above.</p>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="accordion-item master-action-plan">
                <div class="accordion-header">
                    <h5>📋 Master Action Plan</h5>
                    <span class="accordion-icon">▼</span>
                </div>
                <div class="accordion-content">
                    ${validTimeframes.map(([timeframe, actions]) => `
                        <div class="action-timeframe">
                            <h6>${this.formatTimeframe(timeframe)}</h6>
                            <ul class="actions-list">
                                ${actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    buildOverallAssessmentHTML(overallAssessment) {
        const { score, maxScore, percentage, performanceLevel, supportNeeded, supportDesignation } = overallAssessment;
        
        return `
            <div class="accordion-item overall-assessment expanded">
                <div class="accordion-header">
                    <h5>📊 Overall Assessment</h5>
                    <span class="accordion-icon">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="assessment-metrics">
                        <div class="metric">
                            <span class="label">Performance Level:</span>
                            <span class="value ${performanceLevel.toLowerCase()}">${performanceLevel}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Support Needed:</span>
                            <span class="value ${supportNeeded.toLowerCase()}">${supportNeeded}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Score:</span>
                            <span class="value">${score}/${maxScore} (${percentage}%)</span>
                        </div>
                        <div class="metric">
                            <span class="label">Support Designation:</span>
                            <span class="value">${supportDesignation}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    buildLegacyAnalysisHTML(analysis) {
        const { overallAssessment, advisorInsights, crossCuttingRecommendations, actionPlan } = analysis;
        
        let html = `
            <div class="analysis-overview">
                <div class="overall-assessment">
                    <h4>Overall Assessment</h4>
                    <div class="assessment-metrics">
                        <div class="metric">
                            <span class="label">Performance Level:</span>
                            <span class="value ${overallAssessment.performanceLevel.toLowerCase()}">${overallAssessment.performanceLevel}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Support Needed:</span>
                            <span class="value ${overallAssessment.supportNeeded.toLowerCase()}">${overallAssessment.supportNeeded}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Score:</span>
                            <span class="value">${overallAssessment.score}/${overallAssessment.maxScore} (${overallAssessment.percentage}%)</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="advisor-insights">
                <h4>Advisor Insights</h4>
                <div class="insights-grid">
        `;
        
        // Add each advisor's insights
        Object.entries(advisorInsights).forEach(([advisorId, insight]) => {
            if (insight.error) {
                html += `
                    <div class="insight-card error">
                        <h5>${this.getAdvisorDisplayName(advisorId)}</h5>
                        <p class="error-message">${insight.error}</p>
                    </div>
                `;
            } else {
                html += `
                    <div class="insight-card ${insight.source}">
                        <h5>${insight.advisor}</h5>
                        <div class="insight-content">
                            <p class="summary"><strong>Summary:</strong> ${insight.executiveSummary}</p>
                            ${this.buildInsightsList(insight.keyInsights, 'Key Insights')}
                            ${this.buildActionsList(insight.recommendedActions)}
                        </div>
                    </div>
                `;
            }
        });
        
        html += `
                </div>
            </div>
            
            <div class="cross-cutting-themes">
                <h4>Cross-Cutting Themes</h4>
                <div class="themes-list">
        `;
        
        crossCuttingRecommendations.forEach(theme => {
            html += `
                <div class="theme-item ${theme.priority.toLowerCase()}">
                    <span class="theme-name">${theme.theme}</span>
                    <span class="theme-frequency">${theme.frequency} mentions</span>
                    <span class="theme-priority">${theme.priority} priority</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
            
            <div class="master-action-plan">
                <h4>Master Action Plan</h4>
                <div class="action-plan-grid">
                    <div class="action-category">
                        <h5>Immediate (0-30 days)</h5>
                        <ul>${actionPlan.immediate.map(action => `<li>${action}</li>`).join('')}</ul>
                    </div>
                    <div class="action-category">
                        <h5>Short Term (1-6 months)</h5>
                        <ul>${actionPlan.shortTerm.map(action => `<li>${action}</li>`).join('')}</ul>
                    </div>
                    <div class="action-category">
                        <h5>Long Term (6+ months)</h5>
                        <ul>${actionPlan.longTerm.map(action => `<li>${action}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        `;
        
        return html;
    }
    
    buildNetworkAnalysisHTML(analysis) {
        const { performanceDistribution, topPerformers, improvementOpportunities, recommendations } = analysis;
        
        return `
            <div class="network-analysis">
                <div class="performance-distribution">
                    <h4>Performance Distribution</h4>
                    <div class="distribution-chart">
                        <div class="distribution-bar">
                            <div class="bar-segment high" style="width: ${(performanceDistribution.high / analysis.totalYMCAs) * 100}%">
                                <span class="segment-label">High: ${performanceDistribution.high}</span>
                            </div>
                            <div class="bar-segment moderate" style="width: ${(performanceDistribution.moderate / analysis.totalYMCAs) * 100}%">
                                <span class="segment-label">Moderate: ${performanceDistribution.moderate}</span>
                            </div>
                            <div class="bar-segment low" style="width: ${(performanceDistribution.low / analysis.totalYMCAs) * 100}%">
                                <span class="segment-label">Low: ${performanceDistribution.low}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="top-performers">
                    <h4>Top Performers</h4>
                    <div class="performers-list">
                        ${topPerformers.map(org => `
                            <div class="performer-item">
                                <span class="name">${org.name}</span>
                                <span class="score">${org.percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="improvement-opportunities">
                    <h4>Improvement Opportunities</h4>
                    <div class="opportunities-list">
                        ${improvementOpportunities.map(org => `
                            <div class="opportunity-item">
                                <span class="name">${org.name}</span>
                                <span class="improvement">+${org.improvementNeeded}% needed</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="network-recommendations">
                    <h4>Network Recommendations</h4>
                    <div class="recommendations-grid">
                        <div class="recommendation-category">
                            <h5>Immediate</h5>
                            <ul>${recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}</ul>
                        </div>
                        <div class="recommendation-category">
                            <h5>Short Term</h5>
                            <ul>${recommendations.shortTerm.map(rec => `<li>${rec}</li>`).join('')}</ul>
                        </div>
                        <div class="recommendation-category">
                            <h5>Long Term</h5>
                            <ul>${recommendations.longTerm.map(rec => `<li>${rec}</li>`).join('')}</ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    buildInsightsList(insights, title) {
        if (!insights || insights.length === 0) return '';
        
        return `
            <div class="insights-list">
                <strong>${title}:</strong>
                <ul>${insights.map(insight => `<li>${insight}</li>`).join('')}</ul>
            </div>
        `;
    }
    
    buildActionsList(actions) {
        if (!actions || Object.keys(actions).length === 0) return '';
        
        let html = '<div class="actions-list"><strong>Recommended Actions:</strong>';
        
        Object.entries(actions).forEach(([timeframe, actionList]) => {
            if (actionList && actionList.length > 0) {
                html += `
                    <div class="action-timeframe">
                        <strong>${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}:</strong>
                        <ul>${actionList.map(action => `<li>${action}</li>`).join('')}</ul>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    getAdvisorDisplayName(advisorId) {
        const config = this.advisorManager.getAdvisorConfig(advisorId);
        return config ? config.name : advisorId;
    }
    
    // Utility methods
    getCurrentYMCA() {
        // Try to get from the current YMCA selection
        const selectedYMCA = window.currentData?.organization;
        if (selectedYMCA) return selectedYMCA;
        
        // Try to get from the dropdown
        const dropdown = document.getElementById('ymca-select');
        if (dropdown && dropdown.value) {
            return { id: dropdown.value, name: dropdown.options[dropdown.selectedIndex].text };
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
    
    updateGenerateButton(loading) {
        const btn = document.getElementById('generate-analysis-btn');
        if (!btn) return;
        
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            btn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    }
    
    updateNetworkGenerateButton(loading) {
        const btn = document.getElementById('generate-network-analysis-btn');
        if (!btn) return;
        
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            btn.disabled = true;
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
        }
    }
    
    showRefreshButton() {
        const refreshBtn = document.getElementById('refresh-analysis-btn');
        if (refreshBtn) refreshBtn.style.display = 'inline-block';
    }
    
    clearAdvisoryContent() {
        // Clear the advisory content
        const content = document.getElementById('advisory-content');
        if (content) {
            content.innerHTML = `
                <div class="advisory-placeholder">
                    <p>Click "Generate AI Analysis" to get intelligent insights and recommendations for this YMCA.</p>
                </div>
            `;
        }
        
        // Clear the AI analysis results container
        const resultsContainer = document.querySelector('.ai-analysis-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
            resultsContainer.style.display = 'none';
        }
        
        // Clear any cached analysis
        this.currentAnalysis = null;
    }
    
    clearOverviewAdvisoryContent() {
        const content = document.getElementById('overview-advisory-content');
        if (content) {
            content.innerHTML = '<div class="advisory-placeholder"><p>Analyzing network...</p></div>';
        }
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
    
    showOverviewStatus(message, type = 'info') {
        const status = document.querySelector('.overview-advisory .advisory-status');
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
    
    showOverviewError(message) {
        this.showOverviewStatus(message, 'error');
    }
    
    async refreshAnalysis() {
        if (this.currentAnalysis) {
            // Clear cache for current YMCA
            const cacheKey = `ymca_${this.currentAnalysis.ymcaId}`;
            this.analysisCache.delete(cacheKey);
            
            // Regenerate analysis
            await this.generateAnalysis();
        }
    }
    
    onYMCAChange(ymcaData) {
        console.log('🔄 AI Advisory UI: YMCA changed to:', ymcaData?.name);
        
        // Clear current analysis when YMCA changes
        this.currentAnalysis = null;
        
        // Clear all advisory content
        this.clearAdvisoryContent();
        
        // Hide refresh button
        const refreshBtn = document.getElementById('refresh-analysis-btn');
        if (refreshBtn) refreshBtn.style.display = 'none';
        
        // Clear any existing AI analysis results
        const allResultsContainers = document.querySelectorAll('.ai-analysis-results');
        allResultsContainers.forEach(container => {
            container.innerHTML = '';
            container.style.display = 'none';
        });
        
        // Show fresh placeholder with new YMCA name
        const content = document.getElementById('advisory-content');
        if (content) {
            content.innerHTML = `
                <div class="advisory-placeholder">
                    <p>Click "Generate AI Analysis" to get intelligent insights and recommendations for ${ymcaData?.name || 'this YMCA'}.</p>
                </div>
            `;
        }
        
        console.log('✅ AI Advisory UI: Content cleared for new YMCA');
    }
    
    onPerformanceDataUpdate(performanceData) {
        // Clear cache when performance data updates
        if (this.currentAnalysis) {
            const cacheKey = `ymca_${this.currentAnalysis.ymcaId}`;
            this.analysisCache.delete(cacheKey);
        }
    }

    // Initialize the loading modal HTML
    initLoadingModal() {
        // Create loading modal if it doesn't exist
        if (!document.getElementById('ai-loading-modal')) {
            const modalHTML = `
                <div id="ai-loading-modal" class="ai-loading-modal" style="display: none;">
                    <div class="ai-loading-content">
                        <div class="ai-loading-header">
                            <div class="ai-loading-icon">
                                <div class="ai-brain-animation">
                                    <div class="ai-brain-core"></div>
                                    <div class="ai-brain-pulse"></div>
                                    <div class="ai-brain-rings"></div>
                                </div>
                            </div>
                            <h3>AI Analysis in Progress</h3>
                            <p class="ai-loading-subtitle">Generating intelligent insights and recommendations...</p>
                        </div>
                        
                        <div class="ai-loading-progress">
                            <div class="ai-loading-steps">
                                <div class="ai-step active" data-step="1">
                                    <div class="step-icon">🔍</div>
                                    <div class="step-text">Analyzing Data</div>
                                </div>
                                <div class="ai-step" data-step="2">
                                    <div class="step-icon">🧠</div>
                                    <div class="step-text">AI Processing</div>
                                </div>
                                <div class="ai-step" data-step="3">
                                    <div class="step-icon">💡</div>
                                    <div class="step-text">Generating Insights</div>
                                </div>
                                <div class="ai-step" data-step="4">
                                    <div class="step-icon">✅</div>
                                    <div class="step-text">Finalizing</div>
                                </div>
                            </div>
                            
                            <div class="ai-loading-bar">
                                <div class="ai-loading-progress-fill"></div>
                            </div>
                        </div>
                        
                        <div class="ai-loading-status">
                            <div class="status-message">Initializing AI analysis...</div>
                            <div class="status-details">Please wait while we process your YMCA data</div>
                        </div>
                        
                        <div class="ai-loading-actions">
                            <button id="ai-cancel-analysis" class="btn btn-secondary">
                                Cancel Analysis
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Setup cancel button
            document.getElementById('ai-cancel-analysis').addEventListener('click', () => {
                this.cancelAnalysis();
            });
        }
    }

    // Show loading modal with animation
    showLoadingModal() {
        const modal = document.getElementById('ai-loading-modal');
        if (modal) {
            this.isLoading = true;
            modal.style.display = 'flex';
            
            // Trigger entrance animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Start progress animation
            this.startProgressAnimation();
        }
    }

    // Hide loading modal with animation
    hideLoadingModal() {
        const modal = document.getElementById('ai-loading-modal');
        if (modal) {
            this.isLoading = false;
            modal.classList.remove('show');
            
            // Wait for exit animation then hide
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            
            // Reset progress
            this.resetProgress();
        }
    }

    // Start the progress animation sequence
    startProgressAnimation() {
        const steps = document.querySelectorAll('.ai-step');
        const progressFill = document.querySelector('.ai-loading-progress-fill');
        const statusMessage = document.querySelector('.status-message');
        const statusDetails = document.querySelector('.status-details');
        
        let currentStep = 0;
        const stepDuration = 2000; // 2 seconds per step
        
        const updateStep = () => {
            if (currentStep < steps.length) {
                // Update step indicator
                steps.forEach((step, index) => {
                    step.classList.toggle('active', index <= currentStep);
                    step.classList.toggle('completed', index < currentStep);
                });
                
                // Update progress bar
                const progress = ((currentStep + 1) / steps.length) * 100;
                progressFill.style.width = `${progress}%`;
                
                // Update status messages
                const stepMessages = {
                    0: { message: 'Analyzing YMCA performance data...', details: 'Processing operational and financial metrics' },
                    1: { message: 'AI is processing your data...', details: 'Generating insights using advanced analytics' },
                    2: { message: 'Creating actionable recommendations...', details: 'Developing strategic action plans' },
                    3: { message: 'Finalizing your analysis...', details: 'Preparing comprehensive insights for review' }
                };
                
                if (stepMessages[currentStep]) {
                    statusMessage.textContent = stepMessages[currentStep].message;
                    statusDetails.textContent = stepMessages[currentStep].details;
                }
                
                currentStep++;
                
                if (currentStep < steps.length) {
                    setTimeout(updateStep, stepDuration);
                }
            }
        };
        
        updateStep();
    }

    // Reset progress indicators
    resetProgress() {
        const steps = document.querySelectorAll('.ai-step');
        const progressFill = document.querySelector('.ai-loading-progress-fill');
        
        steps.forEach(step => {
            step.classList.remove('active', 'completed');
        });
        steps[0].classList.add('active');
        
        progressFill.style.width = '0%';
    }

    // Cancel analysis
    cancelAnalysis() {
        if (this.currentAnalysis) {
            // Cancel the current analysis if possible
            console.log('🔄 Analysis cancelled by user');
            this.hideLoadingModal();
            
            // Reset button state
            const generateBtn = document.getElementById('generate-analysis-btn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.textContent = 'Generate AI Analysis';
            }
        }
    }

    // Update loading status
    updateStatus(message, details = '') {
        const statusMessage = document.querySelector('.ai-loading-status .status-message');
        const statusDetails = document.querySelector('.ai-loading-status .status-details');
        
        if (statusMessage) statusMessage.textContent = message;
        if (statusDetails && details) statusDetails.textContent = details;
    }

    // Show analysis results
    showAnalysisResults(results, containerId) {
        // Hide loading modal first
        this.hideLoadingModal();
        
        // Show results in the specified container
        const container = document.getElementById(containerId);
        if (container && results) {
            // Format and display results
            this.formatAndDisplayResults(results, container);
        }
    }

    // Format and display analysis results
    formatAndDisplayResults(results, container) {
        // Clear existing content
        container.innerHTML = '';
        
        // Create results HTML
        const resultsHTML = this.createResultsHTML(results);
        container.innerHTML = resultsHTML;
        
        // Show the results container
        container.style.display = 'block';
        
        // Add entrance animation
        container.classList.add('results-visible');
    }

    // Create HTML for analysis results
    createResultsHTML(results) {
        return `
            <div class="ai-analysis-results-content">
                <div class="results-header">
                    <h4>AI Analysis Complete</h4>
                    <p class="results-timestamp">Generated at ${new Date().toLocaleTimeString()}</p>
                </div>
                
                ${this.formatExecutiveSummary(results.executiveSummary)}
                ${this.formatKeyInsights(results.keyInsights)}
                ${this.formatRecommendedActions(results.recommendedActions)}
                ${this.formatSuccessMetrics(results.successMetrics)}
                ${this.formatSpecialConsiderations(results.specialConsiderations)}
            </div>
        `;
    }

    // Format individual sections
    formatExecutiveSummary(summary) {
        if (!summary) return '';
        return `
            <div class="results-section">
                <h5>📋 Executive Summary</h5>
                <div class="section-content">${summary}</div>
            </div>
        `;
    }

    formatKeyInsights(insights) {
        if (!insights || !insights.length) return '';
        return `
            <div class="results-section">
                <h5>💡 Key Insights</h5>
                <ul class="insights-list">
                    ${insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    formatRecommendedActions(actions) {
        if (!actions || !Object.keys(actions).length) return '';
        
        let actionsHTML = '<div class="results-section"><h5>🎯 Recommended Actions</h5>';
        
        Object.entries(actions).forEach(([timeframe, actionList]) => {
            if (actionList && actionList.length > 0) {
                actionsHTML += `
                    <div class="action-timeframe">
                        <h6>${this.formatTimeframe(timeframe)}</h6>
                        <ul class="actions-list">
                            ${actionList.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
        });
        
        actionsHTML += '</div>';
        return actionsHTML;
    }

    formatSuccessMetrics(metrics) {
        if (!metrics || !metrics.length) return '';
        return `
            <div class="results-section">
                <h5>📊 Success Metrics</h5>
                <ul class="metrics-list">
                    ${metrics.map(metric => `<li>${metric}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    formatSpecialConsiderations(considerations) {
        if (!considerations || !considerations.length) return '';
        return `
            <div class="results-section">
                <h5>⚠️ Special Considerations</h5>
                <ul class="considerations-list">
                    ${considerations.map(consideration => `<li>${consideration}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    formatTimeframe(timeframe) {
        const timeframes = {
            'immediate': '🚀 Immediate (0-30 days)',
            'shortTerm': '📅 Short-term (1-3 months)',
            'longTerm': '🎯 Long-term (3-12 months)'
        };
        return timeframes[timeframe] || timeframe;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AIAdvisoryUI = AIAdvisoryUI;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAdvisoryUI;
}
