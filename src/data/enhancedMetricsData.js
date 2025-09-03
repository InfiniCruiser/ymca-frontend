const getEnhancedMetricsData = () => {
  return {
    xyz: {
      name: "XYZ YMCA",
      totalPoints: 32,
      maxPoints: 80,
      overallSupportDesignation: "Y-USA Support",
      performanceSnapshot: {
        operationalPerformance: {
          category: "Operational Performance",
          metrics: [
            {
              name: "Membership Growth",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Measures the growth percentage of the association's total impact compared to the prior year",
              calculation: "(Current Members – Prior Year Members) ÷ Prior Year Members – Demographic Growth of Service Area",
              scoring: {
                "0-33%": "0 pts (Bottom third)",
                "34-66%": "2 pts (Middle third)", 
                "67-100%": "4 pts (Top third)"
              },
              currentValue: "45%",
              priorYearValue: "42%",
              demographicGrowth: "2%",
              reasoning: "XYZ YMCA shows moderate growth at 45%, which is above the demographic growth rate of 2% but still in the middle third range. This indicates steady but not exceptional growth performance."
            },
            {
              name: "Staff Retention",
              points: 0,
              maxPoints: 4,
              performance: "low",
              description: "Measures the percentage of staff members the Y association has retained over the course of a year",
              calculation: "(Beginning FT Staff – Departed FT Staff) ÷ Beginning FT Staff",
              scoring: {
                "20% turnover": "0 pts",
                "10-20% turnover": "2 pts",
                "<10% turnover": "4 pts"
              },
              currentValue: "22% turnover",
              beginningStaff: 45,
              departedStaff: 10,
              reasoning: "With 22% staff turnover, XYZ YMCA falls into the lowest scoring category. This high turnover rate indicates potential issues with staff satisfaction, compensation, or workplace culture that need immediate attention."
            },
            {
              name: "For All Score",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Measures a Y's commitment to engaging all dimensions of diversity creating a sense of belonging",
              scoring: {
                "0-3 pts": "0 pts (Not at all engaged)",
                "4-13 pts": "2 pts (Some engagement)",
                "14-18 pts": "4 pts (Very engaged)"
              },
              currentValue: "8 pts",
              reasoning: "XYZ YMCA shows some engagement in diversity and inclusion initiatives, scoring 8 points. While this demonstrates progress, there's significant room for improvement to reach the 'very engaged' category."
            },
            {
              name: "Risk Mitigation",
              points: 8,
              maxPoints: 8,
              performance: "high",
              description: "Measures the risk management practices at the Y association, including child protection and aquatic safety",
              subMetrics: [
                {
                  name: "Child Protection",
                  points: 2,
                  maxPoints: 2,
                  performance: "high",
                  subMetrics: [
                    { name: "Child Protection Membership Qualification", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Share self-assessment results with Board", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Certified Praesidium Guardian on staff or plan", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Achieved Praesidium accreditation", points: 0.5, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "Aquatic Safety",
                  points: 2,
                  maxPoints: 2,
                  performance: "high",
                  subMetrics: [
                    { name: "Membership Qualification met", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Biannual self-assessment", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Third-party safety audits", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Community education", points: 0.5, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "IP/Trademark Risk",
                  points: 2,
                  maxPoints: 2,
                  performance: "high",
                  subMetrics: [
                    { name: "Brand standards compliance & audit", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Attends Y-USA brand training", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Uses electronic sublicense tool", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Legal counsel for outside brand use", points: 0.5, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "Risk Management Framework",
                  points: 2,
                  maxPoints: 2,
                  performance: "high",
                  subMetrics: [
                    { name: "Completed risk assessment", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Prioritized mitigation plan", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Implemented & monitored action plan", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Enterprise Risk Management process", points: 0.5, achieved: true, status: "Completed" }
                  ]
                }
              ]
            },
            {
              name: "Governance",
              points: 12,
              maxPoints: 12,
              performance: "high",
              description: "Measures the governance practices at the Y association, including strategic planning and board responsibilities",
              subMetrics: [
                {
                  name: "Strategic Planning",
                  points: 3,
                  maxPoints: 3,
                  performance: "high",
                  subMetrics: [
                    { name: "Board as strategic partner", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Strategic plan in past 3 years", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Action plan to realize goals", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Community stakeholder engagement", points: 0.75, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "Board Responsibilities",
                  points: 3,
                  maxPoints: 3,
                  performance: "high",
                  subMetrics: [
                    { name: "Compliance with Y-USA & legal standards", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Board-CEO goals & appraisal process", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Bylaws reviewed in past 3 years", points: 0.75, achieved: true, status: "Completed" },
                    { name: "External communication transparency", points: 0.75, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "Board Effectiveness",
                  points: 3,
                  maxPoints: 3,
                  performance: "high",
                  subMetrics: [
                    { name: "Budget aligned with strategy", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Fiscal oversight & risk policy", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Board reflects community / inclusion tracked", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Board assessment every 3 years", points: 0.75, achieved: true, status: "Completed" }
                  ]
                },
                {
                  name: "Functional Roles",
                  points: 3,
                  maxPoints: 3,
                  performance: "high",
                  subMetrics: [
                    { name: "Finance committee active", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Compliance committee for risk", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Development committee for fundraising", points: 0.75, achieved: true, status: "Completed" },
                    { name: "Board evaluation & accountability", points: 0.75, achieved: true, status: "Completed" }
                  ]
                }
              ]
            },
            {
              name: "Engagement",
              points: 4,
              maxPoints: 8,
              performance: "moderate",
              description: "Measures the organizational practices at the Y association, including staff, member, volunteer, and community engagement",
              subMetrics: [
                {
                  name: "Member Engagement",
                  points: 1,
                  maxPoints: 2,
                  performance: "moderate",
                  subMetrics: [
                    { name: "SOPs for service & audits", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Member data & insights strategy", points: 0.5, achieved: false, status: "In Progress" },
                    { name: "Business model reassessment", points: 0.5, achieved: false, status: "Not Started" },
                    { name: "Partner engagement for access", points: 0.5, achieved: false, status: "Not Started" }
                  ]
                },
                {
                  name: "Staff Engagement",
                  points: 1,
                  maxPoints: 2,
                  performance: "moderate",
                  subMetrics: [
                    { name: "Annual staff feedback survey", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Improvement plan based on feedback", points: 0.5, achieved: false, status: "In Progress" },
                    { name: "Ongoing staff training", points: 0.5, achieved: false, status: "Not Started" },
                    { name: "Annual 360° staff reviews", points: 0.5, achieved: false, status: "Not Started" }
                  ]
                },
                {
                  name: "Volunteer Engagement",
                  points: 1,
                  maxPoints: 2,
                  performance: "moderate",
                  subMetrics: [
                    { name: "Volunteer satisfaction survey", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Improvement plan based on feedback", points: 0.5, achieved: false, status: "In Progress" },
                    { name: "Onboarding and screening", points: 0.5, achieved: false, status: "Not Started" },
                    { name: "Volunteer spotlighting", points: 0.5, achieved: false, status: "Not Started" }
                  ]
                },
                {
                  name: "Community Engagement",
                  points: 1,
                  maxPoints: 2,
                  performance: "moderate",
                  subMetrics: [
                    { name: "Community Benefit sheet shared", points: 0.5, achieved: true, status: "Completed" },
                    { name: "Leadership community engagement", points: 0.5, achieved: false, status: "In Progress" },
                    { name: "Fundraising with case for support", points: 0.5, achieved: false, status: "Not Started" },
                    { name: "Strategic partnerships for impact", points: 0.5, achieved: false, status: "Not Started" }
                  ]
                }
              ]
            }
          ],
          totalPoints: 28,
          maxPoints: 40,
          supportDesignation: "Independent Improvement"
        },
        financialPerformance: {
          category: "Financial Performance",
          metrics: [
            {
              name: "Months of Liquidity",
              points: 0,
              maxPoints: 12,
              performance: "low",
              description: "Measures how much cash you have in relation to your monthly operating expenses",
              calculation: "(Cash + Short-Term Investments) ÷ (Total Expenses ÷ 12)",
              scoring: {
                "<1.5 months": "0 pts",
                "1.5–3 months": "2 pts",
                "3+ months": "4 pts"
              },
              currentValue: "1.2 months",
              cashAndInvestments: 120000,
              monthlyExpenses: 100000,
              reasoning: "With only 1.2 months of liquidity, XYZ YMCA is below the minimum threshold of 1.5 months. This indicates potential cash flow challenges and limited financial flexibility."
            },
            {
              name: "Operating Margin",
              points: 0,
              maxPoints: 12,
              performance: "low",
              description: "Ratio measures the percentage by which your Operating Revenues exceed your Operating Expenses",
              calculation: "(Operating Revenue – Expenses) ÷ Revenue",
              scoring: {
                "<2.7%": "0 pts",
                "2.7–3.0%": "2 pts",
                "3%+": "4 pts"
              },
              currentValue: "1.8%",
              operatingRevenue: 2500000,
              operatingExpenses: 2455000,
              reasoning: "At 1.8% operating margin, XYZ YMCA falls below the 2.7% threshold. This indicates tight financial performance with limited surplus for reinvestment or reserves."
            },
            {
              name: "Debt Ratio",
              points: 0,
              maxPoints: 8,
              performance: "low",
              description: "Ratio indicates the extent to which the Y association relies on debt financing",
              calculation: "Total Debt ÷ Unrestricted Net Assets",
              scoring: {
                "<22.5%": "4 pts",
                "22.5–27%": "2 pts",
                "27%+": "0 pts"
              },
              currentValue: "32%",
              totalDebt: 800000,
              unrestrictedNetAssets: 2500000,
              reasoning: "With a 32% debt ratio, XYZ YMCA exceeds the 27% threshold, indicating high reliance on debt financing and potential financial risk."
            },
            {
              name: "Operating Revenue Mix",
              points: 2,
              maxPoints: 4,
              performance: "moderate",
              description: "Ratio reflects the degree of reliance the Y association has on a primary income source",
              calculation: "|Program Revenue % – Membership Revenue %|",
              scoring: {
                "40%+": "0 pts",
                "20–40%": "2 pts",
                "<20%": "4 pts"
              },
              currentValue: "25%",
              programRevenuePercent: 60,
              membershipRevenuePercent: 35,
              reasoning: "With a 25% difference between program and membership revenue, XYZ YMCA shows moderate revenue diversification, falling in the middle scoring range."
            },
            {
              name: "Charitable Revenue",
              points: 4,
              maxPoints: 4,
              performance: "high",
              description: "Ratio reflects the percentage of charitable revenue relative to the Y association's total operating revenue",
              calculation: "Charitable Revenue ÷ Operating Revenue",
              scoring: {
                "<9.8%": "0 pts",
                "9.8–15%": "2 pts",
                "15%+": "4 pts"
              },
              currentValue: "16.2%",
              charitableRevenue: 405000,
              totalOperatingRevenue: 2500000,
              reasoning: "At 16.2% charitable revenue, XYZ YMCA exceeds the 15% threshold, demonstrating strong philanthropic support and community investment."
            }
          ],
          totalPoints: 6,
          maxPoints: 40,
          supportDesignation: "Y-USA Support"
        }
      }
    }
  };
};

module.exports = { getEnhancedMetricsData }; 