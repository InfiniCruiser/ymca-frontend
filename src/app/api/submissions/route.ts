import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://ymca-backend-c1a73b2f2522.herokuapp.com';

export async function GET(request: NextRequest) {
  try {
    // Try to connect to backend first
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/submissions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Submissions loaded from backend');
        return NextResponse.json({
          success: true,
          submissions: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (backendError) {
      console.log('⚠️ Backend unavailable, using local storage data:', backendError instanceof Error ? backendError.message : 'Unknown error');
    }

    // Return empty array when backend is unavailable
    // The frontend will handle this gracefully
    console.log('✅ Submissions loaded from fallback (empty)');
    return NextResponse.json({
      success: true,
      submissions: [],
      timestamp: new Date().toISOString(),
      source: 'fallback'
    });

  } catch (error) {
    console.error('❌ Submissions error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Submit the survey responses to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend submission creation error:', response.status, errorText);
      throw new Error(`Backend submission creation error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('✅ Submission created successfully');

    // If the submission includes calculated scores, also save them to performance_calculations
    if (body.calculatedScores && body.organizationId) {
      try {
        const performanceData = {
          organizationId: body.organizationId,
          period: body.periodId || `period_${Date.now()}`,
          // Operational scores (calculated from survey responses)
          riskMitigationScore: body.calculatedScores.operational.riskMitigationScore,
          governanceScore: body.calculatedScores.operational.governanceScore,
          engagementScore: body.calculatedScores.operational.engagementScore,
          // Membership scores (mock for now)
          membershipGrowthScore: body.calculatedScores.membership.membershipGrowthScore,
          staffRetentionScore: body.calculatedScores.membership.staffRetentionScore,
          graceScore: body.calculatedScores.membership.graceScore,
          // Financial scores (mock for now)
          monthsLiquidityScore: body.calculatedScores.financial.monthsLiquidityScore,
          operatingMarginScore: body.calculatedScores.financial.operatingMarginScore,
          debtRatioScore: body.calculatedScores.financial.debtRatioScore,
          operatingRevenueMixScore: body.calculatedScores.financial.operatingRevenueMixScore,
          charitableRevenueScore: body.calculatedScores.financial.charitableRevenueScore,
          // Aggregated scores
          operationalTotalPoints: body.calculatedScores.operational.totalOperationalPoints,
          financialTotalPoints: body.calculatedScores.financial.totalFinancialPoints,
          totalPoints: body.calculatedScores.totalPoints,
          percentageScore: body.calculatedScores.percentageScore,
          performanceCategory: body.calculatedScores.performanceCategory,
          supportDesignation: body.calculatedScores.supportDesignation
        };

        // Save performance calculation to backend
        const performanceResponse = await fetch(`${BACKEND_URL}/api/v1/performance-calculations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(performanceData)
        });

        if (performanceResponse.ok) {
          console.log('✅ Performance calculation saved successfully');
        } else {
          console.warn('⚠️ Failed to save performance calculation, but submission was successful');
        }
      } catch (performanceError) {
        console.warn('⚠️ Error saving performance calculation:', performanceError);
        // Don't fail the entire submission if performance calculation fails
      }
    }

    return NextResponse.json({
      success: true,
      submission: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submission creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
