const getSupportData = () => {
  return {
    supportCategories: [
      {
        name: "Y-USA Support",
        description: "Associations requiring additional support from Y-USA",
        deliveryChannels: {
          networkSupported: {
            name: "Network Supported",
            resources: [
              "Learning Centers",
              "Innovation Teams", 
              "Thought Leader and Activation",
              "Cohorts",
              "Peer Communities"
            ]
          },
          directDelivery: {
            name: "Direct Delivery",
            resources: [
              "Y-USA",
              "Alliances",
              "Service Delivery Partners",
              "Third-party Partners"
            ]
          },
          sharedServices: {
            name: "Shared Services",
            resources: [
              "Y-USA",
              "YESS"
            ]
          }
        }
      },
      {
        name: "Independent Improvement",
        description: "Associations capable of self-directed improvement",
        deliveryChannels: {
          networkSupported: {
            name: "Network Supported",
            resources: [
              "Learning Centers",
              "Innovation Teams",
              "Thought Leader and Activation", 
              "Cohorts",
              "Peer Communities"
            ]
          },
          selfDirected: {
            name: "Self Directed",
            resources: [
              "Resources",
              "Activation Guides",
              "Tools",
              "On-demand Training"
            ]
          }
        }
      }
    ],
    scoringThresholds: {
      totalPoints: 80,
      operationalPoints: 40,
      financialPoints: 40,
      lowPerformanceThreshold: 20, // percentage
      immediateInterventionCriteria: [
        "Child Protection",
        "Aquatic Safety Membership Qualifications"
      ]
    },
    serviceDeliveryNetwork: {
      channels: [
        {
          name: "Self Directed",
          icon: "link",
          description: "Access via Link",
          color: "#ffffff"
        },
        {
          name: "Network Supported",
          icon: "network",
          description: "Access through any door",
          color: "#e8f4fd"
        },
        {
          name: "Direct Delivery",
          icon: "people",
          description: "Access through any door", 
          color: "#f0f8ff"
        },
        {
          name: "Shared Services",
          icon: "building",
          description: "Access through any door",
          color: "#f5f5f5"
        }
      ]
    }
  };
};

module.exports = { getSupportData }; 