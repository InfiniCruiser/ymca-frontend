const { Pool } = require('pg');
require('dotenv').config();

class PerformanceCalculationService {
  constructor() {
    this.db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'ymca_portal',
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    });
  }

  async calculateFromSubmissions(organizationId, period) {
    try {
      // Get submissions for organization and period
      const submissionsQuery = `
        SELECT * FROM submissions 
        WHERE organization_id = $1 AND period_id = $2
      `;
      const submissions = await this.db.query(submissionsQuery, [organizationId, period]);
      
      if (submissions.rows.length === 0) {
        throw new Error('No submissions found for calculation');
      }

      // Calculate performance metrics from survey responses
      const performance = this.calculateMetrics(submissions.rows);
      
      // Save calculation results
      await this.savePerformanceCalculation({
        organizationId,
        period,
        ...performance
      });

      return performance;
    } catch (error) {
      console.error('Performance calculation error:', error);
      throw error;
    }
  }

  calculateMetrics(submissions) {
    // Extract responses from submissions
    const allResponses = submissions.map(s => s.responses);
    
    // Calculate operational metric scores
    const membershipGrowth = this.calculateMembershipScore(allResponses);
    const staffRetention = this.calculateStaffScore(allResponses);
    const graceScore = this.calculateGraceScore(allResponses);
    const riskMitigation = this.calculateRiskScore(allResponses);
    const governance = this.calculateGovernanceScore(allResponses);
    const engagement = this.calculateEngagementScore(allResponses);

    // Calculate financial metric scores
    const monthsLiquidity = this.calculateMonthsLiquidityScore(allResponses);
    const operatingMargin = this.calculateOperatingMarginScore(allResponses);
    const debtRatio = this.calculateDebtRatioScore(allResponses);
    const operatingRevenueMix = this.calculateOperatingRevenueMixScore(allResponses);
    const charitableRevenue = this.calculateCharitableRevenueScore(allResponses);

    // Calculate totals
    const operationalTotalPoints = membershipGrowth + staffRetention + graceScore + 
                                  riskMitigation + governance + engagement;
    const financialTotalPoints = monthsLiquidity + operatingMargin + debtRatio + 
                                operatingRevenueMix + charitableRevenue;
    const totalPoints = operationalTotalPoints + financialTotalPoints;
    const percentage = (totalPoints / 80) * 100; // 80 max points in OEA structure

    return {
      membershipGrowthScore: membershipGrowth,
      staffRetentionScore: staffRetention,
      graceScore: graceScore,
      riskMitigationScore: riskMitigation,
      governanceScore: governance,
      engagementScore: engagement,
      monthsLiquidityScore: monthsLiquidity,
      operatingMarginScore: operatingMargin,
      debtRatioScore: debtRatio,
      operatingRevenueMixScore: operatingRevenueMix,
      charitableRevenueScore: charitableRevenue,
      operationalTotalPoints,
      financialTotalPoints,
      totalPoints,
      percentageScore: percentage,
      performanceCategory: this.getPerformanceCategory(percentage),
      supportDesignation: this.getSupportDesignation(percentage)
    };
  }

  calculateMembershipScore(responses) {
    // Implement OPC question mapping for membership growth
    let score = 0;
    responses.forEach(response => {
      // Map specific OPC questions to membership growth
      if (response['RM.CP.001'] === 'Yes') score += 2;
      if (response['GV.BO.001'] === 'Yes') score += 2;
      // Add more question mappings based on OPC framework
    });
    return Math.min(score, 4); // 4 max points in OEA structure
  }

  calculateStaffScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to staff retention
      if (response['RM.CP.002'] === 'Yes') score += 2;
      if (response['RM.CP.003'] === 'Yes') score += 2;
      // Add more mappings
    });
    return Math.min(score, 4); // 4 max points in OEA structure
  }

  calculateGraceScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to Grace metrics
      if (response['RM.CP.003'] === 'Yes') score += 2;
      // Add more mappings based on OEA framework
    });
    return Math.min(score, 4); // 4 max points in OEA structure
  }

  calculateMonthsLiquidityScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to months of liquidity
      if (response['FI.LQ.001'] === 'Yes') score += 3;
      if (response['FI.LQ.002'] === 'Yes') score += 3;
      if (response['FI.LQ.003'] === 'Yes') score += 3;
      if (response['FI.LQ.004'] === 'Yes') score += 3;
    });
    return Math.min(score, 12); // 12 max points in OEA structure
  }

  calculateOperatingMarginScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to operating margin
      if (response['FI.OM.001'] === 'Yes') score += 3;
      if (response['FI.OM.002'] === 'Yes') score += 3;
      if (response['FI.OM.003'] === 'Yes') score += 3;
      if (response['FI.OM.004'] === 'Yes') score += 3;
    });
    return Math.min(score, 12); // 12 max points in OEA structure
  }

  calculateDebtRatioScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to debt ratio
      if (response['FI.DR.001'] === 'Yes') score += 4;
      if (response['FI.DR.002'] === 'Yes') score += 4;
    });
    return Math.min(score, 8); // 8 max points in OEA structure
  }

  calculateOperatingRevenueMixScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to operating revenue mix
      if (response['FI.ORM.001'] === 'Yes') score += 2;
      if (response['FI.ORM.002'] === 'Yes') score += 2;
    });
    return Math.min(score, 4); // 4 max points in OEA structure
  }

  calculateCharitableRevenueScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to charitable revenue
      if (response['FI.CR.001'] === 'Yes') score += 2;
      if (response['FI.CR.002'] === 'Yes') score += 2;
    });
    return Math.min(score, 4); // 4 max points in OEA structure
  }

  calculateRiskScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to risk mitigation
      if (response['RM.CP.004'] === 'Yes') score += 2;
      if (response['RM.CP.005'] === 'Yes') score += 2;
      if (response['RM.CP.006'] === 'Yes') score += 2;
      if (response['RM.CP.007'] === 'Yes') score += 2;
      // Add more mappings
    });
    return Math.min(score, 8); // 8 max points in OEA structure
  }

  calculateGovernanceScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to governance
      if (response['GV.BO.001'] === 'Yes') score += 2;
      if (response['GV.BO.002'] === 'Yes') score += 2;
      if (response['GV.BO.003'] === 'Yes') score += 2;
      if (response['GV.BO.004'] === 'Yes') score += 2;
      if (response['GV.BO.005'] === 'Yes') score += 2;
      if (response['GV.BO.006'] === 'Yes') score += 2;
      // Add more mappings
    });
    return Math.min(score, 12); // 12 max points in OEA structure
  }

  calculateEngagementScore(responses) {
    let score = 0;
    responses.forEach(response => {
      // Map OPC questions to engagement
      if (response['RM.AQ.001'] === 'Yes') score += 2;
      if (response['RM.AQ.002'] === 'Yes') score += 2;
      if (response['RM.AQ.003'] === 'Yes') score += 2;
      if (response['RM.AQ.004'] === 'Yes') score += 2;
      // Add more mappings
    });
    return Math.min(score, 8); // 8 max points in OEA structure
  }

  getPerformanceCategory(percentage) {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'moderate';
    return 'low';
  }

  getSupportDesignation(percentage) {
    if (percentage >= 70) return 'Independent Improvement';
    if (percentage >= 40) return 'Standard';
    return 'Y-USA Support';
  }

  async savePerformanceCalculation(performance) {
    const query = `
      INSERT INTO performance_calculations 
      (organization_id, period, 
       membership_growth_score, staff_retention_score, grace_score,
       risk_mitigation_score, governance_score, engagement_score,
       months_liquidity_score, operating_margin_score, debt_ratio_score,
       operating_revenue_mix_score, charitable_revenue_score,
       operational_total_points, financial_total_points, total_points,
       percentage_score, performance_category, support_designation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      ON CONFLICT (organization_id, period) 
      DO UPDATE SET 
        membership_growth_score = EXCLUDED.membership_growth_score,
        staff_retention_score = EXCLUDED.staff_retention_score,
        grace_score = EXCLUDED.grace_score,
        risk_mitigation_score = EXCLUDED.risk_mitigation_score,
        governance_score = EXCLUDED.governance_score,
        engagement_score = EXCLUDED.engagement_score,
        months_liquidity_score = EXCLUDED.months_liquidity_score,
        operating_margin_score = EXCLUDED.operating_margin_score,
        debt_ratio_score = EXCLUDED.debt_ratio_score,
        operating_revenue_mix_score = EXCLUDED.operating_revenue_mix_score,
        charitable_revenue_score = EXCLUDED.charitable_revenue_score,
        operational_total_points = EXCLUDED.operational_total_points,
        financial_total_points = EXCLUDED.financial_total_points,
        total_points = EXCLUDED.total_points,
        percentage_score = EXCLUDED.percentage_score,
        performance_category = EXCLUDED.performance_category,
        support_designation = EXCLUDED.support_designation,
        updated_at = NOW()
    `;
    
    await this.db.query(query, [
      performance.organizationId,
      performance.period,
      performance.membershipGrowthScore,
      performance.staffRetentionScore,
      performance.graceScore,
      performance.riskMitigationScore,
      performance.governanceScore,
      performance.engagementScore,
      performance.monthsLiquidityScore,
      performance.operatingMarginScore,
      performance.debtRatioScore,
      performance.operatingRevenueMixScore,
      performance.charitableRevenueScore,
      performance.operationalTotalPoints,
      performance.financialTotalPoints,
      performance.totalPoints,
      performance.percentageScore,
      performance.performanceCategory,
      performance.supportDesignation
    ]);
  }

  async getOverviewData() {
    const query = `
      SELECT 
        o.id,
        o.name,
        o.code,
        pc.percentage_score,
        pc.performance_category,
        pc.total_points,
        pc.operational_total_points,
        pc.financial_total_points,
        pc.support_designation,
        pc.calculated_at
      FROM organizations o
      LEFT JOIN performance_calculations pc ON o.id = pc.organization_id
      WHERE o.is_active = true
      ORDER BY pc.percentage_score DESC NULLS LAST
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }

  async getOrganizationPerformance(organizationId) {
    const query = `
      SELECT 
        o.*,
        pc.*,
        s.total_questions,
        s.completed
      FROM organizations o
      LEFT JOIN performance_calculations pc ON o.id = pc.organization_id
      LEFT JOIN submissions s ON o.id = s.organization_id
      WHERE o.id = $1
    `;
    
    const result = await this.db.query(query, [organizationId]);
    return result.rows[0];
  }

  // Test database connection
  async testConnection() {
    try {
      const result = await this.db.query('SELECT NOW()');
      console.log('Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Close database connection
  async close() {
    await this.db.end();
  }
}

module.exports = PerformanceCalculationService;
