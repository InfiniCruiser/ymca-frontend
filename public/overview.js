// Overview page functionality
// Prevent duplicate variable declarations
if (typeof window !== 'undefined' && window.overviewData !== undefined) {
    console.log('overviewData already declared, skipping...');
} else {
let overviewData = null;
let ymcaData = []; // Real YMCA data with coordinates
let map = null;
let charts = {};

// Make overviewData globally accessible for testing
window.overviewData = null;

// YMCA data with member counts and performance metrics
const ymcaOverviewData = [
    {
        id: 'xyz',
        name: 'XYZ YMCA',
        members: 2500,
        totalPoints: 32,
        maxPoints: 80,
        operationalScore: 28,
        financialScore: 6,
        supportLevel: 'Y-USA Support',
        performance: 'low'
    },
    {
        id: 'stlouis',
        name: 'St. Louis Y',
        members: 8500,
        totalPoints: 58,
        maxPoints: 80,
        operationalScore: 33,
        financialScore: 29,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'charlotte',
        name: 'Charlotte Y',
        members: 4200,
        totalPoints: 45,
        maxPoints: 80,
        operationalScore: 27,
        financialScore: 21,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'la',
        name: 'LA Y',
        members: 12000,
        totalPoints: 72,
        maxPoints: 80,
        operationalScore: 39,
        financialScore: 37,
        supportLevel: 'Independent Improvement',
        performance: 'high'
    },
    {
        id: 'chicago',
        name: 'Chicago Y',
        members: 15000,
        totalPoints: 65,
        maxPoints: 80,
        operationalScore: 35,
        financialScore: 30,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'miami',
        name: 'Miami Y',
        members: 6800,
        totalPoints: 38,
        maxPoints: 80,
        operationalScore: 22,
        financialScore: 18,
        supportLevel: 'Y-USA Support',
        performance: 'low'
    },
    {
        id: 'seattle',
        name: 'Seattle Y',
        members: 9200,
        totalPoints: 68,
        maxPoints: 80,
        operationalScore: 36,
        financialScore: 32,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'boston',
        name: 'Boston Y',
        members: 11000,
        totalPoints: 75,
        maxPoints: 80,
        operationalScore: 40,
        financialScore: 35,
        supportLevel: 'Independent Improvement',
        performance: 'high'
    },
    {
        id: 'denver',
        name: 'Denver Central Y',
        members: 7800,
        totalPoints: 62,
        maxPoints: 80,
        operationalScore: 32,
        financialScore: 30,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'buffalo',
        name: 'Buffalo Central Y',
        members: 5200,
        totalPoints: 48,
        maxPoints: 80,
        operationalScore: 26,
        financialScore: 22,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'columbus',
        name: 'Columbus Y',
        members: 6800,
        totalPoints: 55,
        maxPoints: 80,
        operationalScore: 29,
        financialScore: 26,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'cleveland',
        name: 'Cleveland Central Y',
        members: 4200,
        totalPoints: 42,
        maxPoints: 80,
        operationalScore: 22,
        financialScore: 20,
        supportLevel: 'Y-USA Support',
        performance: 'low'
    },
    {
        id: 'philadelphia',
        name: 'Philadelphia Y',
        members: 13500,
        totalPoints: 70,
        maxPoints: 80,
        operationalScore: 37,
        financialScore: 33,
        supportLevel: 'Independent Improvement',
        performance: 'high'
    },
    {
        id: 'knoxville',
        name: 'Knoxville Y',
        members: 3800,
        totalPoints: 51,
        maxPoints: 80,
        operationalScore: 27,
        financialScore: 24,
        supportLevel: 'Independent Improvement',
        performance: 'moderate'
    },
    {
        id: 'tacoma',
        name: 'Tacoma Y',
        members: 2900,
        totalPoints: 44,
        maxPoints: 80,
        operationalScore: 21,
        financialScore: 23,
        supportLevel: 'Y-USA Support',
        performance: 'low'
    }
];

// Initialize the overview page
async function initOverview() {
    console.log('Initializing overview page...');
    
    try {
        // Set up event listeners first
        setupEventListeners();
        setupColorPalette();
        
        // Load static data for fallback
        overviewData = ymcaOverviewData;
        window.overviewData = overviewData; // Make globally accessible
        
        // Render initial view with static data
        renderTreemap();
        renderTable();
        renderMetricsOverview();
        
        // Try to load real-time data from backend API (lazy loading)
        await loadOverviewDataFromAPI();
        
        // Load YMCA data for map and analytics
        await loadYMCAData();
        

        
    } catch (error) {
        console.error('Failed to initialize overview page:', error);
        // Fallback to static data
        overviewData = ymcaOverviewData;
        window.overviewData = overviewData; // Make globally accessible
        setupEventListeners();
        setupColorPalette();
        renderTreemap();
        renderTable();
        renderMetricsOverview();
    }
}

// Load overview data from backend API (lazy loading)
async function loadOverviewDataFromAPI() {
    try {
        if (window.apiService) {
            console.log('Loading real-time data from backend API...');
            
            const overviewDataFromAPI = await window.apiService.getOverviewData();
            
            if (overviewDataFromAPI && (Array.isArray(overviewDataFromAPI) ? overviewDataFromAPI.length > 0 : true)) {
                // Transform API data to match overview format
                const transformedData = window.apiService.transformApiDataToLegacyFormat(overviewDataFromAPI);
                overviewData = transformToOverviewFormat(transformedData);
                window.overviewData = overviewData; // Make globally accessible
                console.log('✅ Successfully loaded real-time data from backend API');
                
                // Re-render with real data
                renderTreemap();
                renderTable();
                renderMetricsOverview();
            } else {
                console.log('No real-time data available from backend API, using static data');
            }
        } else {
            console.log('API service not available, using static data');
        }
    } catch (apiError) {
        console.error('Backend API data loading failed, using static data:', apiError);
    }
}

// Setup event listeners
function setupEventListeners() {
    // View control buttons
    document.getElementById('treemap-view').addEventListener('click', () => switchView('treemap'));
    document.getElementById('table-view').addEventListener('click', () => switchView('table'));
    document.getElementById('map-view').addEventListener('click', () => switchView('map'));
    document.getElementById('analytics-view').addEventListener('click', () => switchView('analytics'));
    document.getElementById('metrics-view').addEventListener('click', () => switchView('metrics'));
    
    // Add event delegation for view details buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details-btn') || e.target.classList.contains('action-btn')) {
            e.stopPropagation();
            const ymcaId = e.target.getAttribute('data-ymca-id');
            if (ymcaId) {
                navigateToDetail(ymcaId);
            }
        }
        
        // Also handle the detail dashboard button
        if (e.target.classList.contains('detail-btn')) {
            e.stopPropagation();
            goToDetailDashboard();
        }
    });
    
    // Add sorting functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            sortAndRenderTreemap(sortBy);
        });
    }
}

// Switch between different views
function switchView(view) {
    // Hide all sections
    document.getElementById('treemap-section').classList.add('hidden');
    document.getElementById('table-section').classList.add('hidden');
    document.getElementById('map-section').classList.add('hidden');
    document.getElementById('analytics-section').classList.add('hidden');
    document.getElementById('metrics-section').classList.add('hidden');
    
    // Remove active class from all buttons
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    
    // Show selected section and activate button
    switch(view) {
        case 'treemap':
            document.getElementById('treemap-section').classList.remove('hidden');
            document.getElementById('treemap-view').classList.add('active');
            break;
        case 'table':
            document.getElementById('table-section').classList.remove('hidden');
            document.getElementById('table-view').classList.add('active');
            break;
        case 'map':
            document.getElementById('map-section').classList.remove('hidden');
            document.getElementById('map-view').classList.add('active');
            initializeMap();
            break;
        case 'analytics':
            document.getElementById('analytics-section').classList.remove('hidden');
            document.getElementById('analytics-view').classList.add('active');
            initializeAnalytics();
            break;
        case 'metrics':
            document.getElementById('metrics-section').classList.remove('hidden');
            document.getElementById('metrics-view').classList.add('active');
            break;
    }
}

// Render treemap view
function renderTreemap() {
    const sortSelect = document.getElementById('sort-select');
    const sortBy = sortSelect ? sortSelect.value : 'performance';
    sortAndRenderTreemap(sortBy);
}

// Sort and render treemap based on selected criteria
function sortAndRenderTreemap(sortBy) {
    const treemapGrid = document.getElementById('treemap-grid');
    
    // Sort YMCAs based on selected criteria
    const sortedYMCAs = [...overviewData].sort((a, b) => {
        switch(sortBy) {
            case 'performance':
                const aScore = (a.totalPoints / a.maxPoints) * 100;
                const bScore = (b.totalPoints / b.maxPoints) * 100;
                return bScore - aScore;
            case 'performance-asc':
                const aScoreAsc = (a.totalPoints / a.maxPoints) * 100;
                const bScoreAsc = (b.totalPoints / b.maxPoints) * 100;
                return aScoreAsc - bScoreAsc;
            case 'members':
                return b.members - a.members;
            case 'members-asc':
                return a.members - b.members;
            case 'operational':
                return b.operationalScore - a.operationalScore;
            case 'operational-asc':
                return a.operationalScore - b.operationalScore;
            case 'financial':
                return b.financialScore - a.financialScore;
            case 'financial-asc':
                return a.financialScore - b.financialScore;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'support':
                return a.supportLevel.localeCompare(b.supportLevel);
            default:
                const aScoreDefault = (a.totalPoints / a.maxPoints) * 100;
                const bScoreDefault = (b.totalPoints / b.maxPoints) * 100;
                return bScoreDefault - aScoreDefault;
        }
    });
    
    treemapGrid.innerHTML = sortedYMCAs.map(ymca => {
        const performancePercentage = Math.round((ymca.totalPoints / ymca.maxPoints) * 100);
        const performanceLevel = getPerformanceLevel(performancePercentage);
        const memberSize = getMemberSizeClass(ymca.members);
        
        return `
            <div class="treemap-tile ${performanceLevel} ${memberSize}" onclick="navigateToDetail('${ymca.id}')">
                <div class="tile-header">
                    <div class="tile-name">${ymca.name}</div>
                    <div class="tile-score">${ymca.totalPoints}/${ymca.maxPoints}</div>
                </div>
                
                <div class="tile-stats">
                    <div class="tile-stat">
                        <span class="stat-label">Operational</span>
                        <span class="stat-value">${ymca.operationalScore}/40</span>
                    </div>
                    <div class="tile-stat">
                        <span class="stat-label">Financial</span>
                        <span class="stat-value">${ymca.financialScore}/40</span>
                    </div>
                </div>
                
                <div class="tile-members">
                    <i class="fas fa-users member-icon"></i>
                    <span>${ymca.members.toLocaleString()} members</span>
                </div>
                
                <div class="tile-support">
                    <span class="support-level">Support Level</span>
                    <span class="support-badge ${ymca.supportLevel === 'Y-USA Support' ? 'yusa' : 'independent'}">
                        ${ymca.supportLevel}
                    </span>
                </div>
                
                <div class="tile-actions">
                    <button class="view-details-btn" data-ymca-id="${ymca.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render table view
function renderTable() {
    const tableBody = document.getElementById('table-body');
    
    // Sort YMCAs by total score (high to low)
    const sortedYMCAs = [...overviewData].sort((a, b) => b.totalPoints - a.totalPoints);
    
    tableBody.innerHTML = sortedYMCAs.map(ymca => {
        const performancePercentage = Math.round((ymca.totalPoints / ymca.maxPoints) * 100);
        const performanceLevel = getPerformanceLevel(performancePercentage);
        
        return `
            <tr>
                <td><strong>${ymca.name}</strong></td>
                <td>${ymca.members.toLocaleString()}</td>
                <td class="score-cell ${performanceLevel}">${ymca.totalPoints}/${ymca.maxPoints}</td>
                <td>${ymca.operationalScore}/40</td>
                <td>${ymca.financialScore}/40</td>
                <td>
                    <span class="support-badge ${ymca.supportLevel === 'Y-USA Support' ? 'yusa' : 'independent'}">
                        ${ymca.supportLevel}
                    </span>
                </td>
                <td>
                    <button class="action-btn" data-ymca-id="${ymca.id}">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Render metrics overview
function renderMetricsOverview() {
    // Calculate averages and top performers
    const operationalScores = overviewData.map(ymca => ymca.operationalScore);
    const financialScores = overviewData.map(ymca => ymca.financialScore);
    
    const avgOperational = Math.round(operationalScores.reduce((a, b) => a + b, 0) / operationalScores.length);
    const avgFinancial = Math.round(financialScores.reduce((a, b) => a + b, 0) / financialScores.length);
    
    const topOperational = overviewData.reduce((top, ymca) => 
        ymca.operationalScore > top.operationalScore ? ymca : top
    );
    
    const topFinancial = overviewData.reduce((top, ymca) => 
        ymca.financialScore > top.financialScore ? ymca : top
    );
    
    // Update metrics display
    document.getElementById('avg-operational').textContent = `${avgOperational}/40`;
    document.getElementById('avg-financial').textContent = `${avgFinancial}/40`;
    document.getElementById('top-operational').textContent = topOperational.name;
    document.getElementById('top-financial').textContent = topFinancial.name;
}

// Get performance level based on percentage
function getPerformanceLevel(percentage) {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'moderate';
    return 'low';
}

// Transform API data to overview format
function transformToOverviewFormat(apiData) {
    return apiData.map(org => {
        // Convert string values to numbers
        const totalPoints = parseFloat(org.totalPoints) || 0;
        const maxPoints = parseInt(org.maxPoints) || 80;
        const operationalScore = parseFloat(org.operationalTotalPoints) || 0;
        const financialScore = parseFloat(org.financialTotalPoints) || 0;
        
        const percentage = (totalPoints / maxPoints) * 100;
        const performance = getPerformanceLevel(percentage);
        
        return {
            id: org.id,
            name: org.name,
            members: 5000, // Default member count since not in API data
            totalPoints: totalPoints,
            maxPoints: maxPoints,
            operationalScore: operationalScore,
            financialScore: financialScore,
            supportLevel: org.supportDesignation || 'Standard',
            performance: performance
        };
    });
}

// Get member size class for visual representation
function getMemberSizeClass(members) {
    if (members >= 10000) return 'size-large';
    if (members >= 5000) return 'size-medium';
    return 'size-small';
}

// Navigate to detail view with selected YMCA
function navigateToDetail(ymcaId) {
    console.log('Navigating to detail for YMCA:', ymcaId);
    // alert('Navigating to ' + ymcaId); // Temporary debug
    // Store the selected YMCA ID in localStorage
    localStorage.setItem('selectedYMCA', ymcaId);
    
    // Navigate to the detail dashboard
    window.location.href = 'index.html';
}

// Make function globally accessible
window.navigateToDetail = navigateToDetail;

// Function to go to detail dashboard
function goToDetailDashboard() {
    console.log('Going to detail dashboard...');
    // alert('Button clicked! Navigating to detail dashboard...'); // Temporary debug
    window.location.href = 'index.html';
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

// Make function globally accessible
window.goToDetailDashboard = goToDetailDashboard;

// Load YMCA data for map and analytics
async function loadYMCAData() {
    try {
        if (window.apiService) {
            console.log('Loading YMCA data for map and analytics...');
            const organizations = await window.apiService.getOrganizations();
            if (organizations && organizations.length > 0) {
                ymcaData = organizations;
        
            }
        }
    } catch (error) {
        console.error('Failed to load YMCA data:', error);
    }
}

// Initialize the map
function initializeMap() {
    console.log('Initializing map...');
    console.log('YMCA data length:', ymcaData.length);
    
    if (!ymcaData.length) {
        console.log('No YMCA data available for map');
        return;
    }
    
    // Check if Leaflet is available
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    // Check if map container exists
    const mapContainer = document.getElementById('ymca-map');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    // Hide loading message
    const loadingElement = document.getElementById('map-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    try {
        // Calculate map bounds
        const bounds = calculateMapBounds();
        console.log('Map bounds:', bounds);
        
        // Initialize Leaflet map
        map = L.map('ymca-map').setView([bounds.centerLat, bounds.centerLng], 5);
        console.log('Map initialized successfully');
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        console.log('Tile layer added');
        
        // Add YMCA markers
        addYMCAMarkers();
        console.log('Markers added');
        
        // Fit map to bounds
        map.fitBounds([[bounds.minLat, bounds.minLng], [bounds.maxLat, bounds.maxLng]]);
        console.log('Map fitted to bounds');
        
        // Force a resize to ensure proper rendering
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('Map size invalidated');
            }
        }, 100);
        
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

// Calculate map bounds from YMCA data
function calculateMapBounds() {
    if (!ymcaData.length) return { centerLat: 39.8283, centerLng: -98.5795, minLat: 25, maxLat: 50, minLng: -125, maxLng: -65 };
    
    const lats = ymcaData.map(ymca => ymca.latitude).filter(lat => lat !== null);
    const lngs = ymcaData.map(ymca => ymca.longitude).filter(lng => lng !== null);
    
    if (lats.length === 0 || lngs.length === 0) {
        return { centerLat: 39.8283, centerLng: -98.5795, minLat: 25, maxLat: 50, minLng: -125, maxLng: -65 };
    }
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    return {
        centerLat: (minLat + maxLat) / 2,
        centerLng: (minLng + maxLng) / 2,
        minLat, maxLat, minLng, maxLng
    };
}

// Add YMCA markers to the map
function addYMCAMarkers() {
    if (!map || !ymcaData.length) return;
    
    ymcaData.forEach(ymca => {
        if (ymca.latitude && ymca.longitude) {
            // Find performance data for this YMCA
            const performanceData = overviewData.find(overview => 
                overview.name.toLowerCase().includes(ymca.name.toLowerCase()) ||
                ymca.name.toLowerCase().includes(overview.name.toLowerCase())
            );
            
            let markerColor = '#3498db'; // Default blue
            let performanceText = 'Performance data not available';
            
            if (performanceData) {
                const performancePercentage = Math.round((performanceData.totalPoints / performanceData.maxPoints) * 100);
                if (performancePercentage >= 70) {
                    markerColor = '#2ecc71'; // Green for high performance
                } else if (performancePercentage >= 40) {
                    markerColor = '#3498db'; // Blue for moderate performance
                } else {
                    markerColor = '#e74c3c'; // Red for low performance
                }
                performanceText = `${performanceData.name}: ${performancePercentage}% (${performanceData.totalPoints}/${performanceData.maxPoints})`;
            }
            
            // Create custom marker icon
            const markerIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            
            // Create marker
            const marker = L.marker([ymca.latitude, ymca.longitude], { icon: markerIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h3 style="margin: 0 0 0.5rem 0; color: #333;">${ymca.name}</h3>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>Association #:</strong> ${ymca.associationNumber || 'N/A'}</p>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>Charter Date:</strong> ${ymca.charterDate || 'N/A'}</p>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>Performance:</strong> ${performanceText}</p>
                        <p style="margin: 0.25rem 0; color: #666;"><strong>Type:</strong> ${ymca.type || 'N/A'}</p>
                    </div>
                `);
        }
    });
}

// Initialize analytics charts
function initializeAnalytics() {
    console.log('Initializing analytics...');
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
    
    // Create performance distribution chart
    createPerformanceChart();
    
    // Create geographic distribution chart
    createGeographicChart();
    
    // Create operational vs financial chart
    createOperationalFinancialChart();
    
    // Create support level chart
    createSupportLevelChart();
}

// Create performance distribution chart
function createPerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) return;
    
    const performanceRanges = {
        'High (70-100%)': 0,
        'Moderate (40-69%)': 0,
        'Low (0-39%)': 0
    };
    
    overviewData.forEach(ymca => {
        const percentage = Math.round((ymca.totalPoints / ymca.maxPoints) * 100);
        if (percentage >= 70) {
            performanceRanges['High (70-100%)']++;
        } else if (percentage >= 40) {
            performanceRanges['Moderate (40-69%)']++;
        } else {
            performanceRanges['Low (0-39%)']++;
        }
    });
    
    charts.performance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(performanceRanges),
            datasets: [{
                data: Object.values(performanceRanges),
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Create geographic distribution chart
function createGeographicChart() {
    const ctx = document.getElementById('geo-chart');
    if (!ctx) return;
    
    const regions = {};
    ymcaData.forEach(ymca => {
        const state = ymca.state || 'Unknown';
        regions[state] = (regions[state] || 0) + 1;
    });
    
    const sortedRegions = Object.entries(regions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 states
    
    charts.geographic = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedRegions.map(([state]) => state),
            datasets: [{
                label: 'Number of YMCAs',
                data: sortedRegions.map(([,count]) => count),
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Create operational vs financial chart
function createOperationalFinancialChart() {
    const ctx = document.getElementById('operational-financial-chart');
    if (!ctx) return;
    
    const data = overviewData.map(ymca => ({
        name: ymca.name,
        operational: ymca.operationalScore,
        financial: ymca.financialScore
    }));
    
    charts.operationalFinancial = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'YMCA Performance',
                data: data.map(item => ({
                    x: item.operational,
                    y: item.financial
                })),
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Operational Score'
                    },
                    max: 40
                },
                y: {
                    title: {
                        display: true,
                        text: 'Financial Score'
                    },
                    max: 40
                }
            }
        }
    });
}

// Create support level chart
function createSupportLevelChart() {
    const ctx = document.getElementById('support-chart');
    if (!ctx) return;
    
    const supportLevels = {};
    overviewData.forEach(ymca => {
        const level = ymca.supportLevel || 'Unknown';
        supportLevels[level] = (supportLevels[level] || 0) + 1;
    });
    
    charts.support = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(supportLevels),
            datasets: [{
                data: Object.values(supportLevels),
                backgroundColor: ['#2ecc71', '#3498db', '#e74c3c', '#f39c12'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initOverview);
} 