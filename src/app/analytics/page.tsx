'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/auth-context';

// Type declaration for Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

interface OrganizationData {
  id: string;
  name: string;
  totalPoints: number;
  maxPoints: number;
  percentageScore: number;
  supportDesignation: string;
  operationalTotalPoints: number;
  financialTotalPoints: number;
  membershipGrowthScore: number;
  staffRetentionScore: number;
  graceScore: number;
  riskMitigationScore: number;
  governanceScore: number;
  engagementScore: number;
  monthsOfLiquidityScore: number;
  operatingMarginScore: number;
  debtRatioScore: number;
  operatingRevenueMixScore: number;
  charitableRevenueScore: number;
  organization: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { testAuth } = useAuthContext();
  const [organizationData, setOrganizationData] = useState<OrganizationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use test organization ID if in test mode, otherwise use default
  const participantOrgId = testAuth?.organizationId || 'f357cb0b-b881-4166-8516-1c0783d4a5a2';
  
  // Check for submissionId in URL parameters
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    // Extract submissionId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubmissionId = urlParams.get('submissionId');
    setSubmissionId(urlSubmissionId);
  }, []);

  useEffect(() => {
    const loadParticipantData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let response;
        let data;

        if (submissionId) {
          // Fetch specific submission's performance data
          console.log('Fetching performance data for submission:', submissionId);
          response = await fetch(`/api/performance-calculations/submission/${submissionId}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              console.log('⚠️ No performance calculation found for submission:', submissionId);
              // Fall through to use organization data instead
              response = await fetch(`/api/performance-calculations/organization/${participantOrgId}/latest`);
              if (!response.ok) {
                throw new Error('Failed to load organization data');
              }
              const result = await response.json();
              data = result.performanceCalculation;
            } else {
              throw new Error('Failed to load submission performance data');
            }
          } else {
            const submissionResult = await response.json();
            if (!submissionResult.success) {
              console.log('⚠️ API returned error for submission:', submissionResult.error);
              // Fall through to use organization data instead
              response = await fetch(`/api/performance-calculations/organization/${participantOrgId}/latest`);
              if (!response.ok) {
                throw new Error('Failed to load organization data');
              }
              const orgResult = await response.json();
              data = orgResult.performanceCalculation;
            } else {
              data = submissionResult.performanceCalculation;
            }
          }
        } else {
          // Fetch latest organization performance data using API proxy
          console.log('Fetching latest performance data for organization:', participantOrgId);
          response = await fetch(`/api/performance-calculations/organization/${participantOrgId}/latest`);
          
          if (!response.ok) {
            throw new Error('Failed to load organization data');
          }

          const result = await response.json();
          data = result.performanceCalculation;
        }

        console.log('📊 Raw data received from backend:', data);
        console.log('📊 Data type:', typeof data);
        console.log('📊 Data keys:', data ? Object.keys(data) : 'No data');
        setOrganizationData(data);
      } catch (err) {
        console.error('Error loading participant data:', err);
        
        // Fallback to mock data for demonstration
        console.log('Using fallback mock data for demonstration');
        const organizationName = testAuth?.organizationName || 'Duluth Area Family YMCA';
        const mockData: OrganizationData = {
          id: participantOrgId,
          name: organizationName,
          totalPoints: 45,
          maxPoints: 80,
          percentageScore: 56,
          supportDesignation: 'Independent Improvement',
          operationalTotalPoints: 27,
          financialTotalPoints: 18,
          membershipGrowthScore: 3,
          staffRetentionScore: 4,
          graceScore: 3,
          riskMitigationScore: 6,
          governanceScore: 7,
          engagementScore: 4,
          monthsOfLiquidityScore: 6,
          operatingMarginScore: 6,
          debtRatioScore: 2,
          operatingRevenueMixScore: 3,
          charitableRevenueScore: 3,
          organization: {
            name: organizationName,
            address: testAuth?.testOrganization?.address || '302 W 1st St',
            city: testAuth?.testOrganization?.city || 'Duluth',
            state: testAuth?.testOrganization?.state || 'MN'
          }
        };
        setOrganizationData(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    const loadScripts = () => {
      // Load Chart.js if not already loaded
      if (!window.Chart) {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        chartScript.onload = () => {
          console.log('Chart.js loaded');
          loadAIFramework();
        };
        document.head.appendChild(chartScript);
      } else {
        loadAIFramework();
      }
    };

    const loadAIFramework = () => {
      // Check if AI framework is already loaded or loading
      if ((window as any).aiFrameworkLoading || (window as any).aiFrameworkLoaded) {
        console.log('AI framework already loading or loaded, skipping...');
        return;
      }

      (window as any).aiFrameworkLoading = true;

      // Load the AI framework scripts with cache busting
      const cacheBuster = Date.now();
      const scripts = [
        `/overview.js?v=${cacheBuster}`,
        `/ai-advisory-framework.js?v=${cacheBuster}`,
        `/ai-config-manager.js?v=${cacheBuster}`,
        `/ai-advisory-ui.js?v=${cacheBuster}`,
        `/ai-advisory-integration.js?v=${cacheBuster}`,
        `/api-service.js?v=${cacheBuster}`,
        `/ai-framework-init.js?v=${cacheBuster}`
      ];

      let loadedCount = 0;
      scripts.forEach((src) => {
        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          console.log(`Script ${src} already loaded, skipping...`);
          loadedCount++;
          if (loadedCount === scripts.length) {
            console.log('All AI framework scripts loaded');
            (window as any).aiFrameworkLoaded = true;
            (window as any).aiFrameworkLoading = false;
            initializeAIFrameworkForAnalytics();
          }
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loadedCount++;
          if (loadedCount === scripts.length) {
            console.log('All AI framework scripts loaded');
            (window as any).aiFrameworkLoaded = true;
            (window as any).aiFrameworkLoading = false;
            initializeAIFrameworkForAnalytics();
          }
        };
        script.onerror = (error) => {
          console.error(`Failed to load script: ${src}`, error);
          (window as any).aiFrameworkLoading = false;
        };
        document.head.appendChild(script);
      });
    };

    const initializeAIFrameworkForAnalytics = () => {
      // Wait a bit for all scripts to be fully loaded
      setTimeout(async () => {
        console.log('🔧 setTimeout callback executing...');
        
        if (typeof window !== 'undefined' && (window as any).AIAdvisoryIntegration) {
          console.log('🚀 Initializing AI Framework for Analytics...');
          
          try {
            // Initialize the AI Advisory Integration in fallback mode
            console.log('🔧 Creating AI Advisory Integration instance...');
            const aiIntegration = new (window as any).AIAdvisoryIntegration();
            console.log('🔧 AI Advisory Integration instance created:', aiIntegration);
            
            console.log('🔧 About to call initializeFallbackMode()...');
            await aiIntegration.initializeFallbackMode();
            console.log('🔧 initializeFallbackMode() completed successfully');
            
            // Store reference for cleanup
            (window as any).analyticsAIIntegration = aiIntegration;
            
            // Set global YMCA data for the AI framework
            if (typeof window !== 'undefined') {
              (window as any).currentData = {
                organization: {
                  id: organizationData?.id || participantOrgId,
                  name: organizationData?.organization?.name || testAuth?.organizationName || 'Demo YMCA',
                  totalPoints: organizationData?.totalPoints || 0,
                  maxPoints: organizationData?.maxPoints || 80,
                  percentageScore: organizationData?.percentageScore || 0,
                  supportDesignation: organizationData?.supportDesignation || 'Standard',
                  operationalTotalPoints: organizationData?.operationalTotalPoints || 0,
                  financialTotalPoints: organizationData?.financialTotalPoints || 0,
                  membershipGrowthScore: organizationData?.membershipGrowthScore || 0,
                  staffRetentionScore: organizationData?.staffRetentionScore || 0,
                  graceScore: organizationData?.graceScore || 0,
                  riskMitigationScore: organizationData?.riskMitigationScore || 0,
                  governanceScore: organizationData?.governanceScore || 0,
                  engagementScore: organizationData?.engagementScore || 0,
                  monthsOfLiquidityScore: organizationData?.monthsOfLiquidityScore || 0,
                  operatingMarginScore: organizationData?.operatingMarginScore || 0,
                  debtRatioScore: organizationData?.debtRatioScore || 0,
                  operatingRevenueMixScore: organizationData?.operatingRevenueMixScore || 0,
                  charitableRevenueScore: organizationData?.charitableRevenueScore || 0
                }
              };
            }
            
            // Connect the Generate AI Analysis button
            const generateBtn = document.getElementById('generate-analysis-btn');
            if (generateBtn) {
              generateBtn.addEventListener('click', () => {
                console.log('Generate AI Analysis button clicked');
                
                // Show initialization message
                const advisorySection = document.getElementById('ai-advisory-section');
                if (advisorySection) {
                  advisorySection.innerHTML = `
                    <div class="ai-advisory-content">
                      <div class="advisory-header">
                        <h3>🔄 Initializing AI System...</h3>
                        <p>Please wait while we set up the AI analysis system. You may see some technical messages - this is normal.</p>
                      </div>
                      <div class="advisory-controls">
                        <button id="refresh-analysis-btn" class="btn btn-primary">
                          🔄 Refresh Analysis (Click after initialization)
                        </button>
                      </div>
                    </div>
                  `;
                  
                  // Add refresh button event listener
                  const refreshBtn = document.getElementById('refresh-analysis-btn');
                  if (refreshBtn) {
                    refreshBtn.addEventListener('click', () => {
                      console.log('Refresh analysis button clicked');
                      aiIntegration.aiAdvisoryUI.generateAnalysis();
                    });
                  }
                }
                
                // Trigger the AI analysis (this will show errors but initialize the system)
                aiIntegration.aiAdvisoryUI.generateAnalysis();
              });
            }
            
            console.log('✅ AI Framework initialized for Analytics (Fallback Mode)');
          } catch (error) {
            console.error('❌ Failed to initialize AI Framework:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack,
              name: error.name
            });
            
            // Fallback: Show error message to user
            const advisoryContent = document.getElementById('advisory-content');
            if (advisoryContent) {
              advisoryContent.innerHTML = `
                <div class="advisory-error">
                  <h3>AI Analysis Unavailable</h3>
                  <p>Unable to initialize AI analysis at this time. Please try again later.</p>
                  <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
                </div>
              `;
            }
          }
        } else {
          console.error('AI Advisory Integration not available');
        }
      }, 2000); // Increased timeout to ensure all scripts are loaded
    };

    loadParticipantData();
    loadScripts();

    // Cleanup function
    return () => {
      // Remove any dynamically added scripts
      const scripts = document.querySelectorAll('script[src*="ai-framework"]');
      scripts.forEach(script => script.remove());
      
      // Clear global variables to prevent conflicts
      if (typeof window !== 'undefined') {
        delete (window as any).AIAdvisoryUI;
        delete (window as any).APIService;
        delete (window as any).overviewData;
        delete (window as any).initializeAIFramework;
        delete (window as any).analyticsAIAdvisoryUI;
        delete (window as any).analyticsAIIntegration;
        delete (window as any).currentData;
        
        // Reset loading flags
        delete (window as any).aiFrameworkLoading;
        delete (window as any).aiFrameworkLoaded;
        
        // Clear any cached script references
        delete (window as any).AIProviderInterface;
        delete (window as any).AIConfigManager;
        delete (window as any).AIAdvisoryIntegration;
        delete (window as any).AdvisorManager;
        delete (window as any).AzureOpenAIProvider;
        delete (window as any).BaseAdvisor;
      }
    };
      }, [submissionId, participantOrgId, testAuth]);

    // Generate suggested resources based on performance data
    const generateSuggestedResources = (performanceData: OrganizationData | null) => {
      if (!performanceData) {
        return getDefaultSuggestedResources();
      }
      
      const resources: any = {};
      
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
      
      // Add resources for low-performing metrics based on scores
      const metrics = [
        { name: 'Membership Growth', score: performanceData.membershipGrowthScore, maxScore: 4 },
        { name: 'Staff Retention', score: performanceData.staffRetentionScore, maxScore: 4 },
        { name: 'GRACE Score', score: performanceData.graceScore, maxScore: 4 },
        { name: 'Risk Mitigation', score: performanceData.riskMitigationScore, maxScore: 7 },
        { name: 'Governance', score: performanceData.governanceScore, maxScore: 12 },
        { name: 'Engagement', score: performanceData.engagementScore, maxScore: 8 },
        { name: 'Months of Liquidity', score: performanceData.monthsOfLiquidityScore, maxScore: 12 },
        { name: 'Operating Margin', score: performanceData.operatingMarginScore, maxScore: 10 },
        { name: 'Debt Ratio', score: performanceData.debtRatioScore, maxScore: 8 },
        { name: 'Revenue Mix', score: performanceData.operatingRevenueMixScore, maxScore: 4 },
        { name: 'Charitable Revenue', score: performanceData.charitableRevenueScore, maxScore: 4 }
      ];
      
      metrics.forEach(metric => {
        const percentage = (metric.score / metric.maxScore) * 100;
        if (percentage < 50) { // Low performance threshold
          const resourceKey = metric.name.replace(/\s+/g, '');
          resources[resourceKey] = { ...defaultResourceTemplate };
        }
      });
      
      return resources;
    };

    const getDefaultSuggestedResources = () => {
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
    };

    // Generate AI analysis for a metric
    const generateAIAnalysis = (metricName: string, resources: any, highlightedDirect: string[], highlightedShared: string[]) => {
      const analysisTemplates: any = {
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
        'GRACE Score': {
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
        'Revenue Mix': {
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
    };

    // Get performance level for a specific metric
    const getMetricPerformanceLevel = (metricName: string, organizationData: OrganizationData | null) => {
      if (!organizationData) return 'moderate';
      
      const metrics: any = {
        'Membership Growth': { score: organizationData.membershipGrowthScore, maxScore: 4 },
        'Staff Retention': { score: organizationData.staffRetentionScore, maxScore: 4 },
        'GRACE Score': { score: organizationData.graceScore, maxScore: 4 },
        'Risk Mitigation': { score: organizationData.riskMitigationScore, maxScore: 7 },
        'Governance': { score: organizationData.governanceScore, maxScore: 12 },
        'Engagement': { score: organizationData.engagementScore, maxScore: 8 },
        'Months of Liquidity': { score: organizationData.monthsOfLiquidityScore, maxScore: 12 },
        'Operating Margin': { score: organizationData.operatingMarginScore, maxScore: 10 },
        'Debt Ratio': { score: organizationData.debtRatioScore, maxScore: 8 },
        'Revenue Mix': { score: organizationData.operatingRevenueMixScore, maxScore: 4 },
        'Charitable Revenue': { score: organizationData.charitableRevenueScore, maxScore: 4 }
      };
      
      const metric = metrics[metricName];
      if (!metric) return 'moderate';
      
      const percentage = (metric.score / metric.maxScore) * 100;
      if (percentage < 50) return 'low';
      if (percentage < 75) return 'moderate';
      return 'high';
    };

    // Create a resource row with AI analysis
    const createResourceRow = (metricName: string, resources: any, organizationData: OrganizationData | null) => {
      const highlightedDirect = resources.highlighted?.directDelivery || [];
      const highlightedShared = resources.highlighted?.sharedServices || [];
      
      // Generate AI analysis based on metric performance
      const aiAnalysis = generateAIAnalysis(metricName, resources, highlightedDirect, highlightedShared);
      
      // Get performance level for color coding
      const performanceLevel = getMetricPerformanceLevel(metricName, organizationData);
      
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
              ${resources.networkSupported.directDelivery.map((resource: string) => 
                `<div class="resource-item ${highlightedDirect.includes(resource) ? 'highlighted' : 'standard'}">${resource}</div>`
              ).join('')}
            </div>
            <div class="shared-services">
              ${resources.networkSupported.sharedServices.map((resource: string) => 
                `<div class="resource-item ${highlightedShared.includes(resource) ? 'highlighted' : 'standard'}">${resource}</div>`
              ).join('')}
            </div>
          </div>
        </div>
      `;
    };

    // Populate resources when organization data is loaded
    useEffect(() => {
      if (organizationData) {
        const suggestedResources = generateSuggestedResources(organizationData);
        const lowPerformingMetrics: any[] = [];
        const resourceRows: string[] = [];
        
        // Check operational metrics
        const metrics = [
          { name: 'Membership Growth', score: organizationData.membershipGrowthScore, maxScore: 4 },
          { name: 'Staff Retention', score: organizationData.staffRetentionScore, maxScore: 4 },
          { name: 'GRACE Score', score: organizationData.graceScore, maxScore: 4 },
          { name: 'Risk Mitigation', score: organizationData.riskMitigationScore, maxScore: 7 },
          { name: 'Governance', score: organizationData.governanceScore, maxScore: 12 },
          { name: 'Engagement', score: organizationData.engagementScore, maxScore: 8 },
          { name: 'Months of Liquidity', score: organizationData.monthsOfLiquidityScore, maxScore: 12 },
          { name: 'Operating Margin', score: organizationData.operatingMarginScore, maxScore: 10 },
          { name: 'Debt Ratio', score: organizationData.debtRatioScore, maxScore: 8 },
          { name: 'Revenue Mix', score: organizationData.operatingRevenueMixScore, maxScore: 4 },
          { name: 'Charitable Revenue', score: organizationData.charitableRevenueScore, maxScore: 4 }
        ];
        
        metrics.forEach(metric => {
          const percentage = (metric.score / metric.maxScore) * 100;
          if (percentage < 50) { // Low performance threshold
            const resourceKey = metric.name.replace(/\s+/g, '');
            lowPerformingMetrics.push({
              name: metric.name,
              resources: suggestedResources[resourceKey] || suggestedResources.financialMetrics
            });
          }
        });
        
        // If no low-performing metrics, show Staff Retention as default
        if (lowPerformingMetrics.length === 0) {
          lowPerformingMetrics.push({
            name: 'Staff Retention',
            resources: suggestedResources.staffRetention
          });
        }
        
        // Create resource rows for each low-performing metric
        lowPerformingMetrics.forEach(metric => {
          resourceRows.push(createResourceRow(metric.name, metric.resources, organizationData));
        });
        
        // Update the DOM
        const resourcesContent = document.getElementById('resources-content');
        if (resourcesContent) {
          resourcesContent.innerHTML = resourceRows.join('');
        }
      }
    }, [organizationData]);

  if (isLoading) {
    return (
      <div className="analytics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your organization's AI analysis...</p>
        </div>
      </div>
    );
  }

  if (error && !organizationData) {
    return (
      <div className="analytics-page">
        <div className="error-container">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* AI Framework Content */}
      <div id="app" data-color-set="2">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="ymca-logo-container">
              <div className="ymca-logo-set-2" id="current-logo"></div>
            </div>
            <div className="logo-section">
              <h1 className="main-title">OEA AI Advisors for {organizationData?.organization.name}</h1>
              <p className="subtitle">Personalized Analysis & Recommendations</p>
              <div style={{ marginTop: '8px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {testAuth?.isTestMode && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                    display: 'inline-block'
                  }}>
                    🧪 TEST MODE
                  </div>
                )}
                {submissionId && (
                  <div style={{
                    padding: '4px 8px',
                    backgroundColor: '#e0f2fe',
                    border: '1px solid #0ea5e9',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#0369a1',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                    display: 'inline-block'
                  }}>
                    📊 Submission: {submissionId.substring(0, 8)}...
                  </div>
                )}
              </div>
            </div>
            <div className="back-button-container">
              <button
                onClick={() => router.push('/')}
                className="back-btn"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Participant Organization Overview */}
        <main className="participant-main">
          <section className="organization-overview">
            <div className="overview-header">
              <h2>Your Organization Performance</h2>
              <p className="overview-description">
                AI-powered analysis of your YMCA's performance across all operational excellence areas.
              </p>
            </div>
            
            <div className="performance-summary">
              <div className="summary-card primary">
                <h3>Overall Score</h3>
                <div className="score-display">
                  <span className="score-number">{organizationData?.percentageScore}%</span>
                  <span className="score-label">{organizationData?.supportDesignation}</span>
                </div>
                <p className="score-description">
                  {organizationData?.totalPoints} out of {organizationData?.maxPoints} total points
                </p>
              </div>
              
              <div className="summary-card operational">
                <h3>Operational Excellence</h3>
                <div className="score-display">
                  <span className="score-number">{organizationData?.operationalTotalPoints}</span>
                  <span className="score-label">points</span>
                </div>
                <p className="score-description">Staff, membership, governance & engagement</p>
              </div>
              
              <div className="summary-card financial">
                <h3>Financial Health</h3>
                <div className="score-display">
                  <span className="score-number">{organizationData?.financialTotalPoints}</span>
                  <span className="score-label">points</span>
                </div>
                <p className="score-description">Liquidity, margins, debt & revenue mix</p>
              </div>
            </div>

            <div className="detailed-metrics">
              <h3>Detailed Performance Metrics</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Membership Growth</span>
                  <span className="metric-score">{organizationData?.membershipGrowthScore}/4</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Staff Retention</span>
                  <span className="metric-score">{organizationData?.staffRetentionScore}/4</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">GRACE Score</span>
                  <span className="metric-score">{organizationData?.graceScore}/4</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Risk Mitigation</span>
                  <span className="metric-score">{organizationData?.riskMitigationScore}/7</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Governance</span>
                  <span className="metric-score">{organizationData?.governanceScore}/12</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Engagement</span>
                  <span className="metric-score">{organizationData?.engagementScore}/8</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Months of Liquidity</span>
                  <span className="metric-score">{organizationData?.monthsOfLiquidityScore}/12</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Operating Margin</span>
                  <span className="metric-score">{organizationData?.operatingMarginScore}/10</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Debt Ratio</span>
                  <span className="metric-score">{organizationData?.debtRatioScore}/8</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Revenue Mix</span>
                  <span className="metric-score">{organizationData?.operatingRevenueMixScore}/4</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Charitable Revenue</span>
                  <span className="metric-score">{organizationData?.charitableRevenueScore}/4</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* AI Advisory Section */}
        <section id="ai-advisory-section" className="ai-advisory-section">
          <div className="advisory-header">
            <h3>AI Advisory Insights</h3>
            <div className="advisory-controls">
              <button id="generate-analysis-btn" className="btn btn-primary">
                <span className="btn-text">Generate AI Analysis</span>
                <span style={{display: 'none'}} className="btn-loading">
                  <i className="spinner"></i> Analyzing...
                </span>
              </button>
              <button id="refresh-analysis-btn" style={{display: 'none'}} className="btn btn-secondary">
                <i className="refresh-icon">🔄</i> Refresh
              </button>
            </div>
          </div>
          <div id="advisory-content" className="advisory-content">
            <div className="advisory-placeholder">
              <p>Click "Generate AI Analysis" to get intelligent insights and personalized recommendations for your YMCA.</p>
            </div>
          </div>
          <div id="advisory-status" className="advisory-status"></div>
        </section>

        {/* Suggested Resources Section */}
        <section className="suggested-resources">
          <h2>Suggested Resources</h2>
          <div className="resources-container">
            <div className="resources-header">
              <div className="resource-column">
                <h4>Metric</h4>
              </div>
              <div className="resource-column">
                <h4>AI Analysis</h4>
              </div>
              <div className="resource-column">
                <h4>Self Directed</h4>
              </div>
              <div className="resource-column">
                <h4>Network Supported</h4>
                <div className="sub-columns">
                  <span>Direct Delivery</span>
                  <span>Shared Services</span>
                </div>
              </div>
            </div>
            <div className="resources-content" id="resources-content">
              {/* Resources will be populated by JavaScript */}
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* Import the AI framework styles */
        @import url('/ai-advisory-styles.css');
        @import url('/overview-styles.css');
        
        /* Additional styles for the participant analytics page */
        .analytics-page {
          min-height: 100vh;
          background-color: #f8fafc;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
          text-align: center;
        }
        
        .error-container button {
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        
        .logo-section {
          flex: 1;
          text-align: center;
        }
        
        .main-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }
        
        .subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }
        
        .back-btn {
          padding: 8px 16px;
          background-color: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .back-btn:hover {
          background-color: rgba(255,255,255,0.3);
        }
        
        .participant-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        
        .organization-overview {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          margin-bottom: 32px;
        }
        
        .overview-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .overview-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 12px 0;
        }
        
        .overview-description {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }
        
        .performance-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .summary-card {
          padding: 24px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e5e7eb;
        }
        
        .summary-card.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .summary-card.operational {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        
        .summary-card.financial {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }
        
        .summary-card h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        
        .score-display {
          margin-bottom: 8px;
        }
        
        .score-number {
          font-size: 36px;
          font-weight: 700;
          display: block;
        }
        
        .score-label {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .score-description {
          font-size: 12px;
          opacity: 0.8;
          margin: 0;
        }
        
        .detailed-metrics {
          border-top: 1px solid #e5e7eb;
          padding-top: 32px;
        }
        
        .detailed-metrics h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 24px 0;
          text-align: center;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }
        
        .metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
        }
        
        .metric-label {
          font-size: 14px;
          color: #374151;
          font-weight: 500;
        }
        
        .metric-score {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
        }
        
        .ai-advisory-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px 40px 20px;
        }
        
        .advisory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .advisory-header h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        
        .advisory-controls {
          display: flex;
          gap: 12px;
        }
        
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #2563eb;
        }
        
        .btn-secondary {
          background-color: #6b7280;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #4b5563;
        }
        
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .advisory-content {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          min-height: 200px;
        }
        
        .advisory-placeholder {
          text-align: center;
          color: #6b7280;
        }
        
        .advisory-placeholder p {
          font-size: 16px;
          margin: 0;
        }
        
        .advisory-error {
          text-align: center;
          color: #dc2626;
          padding: 20px;
        }
        
        .advisory-error h3 {
          color: #dc2626;
          margin-bottom: 10px;
        }
        
        .advisory-error p {
          margin-bottom: 20px;
          color: #6b7280;
        }
        
        /* Suggested Resources Styles */
        .suggested-resources {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 1px solid #e1e5e9;
          margin-top: 1.5rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .suggested-resources h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .resources-container {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          overflow: hidden;
        }

        .resources-header {
          display: grid;
          grid-template-columns: 1fr 2.5fr 1.5fr 2fr;
          background: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .resource-column {
          padding: 1rem;
          text-align: center;
        }

        .resource-column h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .sub-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6c757d;
        }

        .resources-content {
          padding: 1rem;
        }

        .resource-row {
          display: grid;
          grid-template-columns: 1fr 2.5fr 1.5fr 2fr;
          align-items: start;
          padding: 0.5rem;
          border-bottom: 1px solid #f1f3f4;
          min-height: 80px;
        }

        .resource-metric-name {
          font-size: 0.8rem;
          color: #2c3e50;
          font-weight: 600;
          padding: 0.25rem 0;
        }

        .resource-metric-name.high {
          color: #1da08b;
        }

        .resource-metric-name.moderate {
          color: #0089d0;
        }

        .resource-metric-name.low {
          color: #f15922;
        }

        .resource-row:last-child {
          border-bottom: none;
        }

        .network-resources {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .resource-item {
          padding: 0.4rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          text-align: center;
          margin-bottom: 0.15rem;
          line-height: 1.2;
        }

        .resource-item.highlighted {
          background-color: #e3f2fd;
          border: 1px solid #2196f3;
          color: #1976d2;
          font-weight: 500;
        }

        .resource-item.standard {
          background-color: #f5f5f5;
          color: #666;
        }

        /* AI Analysis Styles */
        .ai-analysis {
          padding: 0.5rem;
        }

        .ai-insight {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
          min-height: 70px;
          max-height: 120px;
          overflow-y: auto;
        }

        .ai-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .ai-text {
          font-size: 0.85rem;
          color: #2c3e50;
          line-height: 1.4;
          flex: 1;
        }

        .self-directed {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ai-action-plan {
          margin-top: 0.25rem;
        }

        .ai-plan-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .ai-plan-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
          }
          
          .performance-summary {
            grid-template-columns: 1fr;
          }
          
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          
          .advisory-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
