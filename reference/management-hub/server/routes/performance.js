const express = require('express');
const PerformanceCalculationService = require('../performance-service');

const router = express.Router();
const performanceService = new PerformanceCalculationService();

// Get overview data for treemap
router.get('/overview', async (req, res) => {
  try {
    const overview = await performanceService.getOverviewData();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching overview data:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// Calculate performance for organization
router.post('/calculate/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { period } = req.body;
    
    const performance = await performanceService.calculateFromSubmissions(organizationId, period);
    res.json(performance);
  } catch (error) {
    console.error('Error calculating performance:', error);
    res.status(500).json({ error: 'Failed to calculate performance' });
  }
});

// Get organization performance details
router.get('/organizations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await performanceService.getOrganizationPerformance(id);
    res.json(performance);
  } catch (error) {
    console.error('Error fetching organization performance:', error);
    res.status(500).json({ error: 'Failed to fetch organization performance' });
  }
});

// Get all performance calculations for management hub
router.get('/performance-calculations', async (req, res) => {
  try {
    const overview = await performanceService.getOverviewData();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching performance calculations:', error);
    res.status(500).json({ error: 'Failed to fetch performance calculations' });
  }
});

// Save performance calculation from frontend
router.post('/performance-calculations', async (req, res) => {
  try {
    const performanceData = req.body;
    console.log('Received performance calculation data:', performanceData);
    
    // Save the performance calculation to database
    await performanceService.savePerformanceCalculation(performanceData);
    
    res.json({ 
      success: true, 
      message: 'Performance calculation saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving performance calculation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save performance calculation',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test database connection
router.get('/test-connection', async (req, res) => {
  try {
    const isConnected = await performanceService.testConnection();
    if (isConnected) {
      res.json({ status: 'success', message: 'Database connection successful' });
    } else {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  } catch (error) {
    console.error('Database connection test error:', error);
    res.status(500).json({ status: 'error', message: 'Database connection test failed' });
  }
});

module.exports = router;
