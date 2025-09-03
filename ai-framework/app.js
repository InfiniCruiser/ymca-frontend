// Global state
let currentData = null;
let metricsData = null;
let supportData = null;
let organizationsLoaded = false;
let organizations = [];

// DOM elements
let elements = {};

// Generate suggested resources based on performance (for backend API data that doesn't include this)
function generateSuggestedResources(performanceSnapshot) {
    if (!performanceSnapshot) {
        console.warn('No performanceSnapshot provided to generateSuggestedResources');
        return getDefaultSuggestedResources();
    }
    
    const resources = {};
    
    // Default resources template
    const defaultResourceTemplate = {
        selfDirected: "Link",
        networkSupported: {
            directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
            sharedServices: ["Y-USA", "YESS"]
        },
        highlighted: {
            directDelivery: ["Learning Centers", "HR SDP"],
            sharedServices: ["Y-USA"]
        }
    };
    
    // Staff Retention resources (always included for demonstration)
    resources.staffRetention = { ...defaultResourceTemplate };
    
    // Financial metrics resources
    resources.financialMetrics = {
        ...defaultResourceTemplate,
        highlighted: {
            sharedServices: ["Y-USA", "YESS"]
        }
    };
    
    // Add resources for low-performing operational metrics
    if (performanceSnapshot.operationalPerformance && performanceSnapshot.operationalPerformance.metrics) {
        performanceSnapshot.operationalPerformance.metrics.forEach(metric => {
            if (metric && metric.name && metric.performance === 'low') {
                const resourceKey = metric.name.replace(/\s+/g, '');
                resources[resourceKey] = { ...defaultResourceTemplate };
            }
        });
    }
    
    // Add resources for low-performing financial metrics
    if (performanceSnapshot.financialPerformance && performanceSnapshot.financialPerformance.metrics) {
        performanceSnapshot.financialPerformance.metrics.forEach(metric => {
            if (metric && metric.name && metric.performance === 'low') {
                const resourceKey = metric.name.replace(/\s+/g, '');
                resources[resourceKey] = {
                    ...defaultResourceTemplate,
                    highlighted: {
                        sharedServices: ["Y-USA", "YESS"]
                    }
                };
            }
        });
    }
    
    return resources;
}

function getDefaultSuggestedResources() {
    return {
        staffRetention: {
            selfDirected: "Link",
            networkSupported: {
                directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
                sharedServices: ["Y-USA", "YESS"]
            },
            highlighted: {
                directDelivery: ["Learning Centers", "HR SDP"],
                sharedServices: ["Y-USA"]
            }
        },
        financialMetrics: {
            selfDirected: "Link",
            networkSupported: {
                directDelivery: ["Peer Communities", "Membership SDP", "HR SDP", "Activation Cohorts", "Learning Centers", "Alliances", "Y-USA", "Finance SDP"],
                sharedServices: ["Y-USA", "YESS"]
            },
            highlighted: {
                sharedServices: ["Y-USA", "YESS"]
            }
        }
    };
}

// Initialize DOM elements
function initializeElements() {
    elements = {
        ymcaSelect: document.getElementById('ymca-select'),
        totalPoints: document.getElementById('total-points'),
        supportDesignation: document.getElementById('support-designation'),
        operationalMetrics: document.getElementById('operational-metrics'),
        financialMetrics: document.getElementById('financial-metrics'),
        resourcesContent: document.getElementById('resources-content'),
        drillDownModal: document.getElementById('drill-down-modal'),
        closeModal: document.getElementById('close-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalBody: document.getElementById('modal-body'),
        metricsModal: document.getElementById('metrics-modal'),
        closeMetricsModal: document.getElementById('close-metrics-modal'),
        metricsModalBody: document.getElementById('metrics-modal-body')
    };
}

// Debug DOM elements
console.log('DOM Elements loaded:', {
    ymcaSelect: !!elements.ymcaSelect,
    totalPoints: !!elements.totalPoints,
    supportDesignation: !!elements.supportDesignation,
    operationalMetrics: !!elements.operationalMetrics,
    financialMetrics: !!elements.financialMetrics,
    resourcesContent: !!elements.resourcesContent
});

// Initialize the application
async function init() {
    try {
        console.log('Initializing dashboard...');
        
        // Initialize DOM elements
        initializeElements();
        
        // Check if DOM elements are available
        if (!elements.ymcaSelect) {
            throw new Error('YMCA selector not found in DOM');
        }
        
        console.log('DOM elements loaded successfully');
        
        // Set up event listeners first
        setupEventListeners();
        setupColorPalette();
        
        // Load data from backend API
        await loadData();
        
        // Check if a YMCA was selected from the overview page
        const selectedYMCA = localStorage.getItem('selectedYMCA');
        console.log('Selected YMCA from localStorage:', selectedYMCA);
        if (selectedYMCA) {
            console.log('Setting YMCA selector to:', selectedYMCA);
            elements.ymcaSelect.value = selectedYMCA;
            await handleYMCAChange();
            localStorage.removeItem('selectedYMCA'); // Clear the selection
        } else {
            // Load data for the currently selected YMCA in the dropdown
            console.log('No YMCA in localStorage, using dropdown selection');
            await handleYMCAChange();
        }
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
}



// Load organizations from backend API (lazy loading)
async function loadOrganizations() {
    if (organizationsLoaded) {
        console.log('Organizations already loaded, using cached data');
        return organizations;
    }
    
    try {
        console.log('Loading organizations from backend API...');
        
        if (window.apiService) {
            const orgs = await window.apiService.getOrganizations();
            if (orgs && orgs.length > 0) {
                organizations = orgs;
                organizationsLoaded = true;
                console.log(`Loaded ${orgs.length} organizations from backend API`);
                return orgs;
            }
        }
        
        // Fallback to static data if API fails
        console.log('Falling back to static organizations');
        organizations = [
            { id: 'xyz', name: 'XYZ YMCA' },
            { id: 'stlouis', name: 'St. Louis Y' },
            { id: 'charlotte', name: 'Charlotte Y' },
            { id: 'la', name: 'LA Y' },
            { id: 'chicago', name: 'Chicago Y' },
            { id: 'miami', name: 'Miami Y' },
            { id: 'seattle', name: 'Seattle Y' },
            { id: 'boston', name: 'Boston Y' },
            { id: 'denver', name: 'Denver Central Y' },
            { id: 'buffalo', name: 'Buffalo Central Y' },
            { id: 'columbus', name: 'Columbus Y' },
            { id: 'cleveland', name: 'Cleveland Central Y' },
            { id: 'philadelphia', name: 'Philadelphia Y' },
            { id: 'knoxville', name: 'Knoxville Y' },
            { id: 'tacoma', name: 'Tacoma Y' }
        ];
        organizationsLoaded = true;
        return organizations;
    } catch (error) {
        console.error('Failed to load organizations:', error);
        return [];
    }
}

// Populate YMCA dropdown with real data
async function populateYMCAOptions(organizations) {
    try {
        console.log('Populating YMCA dropdown with real data...');
        
        // Clear existing options
        elements.ymcaSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a YMCA...';
        elements.ymcaSelect.appendChild(defaultOption);
        
        // Add organization options
        organizations.forEach(org => {
            const option = document.createElement('option');
            option.value = org.id;
            option.textContent = org.name;
            elements.ymcaSelect.appendChild(option);
        });
        
        console.log(`Populated dropdown with ${organizations.length} organizations`);
    } catch (error) {
        console.error('Failed to populate YMCA options:', error);
    }
}

// Load all data from API with fallback
async function loadData() {
    try {
        console.log('Loading initial data from API...');
        
        // Check if API service is available
        if (window.apiService) {
            console.log('API service available, attempting to load real-time data from backend...');
            
            try {
                // Try to load organizations from backend API first
                const organizations = await loadOrganizations();
                if (organizations && organizations.length > 0) {
                    console.log(`Loaded ${organizations.length} organizations from database`);
                    await populateYMCAOptions(organizations);
                }
                
                // Try to load overview data from backend API
                const overviewData = await window.apiService.getOverviewData();
                
                if (overviewData && (Array.isArray(overviewData) ? overviewData.length > 0 : true)) {
                    // Transform API data to match existing format
                    const transformedData = window.apiService.transformApiDataToLegacyFormat(overviewData);
                    currentData = { name: 'Real-time Data from Backend', data: transformedData };
                    console.log('Successfully loaded real-time data from backend API');
                } else {
                    console.log('No real-time data available, using static data');
                }
            } catch (apiError) {
                console.error('API data loading failed, using static data:', apiError);
            }
        } else {
            console.log('API service not available, using static data');
        }
        
        // Load metrics and support data from backend
        if (window.apiService) {
            try {
                // Load support designations from backend
                const supportDesignations = await window.apiService.getSupportDesignations();
                if (supportDesignations) {
                    supportData = supportDesignations;
                    console.log('✅ Support designations loaded from backend');
                }
            } catch (error) {
                console.error('Failed to load support designations from backend:', error);
            }
        }
        
        console.log('Data loading completed');
            } catch (error) {
            console.error('Failed to load data:', error);
        }
}

// Show data source status
async function showDataSourceStatus() {
    if (window.apiService) {
        const status = await window.apiService.getDataSourceStatus();
        console.log('Data source status:', status);
        
        // You can add a visual indicator here if needed
        if (status.dataSource === 'API') {
            console.log('✅ Using real-time data from database');
        } else {
            console.log('📊 Using static data (fallback mode)');
        }
    }
}

// Show loading state
function showLoadingState() {
    console.log('Showing loading state...');
    // Add loading indicator to the dashboard
    const dashboard = document.querySelector('.dashboard');
    if (dashboard) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-indicator';
        loadingDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading YMCA data...</p>
            </div>
        `;
        loadingDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        dashboard.style.position = 'relative';
        dashboard.appendChild(loadingDiv);
    }
}

// Hide loading state
function hideLoadingState() {
    console.log('Hiding loading state...');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Setup event listeners
function setupEventListeners() {
    // YMCA selector with lazy loading
    elements.ymcaSelect.addEventListener('focus', async () => {
        if (!organizationsLoaded) {
            console.log('YMCA dropdown focused, loading organizations...');
            const organizations = await loadOrganizations();
            await populateYMCAOptions(organizations);
        }
    });
    
    elements.ymcaSelect.addEventListener('change', handleYMCAChange);
    
    // Modal close buttons
    elements.closeModal.addEventListener('click', closeDrillDownModal);
    elements.closeMetricsModal.addEventListener('click', closeMetricsModal);
    
    // Action Plan Modal event listeners
    const closeActionPlanBtn = document.getElementById('close-action-plan');
    const exportActionPlanBtn = document.getElementById('export-action-plan');
    const shareActionPlanBtn = document.getElementById('share-action-plan');
    
    if (closeActionPlanBtn) {
        closeActionPlanBtn.addEventListener('click', closeActionPlan);
    }
    
    if (exportActionPlanBtn) {
        exportActionPlanBtn.addEventListener('click', exportActionPlan);
    }
    
    if (shareActionPlanBtn) {
        shareActionPlanBtn.addEventListener('click', shareActionPlan);
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.drillDownModal) {
            closeDrillDownModal();
        }
        if (e.target === elements.metricsModal) {
            closeMetricsModal();
        }
        if (e.target === document.getElementById('action-plan-modal')) {
            closeActionPlan();
        }
    });
    
    // Close modals with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.drillDownModal.style.display === 'block') {
                closeDrillDownModal();
            }
            if (elements.metricsModal.style.display === 'block') {
                closeMetricsModal();
            }
            if (document.getElementById('action-plan-modal').style.display === 'block') {
                closeActionPlan();
            }
        }
    });
    
    // Add metrics overview button to header
    addMetricsOverviewButton();
    
    // Add network overview button event listener
    const networkOverviewBtn = document.getElementById('network-overview-btn');
    if (networkOverviewBtn) {
        networkOverviewBtn.addEventListener('click', () => {
            console.log('Network Overview button clicked');
            window.location.href = 'overview.html';
        });
    }
    
    // Add event delegation for AI Action Plan buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('ai-plan-btn')) {
            const metricName = e.target.getAttribute('data-metric');
            if (metricName) {
                generateActionPlan(metricName);
            }
        }
    });
}

// Handle YMCA selection change
async function handleYMCAChange() {
    const selectedYMCA = elements.ymcaSelect.value;
    console.log('handleYMCAChange called with selectedYMCA:', selectedYMCA);
    
    if (!selectedYMCA) {
        console.error('No YMCA selected');
        return;
    }
    
    try {
        console.log('Loading performance data for YMCA:', selectedYMCA);
        
        // Show loading state
        showLoadingState();
        
        // Load performance data from backend API
        if (window.apiService) {
            try {
                console.log('Loading performance data from backend API...');
                const performanceData = await window.apiService.getOrganizationPerformance(selectedYMCA);
                if (performanceData) {
                    // Transform the data to match expected format
                    const transformedData = window.apiService.transformApiDataToLegacyFormat([performanceData]);
                    currentData = transformedData[0];
                    console.log('✅ Performance data loaded successfully from backend API:', currentData.name);
                    hideLoadingState();
                    renderDashboard();
                    
                    // Dispatch event to notify AI advisory system of YMCA change
                    const ymcaChangeEvent = new CustomEvent('ymcaSelected', {
                        detail: currentData
                    });
                    document.dispatchEvent(ymcaChangeEvent);
                    
                    return;
                } else {
                    throw new Error('No performance data available from backend API');
                }
            } catch (apiError) {
                console.error('Backend API failed:', apiError);
                hideLoadingState();
                return;
            }
        } else {
            console.error('API service not available');
            hideLoadingState();
            return;
        }
    } catch (error) {
        console.error('Error loading YMCA data:', error);
        hideLoadingState();
    }
}

// Render the main dashboard
function renderDashboard() {
    console.log('renderDashboard called, currentData:', currentData);
    
    if (!currentData) {
        console.error('No currentData available for rendering');
        return;
    }
    
    console.log('Rendering dashboard for:', currentData.name);
    renderPerformanceOverview();
    renderMetrics();
    renderResources();
    console.log('Dashboard rendering complete');
}

// Render performance overview section
function renderPerformanceOverview() {
    elements.totalPoints.textContent = currentData.totalPoints;
    elements.supportDesignation.textContent = currentData.overallSupportDesignation;
    
    // Update operational and financial scores
    const operationalScore = currentData.performanceSnapshot.operationalPerformance.totalPoints;
    const financialScore = currentData.performanceSnapshot.financialPerformance.totalPoints;
    
    // Get member count from organization data or use default
    const memberCount = currentData.organization?.memberCount || 5000; // Default member count
    
    // Update DOM elements
    document.getElementById('operational-score').textContent = operationalScore;
    document.getElementById('financial-score').textContent = financialScore;
    document.getElementById('member-number').textContent = memberCount.toLocaleString();
    
    // Update support designation styling
    const isYUSASupport = currentData.overallSupportDesignation === 'Y-USA Support';
    elements.supportDesignation.className = `support-badge ${isYUSASupport ? 'yusa' : 'independent'}`;
    elements.supportDesignation.textContent = currentData.overallSupportDesignation;
}

// Render metrics sections
function renderMetrics() {
    renderMetricCategory('operational', currentData.performanceSnapshot.operationalPerformance);
    renderMetricCategory('financial', currentData.performanceSnapshot.financialPerformance);
}

// Render a specific metric category
function renderMetricCategory(type, categoryData) {
    const container = type === 'operational' ? elements.operationalMetrics : elements.financialMetrics;
    
    container.innerHTML = categoryData.metrics.map(metric => `
        <div class="metric-item ${metric.performance}" 
             onclick="showMetricDetails('${type}', '${metric.name}')">
            <span class="metric-name">${metric.name}</span>
            <span class="metric-points">${metric.points}</span>
        </div>
    `).join('');
    
    // Add click event listeners after rendering
    container.querySelectorAll('.metric-item').forEach((item, index) => {
        const metric = categoryData.metrics[index];
        item.addEventListener('click', () => {
            showMetricDetails(type, metric.name);
        });
    });
    
    // Update category summary badge
    const categorySummary = container.parentElement.querySelector('.category-summary .support-badge');
    if (categorySummary) {
        const isYUSASupport = categoryData.supportDesignation === 'Y-USA Support';
        categorySummary.className = `support-badge ${isYUSASupport ? 'yusa' : 'independent'}`;
        categorySummary.textContent = categoryData.supportDesignation;
    }
}

// Render suggested resources
function renderResources() {
    console.log('renderResources called, currentData:', currentData);
    
    if (!currentData) {
        console.error('currentData is null in renderResources');
        return;
    }
    
    // Generate suggestedResources if missing (for real backend API data)
    let suggestedResources = currentData.suggestedResources;
    if (!suggestedResources) {
        console.log('⚠️ No suggestedResources found, generating dynamically...');
        suggestedResources = generateSuggestedResources(currentData.performanceSnapshot);
        console.log('✅ Generated suggestedResources:', suggestedResources);
    }
    
    // Create resource rows for each metric that needs support
    const resourceRows = [];
    
    // Get all low-performing metrics and show their resources
    const lowPerformingMetrics = [];
    
    // Check operational metrics with safety checks
    if (currentData.performanceSnapshot && currentData.performanceSnapshot.operationalPerformance && currentData.performanceSnapshot.operationalPerformance.metrics) {
        console.log('Operational metrics found:', currentData.performanceSnapshot.operationalPerformance.metrics);
        currentData.performanceSnapshot.operationalPerformance.metrics.forEach((metric, index) => {
            console.log(`Operational metric ${index}:`, metric);
            if (metric && metric.name && metric.performance === 'low') {
                lowPerformingMetrics.push({
                    name: metric.name,
                    resources: suggestedResources[metric.name.replace(/\s+/g, '')] || suggestedResources.staffRetention
                });
            } else if (metric && !metric.name) {
                console.warn(`Operational metric ${index} missing 'name' property:`, metric);
            }
        });
    } else {
        console.warn('No operational metrics found in currentData.performanceSnapshot');
    }
    
    // Check financial metrics with safety checks
    if (currentData.performanceSnapshot && currentData.performanceSnapshot.financialPerformance && currentData.performanceSnapshot.financialPerformance.metrics) {
        console.log('Financial metrics found:', currentData.performanceSnapshot.financialPerformance.metrics);
        currentData.performanceSnapshot.financialPerformance.metrics.forEach((metric, index) => {
            console.log(`Financial metric ${index}:`, metric);
            if (metric && metric.name && metric.performance === 'low') {
                lowPerformingMetrics.push({
                    name: metric.name,
                    resources: suggestedResources[metric.name.replace(/\s+/g, '')] || suggestedResources.financialMetrics
                });
            } else if (metric && !metric.name) {
                console.warn(`Financial metric ${index} missing 'name' property:`, metric);
            }
        });
    } else {
        console.warn('No financial metrics found in currentData.performanceSnapshot');
    }
    
    // If no low-performing metrics, show Staff Retention as default
    if (lowPerformingMetrics.length === 0) {
        lowPerformingMetrics.push({
            name: 'Staff Retention',
            resources: suggestedResources.staffRetention
        });
    }
    
    console.log('Low performing metrics found:', lowPerformingMetrics);
    console.log('resourcesContent element:', elements.resourcesContent);
    
    // Create resource rows for each low-performing metric
    lowPerformingMetrics.forEach(metric => {
        resourceRows.push(createResourceRow(metric.name, metric.resources));
    });
    
    console.log('Resource rows created:', resourceRows.length);
    elements.resourcesContent.innerHTML = resourceRows.join('');
}

// Generate AI analysis for a metric
function generateAIAnalysis(metricName, resources, highlightedDirect, highlightedShared) {
    const analysisTemplates = {
        'Staff Retention': {
            low: "High turnover detected in Q3, linked to compensation gaps and limited career development opportunities.",
            moderate: "Moderate retention challenges identified, primarily in mid-level positions.",
            high: "Strong retention rates maintained through competitive benefits and growth opportunities."
        },
        'Membership Growth': {
            low: "Growth rate below industry benchmarks, indicating need for enhanced member acquisition strategies.",
            moderate: "Steady growth trajectory with opportunities for acceleration through targeted campaigns.",
            high: "Exceptional growth performance, exceeding regional benchmarks by 15%."
        },
        'For All Score': {
            low: "Diversity initiatives require strengthening, particularly in leadership representation.",
            moderate: "Good progress on inclusion metrics, with room for improvement in community engagement.",
            high: "Outstanding commitment to diversity and inclusion, serving as a model for the network."
        },
        'Risk Mitigation': {
            low: "Critical gaps identified in safety protocols and compliance procedures.",
            moderate: "Standard risk management practices in place, with opportunities for enhancement.",
            high: "Comprehensive risk management framework exceeds industry standards."
        },
        'Governance': {
            low: "Board effectiveness needs improvement, particularly in strategic oversight and community engagement.",
            moderate: "Solid governance practices with opportunities for enhanced strategic alignment.",
            high: "Exemplary governance practices with strong board-CEO partnership and community impact."
        },
        'Engagement': {
            low: "Member and staff engagement scores indicate need for improved communication and program development.",
            moderate: "Good engagement levels with potential for enhancement through targeted initiatives.",
            high: "Exceptional engagement across all stakeholder groups, driving strong community impact."
        },
        'Months of Liquidity': {
            low: "Critical cash flow challenges detected, requiring immediate financial intervention.",
            moderate: "Adequate liquidity maintained with opportunities for improved cash management.",
            high: "Strong financial position with robust cash reserves exceeding industry standards."
        },
        'Operating Margin': {
            low: "Profitability concerns identified, requiring cost optimization and revenue enhancement strategies.",
            moderate: "Stable operating performance with opportunities for margin improvement.",
            high: "Excellent profitability performance, exceeding budget targets by 8%."
        },
        'Debt Ratio': {
            low: "High debt levels pose significant financial risk, requiring debt reduction strategies.",
            moderate: "Manageable debt levels with opportunities for optimization.",
            high: "Conservative debt management approach provides strong financial flexibility."
        },
        'Operating Revenue Mix': {
            low: "Over-reliance on single revenue source creates financial vulnerability.",
            moderate: "Good revenue diversification with opportunities for further balance.",
            high: "Well-diversified revenue streams provide strong financial stability."
        },
        'Charitable Revenue': {
            low: "Fundraising performance below targets, indicating need for enhanced donor engagement.",
            moderate: "Steady charitable giving with opportunities for growth through strategic campaigns.",
            high: "Exceptional fundraising performance, exceeding annual targets by 12%."
        }
    };
    
    // Determine performance level based on highlighted resources (simplified logic)
    const performanceLevel = highlightedDirect.length > 0 || highlightedShared.length > 0 ? 'low' : 'moderate';
    
    const template = analysisTemplates[metricName] || {
        low: "Performance analysis indicates areas for improvement in this metric.",
        moderate: "Good performance with opportunities for enhancement.",
        high: "Strong performance in this area."
    };
    
    return template[performanceLevel] || template.low;
}

// Create a resource row with AI analysis
function createResourceRow(metricName, resources) {
    const highlightedDirect = resources.highlighted?.directDelivery || [];
    const highlightedShared = resources.highlighted?.sharedServices || [];
    
    // Generate AI analysis based on metric performance
    const aiAnalysis = generateAIAnalysis(metricName, resources, highlightedDirect, highlightedShared);
    
    // Get performance level for color coding
    const performanceLevel = getMetricPerformanceLevel(metricName);
    console.log('Metric:', metricName, 'Performance Level:', performanceLevel);
    
    return `
        <div class="resource-row">
            <div class="resource-metric-name ${performanceLevel}">
                <strong>${metricName}</strong>
            </div>
            <div class="ai-analysis">
                <div class="ai-insight">
                    <span class="ai-icon">🤖</span>
                    <span class="ai-text">${aiAnalysis}</span>
                </div>
            </div>
            <div class="self-directed">
                <div class="ai-action-plan">
                    <button class="ai-plan-btn" data-metric="${metricName}">
                        📋 AI Action Plan
                    </button>
                </div>
            </div>
            <div class="network-resources">
                <div class="direct-delivery">
                    ${resources.networkSupported.directDelivery.map(resource => 
                        `<div class="resource-item ${highlightedDirect.includes(resource) ? 'highlighted' : 'standard'}">${resource}</div>`
                    ).join('')}
                </div>
                <div class="shared-services">
                    ${resources.networkSupported.sharedServices.map(resource => 
                        `<div class="resource-item ${highlightedShared.includes(resource) ? 'highlighted' : 'standard'}">${resource}</div>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
}

// Generate comprehensive AI action plan for a metric
function generateActionPlan(metricName) {
    console.log('Generating AI Action Plan for:', metricName);
    
    // Get current metric data
    const metricData = getMetricData(metricName);
    const performanceLevel = getMetricPerformanceLevel(metricName);
    
    // Generate AI advisor analysis
    const advisorAnalysis = generateAdvisorAnalysis(metricName, metricData, performanceLevel);
    
    // Show action plan modal
    const modal = document.getElementById('action-plan-modal');
    const metricAnalysisDisplay = document.getElementById('metric-analysis-display');
    const aiRecommendations = document.getElementById('ai-recommendations');
    const immediateActions = document.getElementById('immediate-actions');
    const shortTermActions = document.getElementById('short-term-actions');
    const longTermActions = document.getElementById('long-term-actions');
    const successMetrics = document.getElementById('success-metrics');
    
    // Populate metric analysis
    metricAnalysisDisplay.innerHTML = `
        <div class="metric-analysis">
            <p><strong>Current Performance:</strong> ${performanceLevel.toUpperCase()}</p>
            <p><strong>Current Score:</strong> ${metricData.points}/${metricData.maxPoints}</p>
            <p><strong>Description:</strong> ${metricData.description}</p>
            <p><strong>Analysis:</strong> ${advisorAnalysis.analysis}</p>
        </div>
    `;
    
    // Populate AI recommendations
    aiRecommendations.innerHTML = `
        <div class="ai-recommendations-content">
            <p><strong>Key Insights:</strong></p>
            <ul>
                ${advisorAnalysis.insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
        </div>
    `;
    
    // Populate action timeline
    immediateActions.innerHTML = `
        <ul>
            ${advisorAnalysis.immediate.map(action => `<li>${action}</li>`).join('')}
        </ul>
    `;
    
    shortTermActions.innerHTML = `
        <ul>
            ${advisorAnalysis.shortTerm.map(action => `<li>${action}</li>`).join('')}
        </ul>
    `;
    
    longTermActions.innerHTML = `
        <ul>
            ${advisorAnalysis.longTerm.map(action => `<li>${action}</li>`).join('')}
        </ul>
    `;
    
    // Populate success metrics
    successMetrics.innerHTML = `
        <div class="success-metrics-content">
            <ul>
                ${advisorAnalysis.successMetrics.map(metric => `<li>${metric}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Focus management
    modal.focus();
}

// Get metric data for analysis
function getMetricData(metricName) {
    // Check operational metrics
    const operationalMetric = currentData.performanceSnapshot.operationalPerformance.metrics.find(
        m => m.name === metricName
    );
    if (operationalMetric) {
        return operationalMetric;
    }
    
    // Check financial metrics
    const financialMetric = currentData.performanceSnapshot.financialPerformance.metrics.find(
        m => m.name === metricName
    );
    if (financialMetric) {
        return financialMetric;
    }
    
    // Default fallback
    return {
        name: metricName,
        points: 0,
        maxPoints: 4,
        performance: 'low',
        description: 'Metric analysis not available'
    };
}

// Generate comprehensive advisor analysis
function generateAdvisorAnalysis(metricName, metricData, performanceLevel) {
    // Calculate performance percentage for dynamic recommendations
    const performancePercentage = Math.round((metricData.points / metricData.maxPoints) * 100);
    
    // Dynamic analysis based on actual performance data
    const getDynamicAnalysis = (metricName, performancePercentage, performanceLevel) => {
        const baseAnalysis = {
            'Staff Retention': {
                low: `Critical staff retention issues detected with ${performancePercentage}% performance score. Immediate intervention required to prevent further talent loss.`,
                moderate: `Staff retention at ${performancePercentage}% indicates room for improvement. Focus on enhancing workplace culture and career development.`,
                high: `Strong staff retention performance at ${performancePercentage}%. Maintain current practices while exploring enhancement opportunities.`
            },
            'Membership Growth': {
                low: `Membership growth critically low at ${performancePercentage}%. Requires immediate strategic intervention for market expansion.`,
                moderate: `Membership growth at ${performancePercentage}% shows potential. Strategic improvements can accelerate growth trajectory.`,
                high: `Excellent membership growth at ${performancePercentage}%. Focus on sustaining momentum and optimizing processes.`
            },
            'Months of Liquidity': {
                low: `Critical cash flow situation with ${performancePercentage}% liquidity score. Immediate financial intervention required.`,
                moderate: `Liquidity at ${performancePercentage}% indicates need for improved cash management strategies.`,
                high: `Strong liquidity position at ${performancePercentage}%. Maintain financial discipline and explore growth opportunities.`
            },
            'Operating Margin': {
                low: `Profitability concerns with ${performancePercentage}% margin score. Cost optimization and revenue enhancement needed.`,
                moderate: `Operating margin at ${performancePercentage}% shows potential for improvement through strategic initiatives.`,
                high: `Excellent profitability at ${performancePercentage}%. Focus on sustaining performance and exploring growth.`
            }
        };
        
        return baseAnalysis[metricName]?.[performanceLevel] || 
               `Performance analysis for ${metricName} at ${performanceLevel} level (${performancePercentage}% score).`;
    };
    
    // Dynamic insights based on performance level
    const getDynamicInsights = (metricName, performanceLevel, performancePercentage) => {
        const insights = {
            'Staff Retention': {
                low: [
                    `Current retention rate of ${performancePercentage}% indicates systemic issues requiring immediate attention`,
                    "High turnover costs suggest compensation and benefits gaps compared to market standards",
                    "Limited career advancement opportunities contributing to staff dissatisfaction",
                    "Workplace culture and engagement programs need strengthening"
                ],
                moderate: [
                    `Retention rate of ${performancePercentage}% shows room for improvement`,
                    "Career development pathways need enhancement",
                    "Employee engagement programs could be more comprehensive",
                    "Compensation benchmarking against market standards recommended"
                ],
                high: [
                    `Strong retention rate of ${performancePercentage}% demonstrates effective practices`,
                    "Focus on maintaining current successful strategies",
                    "Consider sharing best practices with other YMCAs",
                    "Explore opportunities for further enhancement"
                ]
            },
            'Membership Growth': {
                low: [
                    `Growth rate of ${performancePercentage}% indicates significant market penetration opportunities`,
                    "Member acquisition strategies need comprehensive review",
                    "Retention programs may not be effectively engaging current members",
                    "Market positioning and competitive analysis required"
                ],
                moderate: [
                    `Growth rate of ${performancePercentage}% shows steady progress with room for acceleration`,
                    "Targeted marketing campaigns could improve acquisition rates",
                    "Member onboarding and engagement programs need enhancement",
                    "Pricing strategy optimization may boost growth"
                ],
                high: [
                    `Excellent growth rate of ${performancePercentage}% demonstrates strong market position`,
                    "Focus on sustaining current successful strategies",
                    "Consider expansion opportunities in underserved areas",
                    "Optimize processes to support continued growth"
                ]
            }
        };
        
        return insights[metricName]?.[performanceLevel] || [
            `Current performance at ${performancePercentage}% indicates areas for improvement`,
            "Strategic interventions needed to enhance outcomes",
            "Data-driven approach recommended for optimization"
        ];
    };
    
    // Dynamic action recommendations based on performance
    const getDynamicActions = (metricName, performanceLevel, performancePercentage) => {
        const actions = {
            'Staff Retention': {
                low: {
                    immediate: [
                        `Conduct comprehensive exit interviews to identify root causes (target: improve by ${100 - performancePercentage}%)`,
                        "Review compensation benchmarks against local market standards",
                        "Implement immediate recognition and rewards programs",
                        "Establish open communication channels for staff feedback"
                    ],
                    shortTerm: [
                        "Develop career development pathways for all staff levels",
                        "Create retention-focused manager training program",
                        "Implement competitive benefits package review",
                        "Establish regular employee engagement surveys"
                    ],
                    longTerm: [
                        "Build comprehensive talent development pipeline",
                        "Create culture of continuous learning and growth",
                        "Implement succession planning and leadership development",
                        "Establish long-term compensation strategy aligned with market"
                    ]
                },
                moderate: {
                    immediate: [
                        "Enhance existing recognition and rewards programs",
                        "Conduct staff satisfaction surveys to identify improvement areas",
                        "Review career advancement opportunities",
                        "Strengthen manager training on retention strategies"
                    ],
                    shortTerm: [
                        "Expand career development programs",
                        "Implement enhanced employee engagement initiatives",
                        "Optimize benefits package based on staff feedback",
                        "Develop retention-focused performance metrics"
                    ],
                    longTerm: [
                        "Build sustainable talent development framework",
                        "Create comprehensive employee value proposition",
                        "Establish data-driven retention strategies",
                        "Develop leadership pipeline programs"
                    ]
                },
                high: {
                    immediate: [
                        "Document current successful retention practices",
                        "Conduct best practice analysis for continuous improvement",
                        "Share successful strategies with other YMCAs",
                        "Identify opportunities for further enhancement"
                    ],
                    shortTerm: [
                        "Optimize existing retention programs",
                        "Develop advanced career development pathways",
                        "Implement predictive retention analytics",
                        "Create succession planning frameworks"
                    ],
                    longTerm: [
                        "Establish industry-leading retention practices",
                        "Develop comprehensive talent management strategy",
                        "Create sustainable competitive advantages",
                        "Build organizational capacity for growth"
                    ]
                }
            }
        };
        
        return actions[metricName]?.[performanceLevel] || {
            immediate: [
                "Analyze current performance data and trends",
                "Identify key improvement areas and opportunities",
                "Develop immediate action timeline and priorities",
                "Establish baseline measurements for tracking"
            ],
            shortTerm: [
                "Implement targeted improvements and interventions",
                "Monitor progress and adjust strategies as needed",
                "Build stakeholder support and engagement",
                "Develop measurement and reporting frameworks"
            ],
            longTerm: [
                "Establish sustainable practices and processes",
                "Create comprehensive measurement frameworks",
                "Develop long-term strategic vision and planning",
                "Build organizational capacity for continuous improvement"
            ]
        };
    };
    
    // Dynamic success metrics based on current performance
    const getDynamicSuccessMetrics = (metricName, performanceLevel, performancePercentage) => {
        const targetImprovement = performanceLevel === 'low' ? 50 : performanceLevel === 'moderate' ? 25 : 10;
        const targetScore = Math.min(100, performancePercentage + targetImprovement);
        
        return [
            `Improve ${metricName} performance from ${performancePercentage}% to ${targetScore}% within 6 months`,
            `Establish baseline measurements and tracking systems for ${metricName}`,
            `Achieve target performance levels within 12 months`,
            `Create sustainable improvement processes for long-term success`
        ];
    };
    
    // Generate dynamic analysis
    const analysis = getDynamicAnalysis(metricName, performancePercentage, performanceLevel);
    const insights = getDynamicInsights(metricName, performanceLevel, performancePercentage);
    const actions = getDynamicActions(metricName, performanceLevel, performancePercentage);
    const successMetrics = getDynamicSuccessMetrics(metricName, performanceLevel, performancePercentage);
    
    return {
        analysis,
        insights,
        immediate: actions.immediate,
        shortTerm: actions.shortTerm,
        longTerm: actions.longTerm,
        successMetrics
    };
}

// Close action plan modal
function closeActionPlan() {
    const modal = document.getElementById('action-plan-modal');
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Export action plan
function exportActionPlan() {
    const metricName = document.querySelector('#action-plan-modal h2').textContent.replace('🤖 AI Advisor Action Plan', '').trim();
    const content = document.getElementById('action-plan-content').innerText;
    
    // Create downloadable file
    const blob = new Blob([`AI Action Plan: ${metricName}\n\n${content}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Action_Plan_${metricName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log(`Action plan exported for ${metricName}`);
}

// Share action plan with team
function shareActionPlan() {
    const metricName = document.querySelector('#action-plan-modal h2').textContent.replace('🤖 AI Advisor Action Plan', '').trim();
    
    // Placeholder for sharing functionality
    // In a real implementation, this could integrate with email, Slack, etc.
    alert(`Sharing action plan for ${metricName} with team members`);
    
    // Example: Copy to clipboard
    const content = document.getElementById('action-plan-content').innerText;
    navigator.clipboard.writeText(`AI Action Plan: ${metricName}\n\n${content}`).then(() => {
        console.log('Action plan copied to clipboard');
    });
}

// Show self-directed resources for a metric
function showSelfDirectedResources(metricName) {
    console.log('Showing self-directed resources for:', metricName);
    
    // Get metric data for context
    const metricData = getMetricData(metricName);
    const performanceLevel = getMetricPerformanceLevel(metricName);
    
    // Generate resource links based on metric and performance
    const resources = generateSelfDirectedResources(metricName, metricData, performanceLevel);
    
    // Show resources in a modal or new window
    const modal = document.getElementById('action-plan-modal');
    const metricAnalysisDisplay = document.getElementById('metric-analysis-display');
    const aiRecommendations = document.getElementById('ai-recommendations');
    const immediateActions = document.getElementById('immediate-actions');
    const shortTermActions = document.getElementById('short-term-actions');
    const longTermActions = document.getElementById('long-term-actions');
    const successMetrics = document.getElementById('success-metrics');
    
    // Update modal title
    modal.querySelector('h2').textContent = `📚 Self-Directed Resources: ${metricName}`;
    
    // Populate with self-directed resources
    metricAnalysisDisplay.innerHTML = `
        <div class="metric-analysis">
            <p><strong>Current Performance:</strong> ${performanceLevel.toUpperCase()}</p>
            <p><strong>Current Score:</strong> ${metricData.points}/${metricData.maxPoints}</p>
            <p><strong>Description:</strong> ${metricData.description}</p>
            <p><strong>Resource Focus:</strong> ${resources.focus}</p>
        </div>
    `;
    
    aiRecommendations.innerHTML = `
        <div class="ai-recommendations-content">
            <p><strong>Available Resources:</strong></p>
            <ul>
                ${resources.availableResources.map(resource => `<li>${resource}</li>`).join('')}
            </ul>
        </div>
    `;
    
    immediateActions.innerHTML = `
        <ul>
            ${resources.immediateResources.map(resource => `<li>${resource}</li>`).join('')}
        </ul>
    `;
    
    shortTermActions.innerHTML = `
        <ul>
            ${resources.learningPaths.map(path => `<li>${path}</li>`).join('')}
        </ul>
    `;
    
    longTermActions.innerHTML = `
        <ul>
            ${resources.certifications.map(cert => `<li>${cert}</li>`).join('')}
        </ul>
    `;
    
    successMetrics.innerHTML = `
        <div class="success-metrics-content">
            <ul>
                ${resources.successMetrics.map(metric => `<li>${metric}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    modal.focus();
}

// Generate self-directed resources for a metric
function generateSelfDirectedResources(metricName, metricData, performanceLevel) {
    const resourceTemplates = {
        'Staff Retention': {
            focus: "Employee engagement, retention strategies, and workplace culture development",
            availableResources: [
                "Y-USA HR Best Practices Toolkit",
                "Employee Engagement Survey Templates",
                "Retention Strategy Playbook",
                "Compensation Benchmarking Guide",
                "Career Development Framework"
            ],
            immediateResources: [
                "Download Exit Interview Templates",
                "Access Compensation Benchmarking Tools",
                "Review Employee Recognition Programs",
                "Get Retention Analytics Dashboard"
            ],
            learningPaths: [
                "Complete 'Building a Retention Culture' Course",
                "Enroll in 'Strategic HR Management' Program",
                "Join 'Employee Engagement' Community",
                "Access 'Leadership Development' Resources"
            ],
            certifications: [
                "Y-USA HR Leadership Certification",
                "Employee Engagement Specialist",
                "Organizational Development Professional",
                "Strategic HR Management Certificate"
            ],
            successMetrics: [
                "Complete 3 self-directed learning modules",
                "Implement 2 new retention strategies",
                "Achieve 20% improvement in engagement scores",
                "Develop comprehensive retention plan"
            ]
        },
        'Membership Growth': {
            focus: "Member acquisition, retention, and growth strategies",
            availableResources: [
                "Y-USA Membership Growth Toolkit",
                "Market Analysis Templates",
                "Member Onboarding Best Practices",
                "Marketing Campaign Templates",
                "Growth Strategy Framework"
            ],
            immediateResources: [
                "Download Market Analysis Tools",
                "Access Member Survey Templates",
                "Review Marketing Campaign Examples",
                "Get Growth Analytics Dashboard"
            ],
            learningPaths: [
                "Complete 'Strategic Membership Growth' Course",
                "Enroll in 'Digital Marketing for YMCAs' Program",
                "Join 'Member Engagement' Community",
                "Access 'Market Development' Resources"
            ],
            certifications: [
                "Y-USA Membership Growth Specialist",
                "Digital Marketing for Nonprofits",
                "Strategic Planning Professional",
                "Community Engagement Certificate"
            ],
            successMetrics: [
                "Complete 4 growth strategy modules",
                "Implement 3 new acquisition strategies",
                "Achieve 15% membership growth",
                "Develop comprehensive growth plan"
            ]
        },
        'Months of Liquidity': {
            focus: "Financial management, cash flow optimization, and fiscal responsibility",
            availableResources: [
                "Y-USA Financial Management Toolkit",
                "Cash Flow Analysis Templates",
                "Budget Planning Tools",
                "Financial Reporting Templates",
                "Risk Management Framework"
            ],
            immediateResources: [
                "Download Cash Flow Analysis Tools",
                "Access Budget Planning Templates",
                "Review Financial Reporting Examples",
                "Get Financial Analytics Dashboard"
            ],
            learningPaths: [
                "Complete 'Financial Management for YMCAs' Course",
                "Enroll in 'Cash Flow Optimization' Program",
                "Join 'Financial Leadership' Community",
                "Access 'Risk Management' Resources"
            ],
            certifications: [
                "Y-USA Financial Management Specialist",
                "Nonprofit Financial Leadership",
                "Risk Management Professional",
                "Strategic Financial Planning Certificate"
            ],
            successMetrics: [
                "Complete 3 financial management modules",
                "Implement 2 new cash management strategies",
                "Achieve 3+ months of liquidity",
                "Develop comprehensive financial plan"
            ]
        }
    };
    
    const template = resourceTemplates[metricName] || {
        focus: `Self-directed learning and improvement for ${metricName}`,
        availableResources: [
            "Y-USA Best Practices Library",
            "Professional Development Resources",
            "Industry Benchmarking Tools",
            "Strategic Planning Templates",
            "Performance Improvement Guides"
        ],
        immediateResources: [
            "Download relevant templates and tools",
            "Access benchmarking data",
            "Review best practices",
            "Get performance analytics"
        ],
        learningPaths: [
            "Complete relevant Y-USA courses",
            "Enroll in professional development programs",
            "Join industry communities",
            "Access specialized resources"
        ],
        certifications: [
            "Y-USA Professional Certifications",
            "Industry-specific credentials",
            "Leadership development programs",
            "Strategic planning certificates"
        ],
        successMetrics: [
            "Complete 2-3 learning modules",
            "Implement improvement strategies",
            "Achieve measurable performance gains",
            "Develop comprehensive action plan"
        ]
    };
    
    return template;
}

// Note: Functions are now accessed via event listeners instead of global scope

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    init();
});

// Show metric details in drill-down modal
function showMetricDetails(category, metricName) {
    console.log('showMetricDetails called with:', category, metricName);
    console.log('currentData:', currentData);
    
    const categoryData = currentData.performanceSnapshot[category === 'operational' ? 'operationalPerformance' : 'financialPerformance'];
    const metric = categoryData.metrics.find(m => m.name === metricName);
    
    if (!metric) {
        console.log('Metric not found:', metricName);
        return;
    }
    
    elements.modalTitle.textContent = `${metricName} Details`;
    
    const performancePercentage = Math.round((metric.points / metric.maxPoints) * 100);
    const performanceLevel = getPerformanceLevel(performancePercentage);
    
    elements.modalBody.innerHTML = `
        <div class="metric-details">
            <div class="metric-header">
                <h3>${metricName}</h3>
                <div class="metric-score">
                    <span class="score">${metric.points}</span>
                    <span class="max-score">/ ${metric.maxPoints} points</span>
                </div>
            </div>
            
            <div class="performance-indicator">
                <div class="performance-bar">
                    <div class="performance-fill ${performanceLevel}" style="width: ${performancePercentage}%"></div>
                </div>
                <span class="performance-text">${performanceLevel.toUpperCase()} PERFORMANCE (${performancePercentage}%)</span>
            </div>
            
            <div class="metric-description">
                <h4>What This Measures</h4>
                <p>${metric.description}</p>
                <div class="performance-explanation">
                    <h5>Performance Analysis</h5>
                    <p>Your ${metricName} score of ${metric.points} out of ${metric.maxPoints} points indicates ${performanceLevel} performance. This ${performanceLevel} level suggests ${getPerformanceExplanation(performanceLevel)}.</p>
                </div>
            </div>
            
            <div class="metric-recommendations">
                <h4>Strategic Recommendations</h4>
                <p class="recommendations-intro">Based on your current performance level, we recommend the following strategic actions:</p>
                <ul>
                    ${getMetricRecommendations(metricName, performanceLevel)}
                </ul>
            </div>
            
            <div class="metric-resources">
                <h4>Available Resources & Support</h4>
                <p class="resources-intro">The following resources are available to help improve your ${metricName} performance:</p>
                <div class="resources-grid">
                    ${getMetricResources(metricName)}
                </div>
            </div>
            
            <div class="metric-next-steps">
                <h4>Next Steps</h4>
                <div class="next-steps-content">
                    <p><strong>Immediate Actions (Next 30 Days):</strong></p>
                    <ul>
                        <li>Review the recommended resources above</li>
                        <li>Schedule a consultation with your Y-USA representative</li>
                        <li>Identify 2-3 priority improvement areas</li>
                        <li>Develop an action plan with specific timelines</li>
                    </ul>
                    
                    <p><strong>Short-term Goals (3-6 Months):</strong></p>
                    <ul>
                        <li>Implement at least 3 recommendations from the list above</li>
                        <li>Track progress monthly and adjust strategies as needed</li>
                        <li>Engage with peer YMCAs for best practice sharing</li>
                        <li>Participate in relevant training and development programs</li>
                    </ul>
                    
                    <p><strong>Long-term Vision (6-12 Months):</strong></p>
                    <ul>
                        <li>Achieve measurable improvement in ${metricName} performance</li>
                        <li>Establish sustainable processes and practices</li>
                        <li>Share successful strategies with other YMCAs</li>
                        <li>Position your Y as a model for excellence in this area</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    elements.drillDownModal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Focus the modal for accessibility
    elements.drillDownModal.focus();
    
    // Prevent focus from going to background elements
    elements.drillDownModal.addEventListener('focusout', (e) => {
        if (!elements.drillDownModal.contains(e.relatedTarget)) {
            elements.drillDownModal.focus();
        }
    });
}

// Get performance level based on percentage
function getPerformanceLevel(percentage) {
    if (percentage < 25) return 'low';
    if (percentage < 75) return 'moderate';
    return 'high';
}

// Get performance level for a specific metric
function getMetricPerformanceLevel(metricName) {
    // Check operational metrics
    const operationalMetric = currentData.performanceSnapshot.operationalPerformance.metrics.find(
        m => m.name === metricName
    );
    if (operationalMetric) {
        return operationalMetric.performance;
    }
    
    // Check financial metrics
    const financialMetric = currentData.performanceSnapshot.financialPerformance.metrics.find(
        m => m.name === metricName
    );
    if (financialMetric) {
        return financialMetric.performance;
    }
    
    return 'moderate'; // default fallback
}

// Get performance explanation
function getPerformanceExplanation(performanceLevel) {
    const explanations = {
        low: "significant improvement opportunities exist and immediate action is recommended to address critical gaps in performance",
        moderate: "solid foundation exists with room for enhancement and strategic improvements to reach excellence",
        high: "excellent performance that demonstrates strong practices and leadership in this area"
    };
    return explanations[performanceLevel] || explanations.moderate;
}

// Get metric recommendations
function getMetricRecommendations(metricName, performanceLevel) {
    const recommendations = {
        'Membership Growth': {
            low: [
                'Implement targeted marketing campaigns to attract new members',
                'Develop community outreach programs to increase awareness',
                'Review and optimize membership pricing strategies',
                'Create referral programs to encourage member recruitment',
                'Analyze demographic data to identify growth opportunities'
            ],
            moderate: [
                'Enhance member engagement programs to improve retention',
                'Develop strategic partnerships with local organizations',
                'Implement data-driven marketing initiatives',
                'Focus on member satisfaction and experience improvements'
            ],
            high: [
                'Maintain current successful growth strategies',
                'Share best practices with other YMCAs in the network',
                'Consider expansion opportunities in underserved areas',
                'Develop innovative programs to sustain growth momentum'
            ]
        },
        'Staff Retention': {
            low: [
                'Implement comprehensive staff retention strategies',
                'Conduct exit interviews to understand turnover reasons',
                'Develop career development programs and advancement opportunities',
                'Review and improve compensation and benefits packages',
                'Create a positive workplace culture and environment',
                'Provide regular training and professional development'
            ],
            moderate: [
                'Enhance employee engagement initiatives',
                'Provide additional training opportunities',
                'Implement recognition and reward programs',
                'Improve communication and feedback systems'
            ],
            high: [
                'Maintain current successful practices',
                'Share best practices with other YMCAs',
                'Continue investing in staff development',
                'Document and institutionalize retention strategies'
            ]
        },
        'For All Score': {
            low: [
                'Develop comprehensive diversity and inclusion training programs',
                'Implement inclusive hiring and promotion practices',
                'Create programs that serve diverse community needs',
                'Establish partnerships with diverse community organizations',
                'Review and update policies to ensure inclusivity'
            ],
            moderate: [
                'Enhance existing diversity initiatives',
                'Expand community outreach to underserved populations',
                'Implement regular diversity assessments and surveys',
                'Develop cultural competency training for staff'
            ],
            high: [
                'Maintain and document successful diversity practices',
                'Share inclusive programming models with other YMCAs',
                'Continue to innovate in diversity and inclusion',
                'Serve as a model for other organizations'
            ]
        },
        'Risk Mitigation': {
            low: [
                'Implement comprehensive risk assessment procedures',
                'Develop and enforce safety protocols for all programs',
                'Provide regular safety training for staff and volunteers',
                'Establish emergency response procedures',
                'Conduct regular facility and equipment inspections'
            ],
            moderate: [
                'Enhance existing risk management practices',
                'Implement additional safety measures in high-risk areas',
                'Provide advanced training for key staff members',
                'Regularly review and update safety protocols'
            ],
            high: [
                'Maintain exemplary safety standards',
                'Share best practices with other YMCAs',
                'Continue to innovate in risk management',
                'Serve as a safety model for the network'
            ]
        },
        'Governance': {
            low: [
                'Develop comprehensive board training and orientation programs',
                'Implement strategic planning processes',
                'Establish clear board roles and responsibilities',
                'Create effective board recruitment and succession planning',
                'Implement regular board performance assessments'
            ],
            moderate: [
                'Enhance existing governance practices',
                'Provide additional board development opportunities',
                'Implement more sophisticated strategic planning',
                'Strengthen board-staff communication'
            ],
            high: [
                'Maintain excellent governance practices',
                'Share governance best practices with other YMCAs',
                'Continue to innovate in board development',
                'Serve as a governance model for the network'
            ]
        },
        'Engagement': {
            low: [
                'Develop comprehensive engagement strategies for all stakeholders',
                'Implement regular feedback collection from members and staff',
                'Create volunteer recruitment and management programs',
                'Establish community partnership initiatives',
                'Develop staff engagement and recognition programs'
            ],
            moderate: [
                'Enhance existing engagement initiatives',
                'Implement more sophisticated feedback systems',
                'Expand volunteer and community programs',
                'Strengthen staff development and recognition'
            ],
            high: [
                'Maintain excellent engagement practices',
                'Share engagement models with other YMCAs',
                'Continue to innovate in stakeholder engagement',
                'Serve as an engagement model for the network'
            ]
        },
        'Months of Liquidity': {
            low: [
                'Develop comprehensive cash flow management strategies',
                'Review and optimize all operating expenses',
                'Explore additional revenue streams and fundraising opportunities',
                'Consider short-term financing options if necessary',
                'Implement strict budget controls and monitoring'
            ],
            moderate: [
                'Monitor cash flow regularly and proactively',
                'Build emergency reserves and contingency funds',
                'Optimize working capital and payment terms',
                'Develop long-term financial planning'
            ],
            high: [
                'Maintain strong financial position and reserves',
                'Consider strategic investments and expansion opportunities',
                'Share financial management best practices',
                'Continue to build financial strength'
            ]
        },
        'Operating Margin': {
            low: [
                'Analyze and optimize revenue streams',
                'Review and reduce operating expenses',
                'Implement cost control measures',
                'Develop new revenue-generating programs',
                'Consider pricing strategy adjustments'
            ],
            moderate: [
                'Continue to optimize revenue and expense management',
                'Implement more sophisticated financial analysis',
                'Develop strategic financial planning',
                'Monitor and improve operational efficiency'
            ],
            high: [
                'Maintain strong operational efficiency',
                'Share financial management best practices',
                'Consider strategic investments and expansion',
                'Continue to innovate in financial management'
            ]
        },
        'Debt Ratio': {
            low: [
                'Develop comprehensive debt management strategies',
                'Review and optimize debt structure',
                'Implement debt reduction plans',
                'Consider refinancing options if beneficial',
                'Develop long-term financial planning'
            ],
            moderate: [
                'Monitor debt levels and ratios regularly',
                'Implement prudent debt management practices',
                'Develop strategic debt reduction plans',
                'Maintain healthy debt-to-equity ratios'
            ],
            high: [
                'Maintain excellent debt management practices',
                'Share debt management best practices',
                'Consider strategic use of debt for growth',
                'Continue to optimize financial structure'
            ]
        },
        'Operating Revenue Mix': {
            low: [
                'Diversify revenue sources to reduce dependency',
                'Develop new program offerings and services',
                'Explore partnerships and collaborative opportunities',
                'Implement strategic pricing strategies',
                'Analyze and optimize current revenue streams'
            ],
            moderate: [
                'Continue to diversify revenue sources',
                'Implement more sophisticated revenue analysis',
                'Develop strategic revenue planning',
                'Monitor and optimize revenue mix'
            ],
            high: [
                'Maintain excellent revenue diversification',
                'Share revenue management best practices',
                'Continue to innovate in revenue generation',
                'Serve as a model for revenue management'
            ]
        },
        'Charitable Revenue': {
            low: [
                'Develop comprehensive fundraising strategies',
                'Implement donor cultivation and stewardship programs',
                'Create grant writing and management capabilities',
                'Establish corporate and foundation partnerships',
                'Develop community fundraising initiatives'
            ],
            moderate: [
                'Enhance existing fundraising programs',
                'Implement more sophisticated donor management',
                'Expand grant and partnership opportunities',
                'Strengthen community fundraising efforts'
            ],
            high: [
                'Maintain excellent fundraising practices',
                'Share fundraising best practices with other YMCAs',
                'Continue to innovate in charitable revenue generation',
                'Serve as a fundraising model for the network'
            ]
        }
    };
    
    const metricRecs = recommendations[metricName] || recommendations['Staff Retention'];
    return metricRecs[performanceLevel].map(rec => `<li>${rec}</li>`).join('');
}

// Get metric resources
function getMetricResources(metricName) {
    const resources = {
        'Membership Growth': {
            selfDirected: ['Marketing Strategy Toolkit', 'Member Recruitment Guide', 'Community Outreach Templates', 'Pricing Strategy Analysis Tools'],
            networkSupported: ['Peer Communities', 'Membership SDP', 'Marketing Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Marketing Support', 'YESS Resources', 'National Campaign Materials']
        },
        'Staff Retention': {
            selfDirected: ['HR Best Practices Guide', 'Retention Toolkit', 'Training Materials', 'Employee Engagement Surveys'],
            networkSupported: ['Peer Communities', 'HR SDP', 'Learning Centers', 'Activation Cohorts'],
            sharedServices: ['Y-USA Support', 'YESS Resources', 'HR Consulting Services']
        },
        'For All Score': {
            selfDirected: ['Diversity Training Materials', 'Inclusion Assessment Tools', 'Cultural Competency Guides', 'Community Partnership Templates'],
            networkSupported: ['Peer Communities', 'Diversity SDP', 'Learning Centers', 'Alliances'],
            sharedServices: ['Y-USA Diversity Support', 'YESS Resources', 'National Diversity Programs']
        },
        'Risk Mitigation': {
            selfDirected: ['Safety Protocol Templates', 'Risk Assessment Tools', 'Emergency Response Guides', 'Training Materials'],
            networkSupported: ['Peer Communities', 'Safety SDP', 'Learning Centers', 'Alliances'],
            sharedServices: ['Y-USA Safety Support', 'YESS Resources', 'National Safety Programs']
        },
        'Governance': {
            selfDirected: ['Board Development Guides', 'Strategic Planning Templates', 'Governance Assessment Tools', 'Policy Templates'],
            networkSupported: ['Peer Communities', 'Governance SDP', 'Learning Centers', 'Alliances'],
            sharedServices: ['Y-USA Governance Support', 'YESS Resources', 'National Governance Programs']
        },
        'Engagement': {
            selfDirected: ['Engagement Strategy Toolkit', 'Volunteer Management Guides', 'Community Partnership Templates', 'Feedback Collection Tools'],
            networkSupported: ['Peer Communities', 'Engagement SDP', 'Learning Centers', 'Alliances'],
            sharedServices: ['Y-USA Engagement Support', 'YESS Resources', 'National Engagement Programs']
        },
        'Months of Liquidity': {
            selfDirected: ['Financial Planning Tools', 'Cash Flow Templates', 'Budgeting Guides', 'Financial Analysis Tools'],
            networkSupported: ['Finance SDP', 'Peer Communities', 'Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Financial Support', 'YESS Resources', 'Financial Consulting Services']
        },
        'Operating Margin': {
            selfDirected: ['Revenue Optimization Tools', 'Cost Control Templates', 'Financial Analysis Guides', 'Pricing Strategy Tools'],
            networkSupported: ['Finance SDP', 'Peer Communities', 'Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Financial Support', 'YESS Resources', 'Financial Consulting Services']
        },
        'Debt Ratio': {
            selfDirected: ['Debt Management Tools', 'Financial Planning Templates', 'Debt Analysis Guides', 'Refinancing Calculators'],
            networkSupported: ['Finance SDP', 'Peer Communities', 'Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Financial Support', 'YESS Resources', 'Financial Consulting Services']
        },
        'Operating Revenue Mix': {
            selfDirected: ['Revenue Diversification Tools', 'Program Development Guides', 'Partnership Templates', 'Revenue Analysis Tools'],
            networkSupported: ['Finance SDP', 'Peer Communities', 'Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Financial Support', 'YESS Resources', 'Financial Consulting Services']
        },
        'Charitable Revenue': {
            selfDirected: ['Fundraising Strategy Toolkit', 'Grant Writing Guides', 'Donor Management Tools', 'Community Fundraising Templates'],
            networkSupported: ['Development SDP', 'Peer Communities', 'Alliances', 'Learning Centers'],
            sharedServices: ['Y-USA Development Support', 'YESS Resources', 'National Fundraising Programs']
        }
    };
    
    const metricResources = resources[metricName] || resources['Staff Retention'];
    
    return `
        <div class="resource-category">
            <h5>Self Directed</h5>
            <ul>${metricResources.selfDirected.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="resource-category">
            <h5>Network Supported</h5>
            <ul>${metricResources.networkSupported.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="resource-category">
            <h5>Shared Services</h5>
            <ul>${metricResources.sharedServices.map(r => `<li>${r}</li>`).join('')}</ul>
        </div>
    `;
}

// Add metrics overview button to header
function addMetricsOverviewButton() {
    const headerContent = document.querySelector('.header-content');
    const metricsButton = document.createElement('button');
    metricsButton.className = 'metrics-overview-btn';
    metricsButton.innerHTML = '<i class="fas fa-chart-line"></i> Metrics Overview';
    metricsButton.onclick = showMetricsOverview;
    
    headerContent.appendChild(metricsButton);
}

// Show metrics overview modal
function showMetricsOverview() {
    if (!metricsData) return;
    
    elements.metricsModalBody.innerHTML = `
        <div class="metrics-overview">
            <div class="metrics-section">
                <h3>${metricsData.existingCommonMetrics.category}</h3>
                <div class="metrics-section-content">
                    <h4>${metricsData.existingCommonMetrics.ceiMetrics.name}</h4>
                    ${metricsData.existingCommonMetrics.ceiMetrics.metrics.map(metric => `
                        <div class="metric-detail">
                            <span class="metric-detail-name">${metric.name}</span>
                            <span class="metric-detail-description">${metric.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="metrics-section">
                <h3>${metricsData.organizationalHealthAssessment.category}</h3>
                <div class="metrics-section-content">
                    <h4>${metricsData.organizationalHealthAssessment.operationalPerformance.name}</h4>
                    ${metricsData.organizationalHealthAssessment.operationalPerformance.metrics.map(metric => `
                        <div class="metric-detail">
                            <span class="metric-detail-name">${metric.name}</span>
                            <span class="metric-detail-description">${metric.description}</span>
                        </div>
                    `).join('')}
                    
                    <h4>${metricsData.organizationalHealthAssessment.financialPerformance.name}</h4>
                    ${metricsData.organizationalHealthAssessment.financialPerformance.metrics.map(metric => `
                        <div class="metric-detail">
                            <span class="metric-detail-name">${metric.name}</span>
                            <span class="metric-detail-description">${metric.description}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="metrics-section">
                <h3>${metricsData.updatedOrganizationalHealthAssessment.category}</h3>
                <div class="metrics-section-content">
                    <h4>${metricsData.updatedOrganizationalHealthAssessment.operationalPerformance.name}</h4>
                    ${metricsData.updatedOrganizationalHealthAssessment.operationalPerformance.metrics.map(metric => `
                        <div class="metric-detail">
                            <span class="metric-detail-name">${metric.name}</span>
                            <span class="metric-detail-weighting">${metric.weighting}</span>
                        </div>
                    `).join('')}
                    
                    <h4>${metricsData.updatedOrganizationalHealthAssessment.financialPerformance.name}</h4>
                    ${metricsData.updatedOrganizationalHealthAssessment.financialPerformance.metrics.map(metric => `
                        <div class="metric-detail">
                            <span class="metric-detail-name">${metric.name}</span>
                            <span class="metric-detail-weighting">${metric.weighting}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    elements.metricsModal.style.display = 'block';
    document.body.classList.add('modal-open');
}

// Close drill-down modal
function closeDrillDownModal() {
    elements.drillDownModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Close metrics modal
function closeMetricsModal() {
    elements.metricsModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}



// Add additional CSS for new elements
const additionalStyles = `
    .metrics-overview-btn {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s ease;
    }
    
    .metrics-overview-btn:hover {
        background: rgba(255,255,255,0.3);
    }
    
    .metric-details {
        max-width: 100%;
    }
    
    .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e1e5e9;
    }
    
    .metric-header h3 {
        color: #2c3e50;
        margin: 0;
    }
    
    .metric-score {
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
    }
    
    .score {
        font-size: 2rem;
        font-weight: 700;
        color: #2c3e50;
    }
    
    .max-score {
        font-size: 1rem;
        color: #6c757d;
    }
    
    .performance-indicator {
        margin-bottom: 1.5rem;
    }
    
    .performance-bar {
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    
    .performance-fill {
        height: 100%;
        transition: width 0.3s ease;
    }
    
    .performance-fill.low {
        background: #dc3545;
    }
    
    .performance-fill.moderate {
        background: #ffc107;
    }
    
    .performance-fill.high {
        background: #28a745;
    }
    
    .performance-text {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6c757d;
    }
    
    .metric-description,
    .metric-recommendations,
    .metric-resources {
        margin-bottom: 1.5rem;
    }
    
    .metric-description h4,
    .metric-recommendations h4,
    .metric-resources h4 {
        color: #2c3e50;
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
    }
    
    .metric-description p {
        color: #6c757d;
        line-height: 1.6;
    }
    
    .metric-recommendations ul {
        padding-left: 1.5rem;
    }
    
    .metric-recommendations li {
        margin-bottom: 0.5rem;
        color: #495057;
    }
    
    .resources-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .resource-category {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #e1e5e9;
    }
    
    .resource-category h5 {
        color: #2c3e50;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        font-weight: 600;
    }
    
    .resource-category ul {
        padding-left: 1rem;
        margin: 0;
    }
    
    .resource-category li {
        margin-bottom: 0.25rem;
        color: #495057;
        font-size: 0.875rem;
    }
    
    .performance-explanation {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 6px;
        margin-top: 1rem;
        border-left: 4px solid #667eea;
    }
    
    .performance-explanation h5 {
        color: #2c3e50;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .performance-explanation p {
        color: #495057;
        margin: 0;
        line-height: 1.5;
    }
    
    .recommendations-intro,
    .resources-intro {
        color: #6c757d;
        font-style: italic;
        margin-bottom: 1rem;
    }
    
    .metric-next-steps {
        background: #e8f4fd;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 2rem;
        border: 1px solid #b3d9ff;
    }
    
    .metric-next-steps h4 {
        color: #1976d2;
        margin-bottom: 1rem;
    }
    
    .next-steps-content p {
        margin-bottom: 0.75rem;
        color: #2c3e50;
    }
    
    .next-steps-content ul {
        margin-bottom: 1.5rem;
        padding-left: 1.5rem;
    }
    
    .next-steps-content li {
        margin-bottom: 0.5rem;
        color: #495057;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Function to navigate to overview page
function goToNetworkOverview() {
    console.log('Navigating to network overview...');
    window.location.href = 'overview.html';
}

// Color Palette Functionality
function setupColorPalette() {
    const paletteOptions = document.querySelectorAll('.palette-option');
    const currentLogo = document.getElementById('current-logo');
    
    // Load saved color set from localStorage
    const savedColorSet = localStorage.getItem('selectedColorSet') || '2';
    document.body.setAttribute('data-color-set', savedColorSet);
    
    // Update logo
    updateLogo(savedColorSet);
    
    // Update active state
    paletteOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-set') === savedColorSet) {
            option.classList.add('active');
        }
    });
    
    // Add click event listeners
    paletteOptions.forEach(option => {
        option.addEventListener('click', function() {
            const colorSet = this.getAttribute('data-set');
            
            // Update body attribute
            document.body.setAttribute('data-color-set', colorSet);
            
            // Update logo
            updateLogo(colorSet);
            
            // Update active state
            paletteOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Save to localStorage
            localStorage.setItem('selectedColorSet', colorSet);
            
            console.log('Color palette changed to set:', colorSet);
        });
    });
}

// Update logo based on color set
function updateLogo(colorSet) {
    const currentLogo = document.getElementById('current-logo');
    if (currentLogo) {
        // Remove all logo classes
        currentLogo.className = '';
        // Add the appropriate logo class
        currentLogo.classList.add(`ymca-logo-set-${colorSet}`);
    }
}

// Make functions globally accessible
window.showMetricDetails = showMetricDetails;
window.goToNetworkOverview = goToNetworkOverview; 