// Prevent duplicate class declarations
if (typeof window !== 'undefined' && window.APIService) {
    console.log('APIService already declared, skipping...');
} else {
class APIService {
  constructor(config = {}) {
    // Use provided config or defaults for browser environment
    this.baseURL = config.SELF_REPORTING_API_URL || 'http://localhost:3001/api/v1'; // Self-Reporting Portal
    this.performanceURL = config.MANAGEMENT_HUB_API_URL || 'http://localhost:1928/api/performance'; // Management Hub
  }

  // Fetch data from Self-Reporting Portal
  async getSubmissions() {
    try {
      const response = await fetch(`${this.baseURL}/submissions`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  }

  async getOrganizations() {
    try {
      const response = await fetch(`${this.baseURL}/organizations`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }

  // Fetch calculated performance data from real backend
  async getOverviewData() {
    try {
      const response = await fetch(`${this.baseURL}/performance-calculations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Deduplicate by organization - keep only the latest calculation per organization
      const uniqueOrganizations = new Map();
      
      data.forEach(calculation => {
        const orgId = calculation.organization.id;
        const existing = uniqueOrganizations.get(orgId);
        
        if (!existing || new Date(calculation.calculatedAt) > new Date(existing.calculatedAt)) {
          uniqueOrganizations.set(orgId, calculation);
        }
      });
      
      const deduplicatedData = Array.from(uniqueOrganizations.values());
      console.log(`Successfully loaded real-time data from backend API (${data.length} calculations → ${deduplicatedData.length} unique organizations)`);
      return deduplicatedData;
    } catch (error) {
      console.error('Error fetching overview data:', error);
      throw error;
    }
  }

  async getOrganizationPerformance(orgId) {
    try {
      const response = await fetch(`${this.baseURL}/performance-calculations/organization/${orgId}/latest`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Successfully loaded performance data for organization ${orgId}`);
      return data;
    } catch (error) {
      console.error('Error fetching organization performance:', error);
      throw error;
    }
  }

  async getPerformanceSummary() {
    try {
      const response = await fetch(`${this.baseURL}/performance-calculations/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Successfully loaded performance summary');
      return data;
    } catch (error) {
      console.error('Error fetching performance summary:', error);
      return null;
    }
  }

  async getSupportDesignations() {
    try {
      const response = await fetch(`${this.baseURL}/performance-calculations/support-designations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Successfully loaded support designation statistics');
      return data;
    } catch (error) {
      console.error('Error fetching support designations:', error);
      return null;
    }
  }

  async testDatabaseConnection() {
    try {
      // Test by trying to fetch performance summary
      const response = await fetch(`${this.baseURL}/performance-calculations/summary`);
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }



  // Transform API data to match existing format
  transformApiDataToLegacyFormat(apiData) {
    // Handle both array and object responses from backend
    const dataArray = Array.isArray(apiData) ? apiData : [apiData];
    
    return dataArray.map(calculation => {
      // Extract organization info from the calculation
      const org = calculation.organization || {};
      
      return {
        id: org.id || calculation.organizationId,
        name: org.name || 'Unknown Organization',
        code: org.code || org.id,
        totalPoints: calculation.totalPoints || 0,
        maxPoints: 80,
        percentage: calculation.percentageScore || 0,
        performanceCategory: calculation.performanceCategory || 'moderate',
        overallSupportDesignation: calculation.supportDesignation || this.getSupportDesignation(calculation.percentageScore),
        // Create performance snapshot structure for Detail view
        performanceSnapshot: {
          operationalPerformance: {
            category: "Operational Performance",
            metrics: [
              {
                name: "Membership and Program Growth",
                points: parseFloat(calculation.membershipGrowthScore) || 0,
                maxPoints: 4,
                performance: this.getPerformanceLevel(calculation.membershipGrowthScore),
                description: "Measures the growth percentage of the association's total impact compared to the prior year/based on market share"
              },
              {
                name: "Staff Retention",
                points: parseFloat(calculation.staffRetentionScore) || 0,
                maxPoints: 4,
                performance: this.getPerformanceLevel(calculation.staffRetentionScore),
                description: "Staff retention metric is the percentage of full-time staff members a Y has lost over the course of a year"
              },
              {
                name: "Grace Score",
                points: parseFloat(calculation.graceScore) || 0,
                maxPoints: 4,
                performance: this.getPerformanceLevel(calculation.graceScore),
                description: "Measures an organization's commitment to engaging all dimensions of diversity and organizational commitment to fostering a sense of belonging and advancing global relations"
              },
              {
                name: "Risk Mitigation Score",
                points: parseFloat(calculation.riskMitigationScore) || 0,
                maxPoints: 8,
                performance: this.getPerformanceLevel(calculation.riskMitigationScore),
                description: "Measures the risk management practices at the Y association, including child protection, aquatic safety, IP/trademark, and risk management framework"
              },
              {
                name: "Governance Score",
                points: parseFloat(calculation.governanceScore) || 0,
                maxPoints: 12,
                performance: this.getPerformanceLevel(calculation.governanceScore),
                description: "Measures the governance practices at the Y association, including strategic planning, board responsibilities, board effectiveness, and functional roles"
              },
              {
                name: "Engagement Score",
                points: parseFloat(calculation.engagementScore) || 0,
                maxPoints: 8,
                performance: this.getPerformanceLevel(calculation.engagementScore),
                description: "Measures the organizational practices at the Y association, including member, staff, volunteer, and community engagement"
              }
            ],
            totalPoints: calculation.operationalTotalPoints || 0,
            maxPoints: 40,
            supportDesignation: calculation.operationalSupportDesignation || this.getSupportDesignation(calculation.operationalTotalPoints)
          },
          financialPerformance: {
            category: "Financial Performance",
            metrics: [
              {
                name: "Months of Liquidity",
                points: parseFloat(calculation.monthsLiquidityScore) || 0,
                maxPoints: 12,
                performance: this.getPerformanceLevel(calculation.monthsLiquidityScore),
                description: "A measurement of how many months of cash a Y has in relation to its monthly expenses"
              },
              {
                name: "Operating Margin",
                points: parseFloat(calculation.operatingMarginScore) || 0,
                maxPoints: 12,
                performance: this.getPerformanceLevel(calculation.operatingMarginScore),
                description: "A measurement of the percentage an association's operating revenues exceed its operating expenses"
              },
              {
                name: "Debt Ratio",
                points: parseFloat(calculation.debtRatioScore) || 0,
                maxPoints: 8,
                performance: this.getPerformanceLevel(calculation.debtRatioScore),
                description: "A measurement of the extent to which the Y relies on debt financing"
              },
              {
                name: "Operating Revenue Mix",
                points: parseFloat(calculation.operatingRevenueMixScore) || 0,
                maxPoints: 4,
                performance: this.getPerformanceLevel(calculation.operatingRevenueMixScore),
                description: "A measurement that reflects the balance of operating revenue streams"
              },
              {
                name: "Charitable Revenue",
                points: parseFloat(calculation.charitableRevenueScore) || 0,
                maxPoints: 4,
                performance: this.getPerformanceLevel(calculation.charitableRevenueScore),
                description: "A measurement of the percentage of charitable revenue an association receives relative to its operating revenue"
              }
            ],
            totalPoints: calculation.financialTotalPoints || 0,
            maxPoints: 40,
            supportDesignation: calculation.financialSupportDesignation || this.getSupportDesignation(calculation.financialTotalPoints)
          }
        },
        operationalTotalPoints: calculation.operationalTotalPoints || 0,
        financialTotalPoints: calculation.financialTotalPoints || 0,
        period: calculation.period,
        calculatedAt: calculation.calculatedAt
      };
    });
  }

  getSupportDesignation(percentage) {
    if (percentage >= 70) return 'Independent Improvement';
    if (percentage >= 40) return 'Standard Support';
    return 'Y-USA Support';
  }

  getPerformanceLevel(score) {
    const numScore = parseFloat(score);
    if (numScore >= 3) return 'high';
    if (numScore >= 1.5) return 'moderate';
    return 'low';
  }

  // Get data source status
  async getDataSourceStatus() {
    const isApiAvailable = await this.testDatabaseConnection();
    return {
      apiAvailable: isApiAvailable,
      dataSource: isApiAvailable ? 'API' : 'Unavailable'
    };
  }
}

// Global API service instance with default configuration
if (typeof window !== 'undefined') {
  window.apiService = new APIService({
    SELF_REPORTING_API_URL: 'http://localhost:3001/api/v1',
    MANAGEMENT_HUB_API_URL: 'http://localhost:1928/api/performance',
    FALLBACK_TO_STATIC: false
  });
}
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIService;
}
