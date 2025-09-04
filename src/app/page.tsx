'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { PeriodSurvey } from '@/components/survey/period-survey';
import { SubmissionModal } from '@/components/submissions/submission-modal';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useAuthContext } from '@/contexts/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { testAuth, setTestAuth } = useAuthContext();
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [activeColorSet, setActiveColorSet] = useState('2'); // Default to Teal + Blue
  
  // Use test organization ID if in test mode, otherwise use default
  const selectedOrganization = testAuth?.organizationId || 'f357cb0b-b881-4166-8516-1c0783d4a5a2';
  
  // Fetch real dashboard stats for the selected organization
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats(selectedOrganization);

  const handleQuickAction = async (action: string) => {
    switch (action) {
      case 'create-period':
        setIsSurveyOpen(true);
        break;
      case 'view-analytics':
        router.push('/analytics');
        break;
      case 'manage-users':
        toast.success('Opening user management...');
        break;
      case 'settings':
        toast.success('Opening settings...');
        break;
      case 'view-submissions':
        setIsSubmissionModalOpen(true);
        break;
      case 'export-data':
        exportSubmissions();
        break;
      default:
        toast('Action not implemented yet');
    }
  };

  const handleSurveyComplete = (responses: any) => {
    console.log('Survey completed with responses:', responses);
    // In a real app, this would save the responses to the backend
    toast.success('New reporting period created successfully!');
  };

  const exportSubmissions = () => {
    const submissions = JSON.parse(localStorage.getItem('ymca_survey_submissions') || '[]');
    if (submissions.length === 0) {
      toast.error('No submissions to export');
      return;
    }
    
    const dataStr = JSON.stringify(submissions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ymca-survey-submissions-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Submissions exported successfully!');
  };

  const changeColorSet = (setNumber: string) => {
    setActiveColorSet(setNumber);
    document.documentElement.setAttribute('data-color-set', setNumber);
  };

  // Get organization name for display
  const getOrganizationName = (orgId: string) => {
    // If in test mode, use the test organization name
    if (testAuth?.isTestMode && testAuth.organizationId === orgId) {
      return testAuth.organizationName;
    }
    
    const orgMap: Record<string, string> = {
      'f357cb0b-b881-4166-8516-1c0783d4a5a2': 'Duluth Area Family YMCA',
      '183460b3-2124-416c-8642-452f68f348a7': 'Charlotte YMCA',
      '2a00e146-9206-4548-b8c7-b5e33385491c': 'YMCA of San Francisco',
      '06328990-2622-4002-a0bf-05951df20e33': 'YMCA of Greater New York',
      '6f2059b2-00aa-4df2-85a7-730c5d863b14': 'YMCA of Metropolitan Chicago',
      '9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d': 'YMCA of Greater Los Angeles',
      '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d': 'St. Louis Y',
      'xyz': 'XYZ YMCA'
    };
    return orgMap[orgId] || 'Unknown Organization';
  };

  return (
    <>
      <div data-color-set={activeColorSet}>
        {/* YMCA Header */}
        <header className="header">
          <div className="header-content">
            <div className="ymca-logo-container">
              <div className={`ymca-logo-set-${activeColorSet}`}></div>
            </div>
            
            <div>
              <h1 className="main-title">OEA Participant Portal</h1>
              <p className="subtitle">Organizational Excellence Assessment</p>
            </div>
            
            <div className="ymca-selector">
              <label>YMCA:</label>
              <div className="selected-ymca">
                <strong>{getOrganizationName(selectedOrganization)}</strong>
                {testAuth?.isTestMode && (
                  <div style={{
                    marginTop: '4px',
                    padding: '2px 6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '3px',
                    fontSize: '10px',
                    color: '#64748b',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                  }}>
                    TEST
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Test Mode Banner */}
        {testAuth?.isTestMode && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            margin: '0 24px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>🧪</span>
              <div>
                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                  Test Mode: <span style={{ color: '#374151' }}>{testAuth.organizationName}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setTestAuth(null)}
              style={{
                backgroundColor: 'transparent',
                color: '#64748b',
                border: '1px solid #d1d5db',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = '#f3f4f6';
                target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = 'transparent';
                target.style.borderColor = '#d1d5db';
              }}
            >
              Exit
            </button>
          </div>
        )}

        {/* Main Dashboard */}
        <div className="dashboard">
          {/* Performance Overview */}
          <div className="performance-overview">
            <div className="overview-card">
              <h2>Welcome back, John!</h2>
              <p>Here's what's happening with your Organizational Excellence Assessment today.</p>
              
              <div className="stats-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '24px'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>Submitted Responses</h3>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '8px'
                  }}>
                    {statsLoading ? '...' : dashboardStats?.activePeriods || 0}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Current reporting cycles</div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>Overdue Responses</h3>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '8px'
                  }}>
                    {statsLoading ? '...' : dashboardStats?.overdueResponses || 0}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Past due assessments</div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>Pending Reviews</h3>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '8px'
                  }}>
                    {statsLoading ? '...' : dashboardStats?.pendingReviews || 0}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Awaiting approval</div>
                </div>
                
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#374151',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>Compliance Score</h3>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                    marginBottom: '8px'
                  }}>
                    {statsLoading ? '...' : `${dashboardStats?.complianceScore || 0}%`}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>Overall performance rating</div>
                </div>
              </div>
              
              {/* Organization Info */}
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginBottom: '8px'
                }}>
                  📊 Organization: <strong>{getOrganizationName(selectedOrganization)}</strong>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8'
                }}>
                  Last updated: {dashboardStats?.lastUpdated ? new Date(dashboardStats.lastUpdated).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <div className="actions-card">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('create-period')}
                >
                  <div className="action-icon" style={{ backgroundColor: 'var(--primary-color)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>Submit an Assessment</h4>
                    <p>Start a new reporting period</p>
                  </div>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('view-analytics')}
                >
                  <div className="action-icon" style={{ backgroundColor: 'var(--secondary-color)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M3 3v18h18"/>
                      <path d="M7 12l3-3 3 3 4-4"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>View Analytics</h4>
                    <p>Check compliance metrics</p>
                  </div>
                </button>
                
                {/* <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('manage-users')}
                >
                  <div className="action-icon" style={{ backgroundColor: '#92278f' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>Manage Users</h4>
                    <p>Update user permissions</p>
                  </div>
                </button> */}
                
                {/* <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('settings')}
                >
                  <div className="action-icon" style={{ backgroundColor: '#6b7280' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>Settings</h4>
                    <p>Configure portal settings</p>
                  </div>
                </button> */}
                
                <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('view-submissions')}
                >
                  <div className="action-icon" style={{ backgroundColor: '#059669' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>View Submissions</h4>
                    <p>Check submitted assessments</p>
                  </div>
                </button>
                
                {/* <button 
                  className="action-btn"
                  onClick={() => handleQuickAction('export-data')}
                >
                  <div className="action-icon" style={{ backgroundColor: '#dc2626' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                  <div className="action-content">
                    <h4>Export Data</h4>
                    <p>Download assessment data</p>
                  </div>
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Survey Modal */}
        <PeriodSurvey
          isOpen={isSurveyOpen}
          onClose={() => setIsSurveyOpen(false)}
          onComplete={handleSurveyComplete}
        />

        {/* Submission Modal */}
        <SubmissionModal
          isOpen={isSubmissionModalOpen}
          onClose={() => setIsSubmissionModalOpen(false)}
          selectedOrganization={selectedOrganization}
        />
      </div>
    </>
  );
}
