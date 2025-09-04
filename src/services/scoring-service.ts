import { Question } from '@/data/framework-questions.json';

export interface OperationalScores {
  riskMitigationScore: number;
  governanceScore: number;
  engagementScore: number;
  totalOperationalPoints: number;
  maxOperationalPoints: number;
}

export interface MembershipScores {
  membershipGrowthScore: number;
  staffRetentionScore: number;
  graceScore: number;
  totalMembershipPoints: number;
  maxMembershipPoints: number;
}

export interface FinancialScores {
  monthsLiquidityScore: number;
  operatingMarginScore: number;
  debtRatioScore: number;
  operatingRevenueMixScore: number;
  charitableRevenueScore: number;
  totalFinancialPoints: number;
  maxFinancialPoints: number;
}

export interface AllScores {
  operational: OperationalScores;
  membership: MembershipScores;
  financial: FinancialScores;
  totalPoints: number;
  maxTotalPoints: number;
  percentageScore: number;
  supportDesignation: string;
  performanceCategory: string;
}

export class ScoringService {
  /**
   * Calculate operational performance scores from survey responses
   * These are the scores that can be calculated from the actual survey questions
   */
  calculateOperationalScores(responses: Record<string, any>, questions: Question[]): OperationalScores {
    let riskMitigationScore = 0;
    let governanceScore = 0;
    let engagementScore = 0;
    let maxRiskMitigation = 0;
    let maxGovernance = 0;
    let maxEngagement = 0;

    questions.forEach((question) => {
      const response = responses[question.id];
      const score = response === 'Yes' ? question.score : 0;

      if (question.section === 'Risk Mitigation') {
        riskMitigationScore += score;
        maxRiskMitigation += question.score;
      } else if (question.section === 'Governance') {
        governanceScore += score;
        maxGovernance += question.score;
      } else if (question.section === 'Engagement') {
        engagementScore += score;
        maxEngagement += question.score;
      }
    });

    const totalOperationalPoints = riskMitigationScore + governanceScore + engagementScore;
    const maxOperationalPoints = maxRiskMitigation + maxGovernance + maxEngagement;

    return {
      riskMitigationScore,
      governanceScore,
      engagementScore,
      totalOperationalPoints,
      maxOperationalPoints
    };
  }

  /**
   * Calculate membership and program growth scores
   * Currently returns mock data until real calculation logic is implemented
   */
  calculateMembershipScores(): MembershipScores {
    // TODO: Implement real calculation logic when available
    // For now, return mock data that matches the expected structure
    return {
      membershipGrowthScore: 0, // Mock: would be calculated from actual data
      staffRetentionScore: 0,   // Mock: would be calculated from actual data
      graceScore: 0,            // Mock: would be calculated from actual data
      totalMembershipPoints: 0,
      maxMembershipPoints: 12   // 4 + 4 + 4 = 12 max points
    };
  }

  /**
   * Calculate financial performance scores
   * Currently returns mock data until real calculation logic is implemented
   */
  calculateFinancialScores(): FinancialScores {
    // TODO: Implement real calculation logic when available
    // For now, return mock data that matches the expected structure
    return {
      monthsLiquidityScore: 0,        // Mock: would be calculated from actual data
      operatingMarginScore: 0,        // Mock: would be calculated from actual data
      debtRatioScore: 0,              // Mock: would be calculated from actual data
      operatingRevenueMixScore: 0,    // Mock: would be calculated from actual data
      charitableRevenueScore: 0,      // Mock: would be calculated from actual data
      totalFinancialPoints: 0,
      maxFinancialPoints: 20          // 4 + 4 + 4 + 4 + 4 = 20 max points
    };
  }

  /**
   * Calculate all scores and return comprehensive scoring data
   */
  calculateAllScores(responses: Record<string, any>, questions: Question[]): AllScores {
    const operational = this.calculateOperationalScores(responses, questions);
    const membership = this.calculateMembershipScores();
    const financial = this.calculateFinancialScores();

    const totalPoints = operational.totalOperationalPoints + membership.totalMembershipPoints + financial.totalFinancialPoints;
    const maxTotalPoints = operational.maxOperationalPoints + membership.maxMembershipPoints + financial.maxFinancialPoints;
    const percentageScore = maxTotalPoints > 0 ? (totalPoints / maxTotalPoints) * 100 : 0;

    return {
      operational,
      membership,
      financial,
      totalPoints,
      maxTotalPoints,
      percentageScore,
      supportDesignation: this.getSupportDesignation(percentageScore),
      performanceCategory: this.getPerformanceCategory(percentageScore)
    };
  }

  /**
   * Get support designation based on percentage score
   */
  private getSupportDesignation(percentage: number): string {
    if (percentage >= 40) return 'Standard';
    return 'Y-USA Support';
  }

  /**
   * Get performance category based on percentage score
   */
  private getPerformanceCategory(percentage: number): string {
    if (percentage >= 80) return 'Exemplary';
    if (percentage >= 60) return 'Strong';
    if (percentage >= 40) return 'Developing';
    return 'Needs Support';
  }

  /**
   * Format scores for backend storage (matches performance_calculations table structure)
   */
  formatForBackendStorage(scores: AllScores, organizationId: string, period: string) {
    return {
      organizationId,
      period,
      // Operational scores
      riskMitigationScore: scores.operational.riskMitigationScore,
      governanceScore: scores.operational.governanceScore,
      engagementScore: scores.operational.engagementScore,
      // Membership scores (mock for now)
      membershipGrowthScore: scores.membership.membershipGrowthScore,
      staffRetentionScore: scores.membership.staffRetentionScore,
      graceScore: scores.membership.graceScore,
      // Financial scores (mock for now)
      monthsLiquidityScore: scores.financial.monthsLiquidityScore,
      operatingMarginScore: scores.financial.operatingMarginScore,
      debtRatioScore: scores.financial.debtRatioScore,
      operatingRevenueMixScore: scores.financial.operatingRevenueMixScore,
      charitableRevenueScore: scores.financial.charitableRevenueScore,
      // Aggregated scores
      operationalTotalPoints: scores.operational.totalOperationalPoints,
      financialTotalPoints: scores.financial.totalFinancialPoints,
      totalPoints: scores.totalPoints,
      percentageScore: scores.percentageScore,
      performanceCategory: scores.performanceCategory,
      supportDesignation: scores.supportDesignation
    };
  }
}

// Export singleton instance
export const scoringService = new ScoringService();
