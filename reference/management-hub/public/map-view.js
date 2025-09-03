// Map View with Faceted Analytics
let ymcaData = [];
let map = null;
let charts = {};

// Initialize the map view
async function initMapView() {
    console.log('Initializing Map View with Faceted Analytics...');
    
    try {
        // Load YMCA data from backend API
        await loadYMCAData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize views
        initializeMap();
        initializeCharts();
        renderDataTable();
        
        console.log('Map View initialized successfully');
            } catch (error) {
            console.error('Failed to initialize Map View:', error);
        }
}

// Load YMCA data from backend API
async function loadYMCAData() {
    try {
        console.log('Loading YMCA data from backend API...');
        
        if (window.apiService) {
            const organizations = await window.apiService.getOrganizations();
            if (organizations && organizations.length > 0) {
                ymcaData = organizations.filter(org => org.latitude && org.longitude);
                console.log(`✅ Loaded ${ymcaData.length} YMCAs with coordinates from backend API`);
            } else {
                throw new Error('No organizations found');
            }
        } else {
            throw new Error('API service not available');
        }
    } catch (error) {
        console.error('Failed to load YMCA data:', error);
        throw error;
    }
}

// Set up event listeners
function setupEventListeners() {
    // View selector
    document.getElementById('view-selector').addEventListener('change', (e) => {
        switchView(e.target.value);
    });
    
    // Filter selector
    document.getElementById('filter-selector').addEventListener('change', (e) => {
        applyFilter(e.target.value);
    });
    
    // Refresh data button
    document.getElementById('refresh-data').addEventListener('click', async () => {
        await refreshData();
    });
    
    // Search input
    document.getElementById('search-input').addEventListener('input', (e) => {
        filterTable(e.target.value);
    });
    
    // Sort selector
    document.getElementById('sort-select').addEventListener('change', (e) => {
        sortTable(e.target.value);
    });
}

// Switch between different views
function switchView(view) {
    // Hide all sections
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(`${view}-view`).classList.add('active');
    
    // Update charts if needed
    if (view === 'facets' || view === 'timeline' || view === 'distribution') {
        setTimeout(() => {
            updateCharts();
        }, 100);
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
    
    console.log('Map container found, dimensions:', mapContainer.offsetWidth, 'x', mapContainer.offsetHeight);
    
    // Calculate map bounds
    const bounds = calculateMapBounds();
    console.log('Map bounds:', bounds);
    
    try {
        // Hide loading message
        const loadingElement = document.getElementById('map-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
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
    const lats = ymcaData.map(org => org.latitude);
    const lngs = ymcaData.map(org => org.longitude);
    
    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
        centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
        centerLng: (Math.min(...lngs) + Math.max(...lngs)) / 2
    };
}

// Add YMCA markers to the map
function addYMCAMarkers() {
    ymcaData.forEach(org => {
        const age = calculateAge(org.charterDate);
        const markerColor = getMarkerColor(age);
        
        const marker = L.circleMarker([org.latitude, org.longitude], {
            radius: 8,
            fillColor: markerColor,
            color: 'white',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map);
        
        // Add popup with YMCA information
        const popupContent = `
            <div class="ymca-popup">
                <h3>${org.name}</h3>
                <p><strong>Location:</strong> ${org.city}, ${org.state}</p>
                <p><strong>Charter Date:</strong> ${formatDate(org.charterDate)}</p>
                <p><strong>Age:</strong> ${age} years</p>
                <p><strong>Association #:</strong> ${org.associationNumber}</p>
                <button class="action-btn" onclick="viewYMCA('${org.id}')">View Details</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event
        marker.on('click', () => {
            console.log('Clicked on:', org.name);
        });
    });
}

// Calculate age from charter date
function calculateAge(charterDate) {
    const charter = new Date(charterDate);
    const now = new Date();
    return Math.floor((now - charter) / (1000 * 60 * 60 * 24 * 365.25));
}

// Get marker color based on age
function getMarkerColor(age) {
    if (age >= 150) return '#e74c3c'; // 1850-1900
    if (age >= 100) return '#f39c12'; // 1901-1950
    if (age >= 50) return '#3498db';  // 1951-2000
    return '#2ecc71';                 // 2001+
}

// Format date for display
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Initialize charts
function initializeCharts() {
    // Age Distribution Chart
    createAgeChart();
    
    // Geographic Distribution Chart
    createGeoChart();
    
    // Timeline Chart
    createTimelineChart();
    
    // Type Chart
    createTypeChart();
    
    // Timeline Analysis Chart
    createTimelineAnalysisChart();
    
    // Decade Distribution Chart
    createDecadeChart();
    
    // Century Distribution Chart
    createCenturyChart();
    
    // Data Completeness Chart
    createCompletenessChart();
}

// Create Age Distribution Chart
function createAgeChart() {
    const ageRanges = {
        '0-25 years': 0,
        '26-50 years': 0,
        '51-75 years': 0,
        '76-100 years': 0,
        '101-125 years': 0,
        '126-150 years': 0,
        '150+ years': 0
    };
    
    ymcaData.forEach(org => {
        const age = calculateAge(org.charterDate);
        if (age <= 25) ageRanges['0-25 years']++;
        else if (age <= 50) ageRanges['26-50 years']++;
        else if (age <= 75) ageRanges['51-75 years']++;
        else if (age <= 100) ageRanges['76-100 years']++;
        else if (age <= 125) ageRanges['101-125 years']++;
        else if (age <= 150) ageRanges['126-150 years']++;
        else ageRanges['150+ years']++;
    });
    
    const ctx = document.getElementById('age-chart');
    if (ctx) {
        charts.ageChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(ageRanges),
                datasets: [{
                    data: Object.values(ageRanges),
                    backgroundColor: [
                        '#2ecc71', '#3498db', '#f39c12', '#e74c3c',
                        '#9b59b6', '#34495e', '#1abc9c'
                    ]
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
}

// Create Geographic Distribution Chart
function createGeoChart() {
    const stateCounts = {};
    ymcaData.forEach(org => {
        stateCounts[org.state] = (stateCounts[org.state] || 0) + 1;
    });
    
    const sortedStates = Object.entries(stateCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const ctx = document.getElementById('geo-chart');
    if (ctx) {
        charts.geoChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedStates.map(([state]) => state),
                datasets: [{
                    label: 'Number of YMCAs',
                    data: sortedStates.map(([,count]) => count),
                    backgroundColor: '#3498db'
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
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Create Timeline Chart
function createTimelineChart() {
    const decadeCounts = {};
    ymcaData.forEach(org => {
        const decade = Math.floor(new Date(org.charterDate).getFullYear() / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    
    const sortedDecades = Object.entries(decadeCounts).sort(([a], [b]) => a - b);
    
    const ctx = document.getElementById('timeline-chart');
    if (ctx) {
        charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDecades.map(([decade]) => `${decade}s`),
                datasets: [{
                    label: 'YMCA Establishments',
                    data: sortedDecades.map(([,count]) => count),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4
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
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Create Type Chart
function createTypeChart() {
    const typeCounts = {};
    ymcaData.forEach(org => {
        typeCounts[org.type] = (typeCounts[org.type] || 0) + 1;
    });
    
    const ctx = document.getElementById('type-chart');
    if (ctx) {
        charts.typeChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(typeCounts),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#2ecc71']
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
}

// Create Timeline Analysis Chart
function createTimelineAnalysisChart() {
    const yearCounts = {};
    ymcaData.forEach(org => {
        const year = new Date(org.charterDate).getFullYear();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    const sortedYears = Object.entries(yearCounts).sort(([a], [b]) => a - b);
    
    const ctx = document.getElementById('timeline-analysis-chart');
    if (ctx) {
        charts.timelineAnalysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedYears.map(([year]) => year),
                datasets: [{
                    label: 'YMCA Establishments',
                    data: sortedYears.map(([,count]) => count),
                    backgroundColor: '#3498db'
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
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Update timeline stats
    updateTimelineStats();
}

// Create Decade Distribution Chart
function createDecadeChart() {
    const decadeCounts = {};
    ymcaData.forEach(org => {
        const decade = Math.floor(new Date(org.charterDate).getFullYear() / 10) * 10;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
    });
    
    const sortedDecades = Object.entries(decadeCounts).sort(([a], [b]) => a - b);
    
    const ctx = document.getElementById('decade-chart');
    if (ctx) {
        charts.decadeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedDecades.map(([decade]) => `${decade}s`),
                datasets: [{
                    label: 'YMCA Establishments',
                    data: sortedDecades.map(([,count]) => count),
                    backgroundColor: '#f39c12'
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
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Create Century Distribution Chart
function createCenturyChart() {
    const centuryCounts = {
        '19th Century': 0,
        '20th Century': 0,
        '21st Century': 0
    };
    
    ymcaData.forEach(org => {
        const year = new Date(org.charterDate).getFullYear();
        if (year < 1900) centuryCounts['19th Century']++;
        else if (year < 2000) centuryCounts['20th Century']++;
        else centuryCounts['21st Century']++;
    });
    
    const ctx = document.getElementById('century-chart');
    if (ctx) {
        charts.centuryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(centuryCounts),
                datasets: [{
                    data: Object.values(centuryCounts),
                    backgroundColor: ['#e74c3c', '#3498db', '#2ecc71']
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
}

// Create Data Completeness Chart
function createCompletenessChart() {
    const totalFields = ymcaData.length * 5; // name, lat, lng, city, state
    const completedFields = ymcaData.reduce((count, org) => {
        return count + (org.name ? 1 : 0) + (org.latitude ? 1 : 0) + 
               (org.longitude ? 1 : 0) + (org.city ? 1 : 0) + (org.state ? 1 : 0);
    }, 0);
    
    const missingFields = totalFields - completedFields;
    
    const ctx = document.getElementById('completeness-chart');
    if (ctx) {
        charts.completenessChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Complete Data', 'Missing Data'],
                datasets: [{
                    data: [completedFields, missingFields],
                    backgroundColor: ['#2ecc71', '#e74c3c']
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
}

// Update timeline statistics
function updateTimelineStats() {
    const ages = ymcaData.map(org => calculateAge(org.charterDate));
    const oldest = Math.max(...ages);
    const newest = Math.min(...ages);
    const average = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
    
    const oldestYMCA = ymcaData.find(org => calculateAge(org.charterDate) === oldest);
    const newestYMCA = ymcaData.find(org => calculateAge(org.charterDate) === newest);
    
    document.getElementById('oldest-ymca').textContent = `${oldestYMCA.name} (${oldest} years)`;
    document.getElementById('newest-ymca').textContent = `${newestYMCA.name} (${newest} years)`;
    document.getElementById('avg-age').textContent = `${average} years`;
    document.getElementById('total-count').textContent = ymcaData.length;
}

// Update all charts
function updateCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && chart.update) {
            chart.update();
        }
    });
}

// Apply filter to data
function applyFilter(filterType) {
    console.log('Applying filter:', filterType);
    // Implementation for filtering data
}

// Filter table by search term
function filterTable(searchTerm) {
    const tbody = document.getElementById('table-body');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// Sort table
function sortTable(sortBy) {
    const tbody = document.getElementById('table-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelector(`td[data-${sortBy}]`)?.getAttribute(`data-${sortBy}`) || '';
        const bValue = b.querySelector(`td[data-${sortBy}]`)?.getAttribute(`data-${sortBy}`) || '';
        
        if (sortBy === 'charterDate') {
            return new Date(aValue) - new Date(bValue);
        }
        return aValue.localeCompare(bValue);
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Render data table
function renderDataTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    ymcaData.forEach(org => {
        const age = calculateAge(org.charterDate);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${org.name}</td>
            <td data-associationNumber="${org.associationNumber}">${org.associationNumber}</td>
            <td data-charterDate="${org.charterDate}">${formatDate(org.charterDate)}</td>
            <td>${age} years</td>
            <td>${org.type}</td>
            <td>
                <button class="action-btn" onclick="viewYMCA('${org.id}')">View</button>
                <button class="action-btn" onclick="locateOnMap(${org.latitude}, ${org.longitude})">Map</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Refresh data
async function refreshData() {
    try {
        await loadYMCAData();
        if (map) {
            map.remove();
            initializeMap();
        }
        updateCharts();
        renderDataTable();
        updateTimelineStats();
        console.log('Data refreshed successfully');
    } catch (error) {
        console.error('Failed to refresh data:', error);
    }
}

// View YMCA details
function viewYMCA(ymcaId) {
    console.log('Viewing YMCA:', ymcaId);
    // Navigate to dashboard with selected YMCA
    localStorage.setItem('selectedYMCA', ymcaId);
    window.location.href = '/';
}

// Locate YMCA on map
function locateOnMap(lat, lng) {
    if (map) {
        map.setView([lat, lng], 10);
    }
}



// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMapView);
