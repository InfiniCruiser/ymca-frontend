/**
 * AI Advisory Framework for YMCA Management Hub
 * Provides intelligent analysis and recommendations using Azure OpenAI
 */

console.log('🚀 ai-advisory-framework.js loading...');

// Base AI Provider Interface
// Prevent duplicate class declarations
if (typeof window !== 'undefined' && window.AIProviderInterface) {
    console.log('AIProviderInterface already declared, skipping...');
} else {
    window.AIProviderInterface = class AIProviderInterface {
        async generateAnalysis(prompt, context) {
            throw new Error('Must be implemented by provider');
        }
        
        async generateRecommendations(prompt, context) {
            throw new Error('Must be implemented by provider');
        }
    };

    // Azure OpenAI Provider Implementation
    window.AzureOpenAIProvider = class AzureOpenAIProvider extends window.AIProviderInterface {
    constructor(config) {
        super();
        
        // Validate config
        if (!config) {
            throw new Error('Azure OpenAI config is required');
        }
        
        this.config = config;
        this.endpoint = config.endpoint || null;
        this.apiKey = config.apiKey || null;
        this.deployment = config.deployment || null;
        this.apiVersion = config.apiVersion || '2024-02-15-preview';
        this.model = config.model || 'gpt-4';
        
        console.log('🔧 AzureOpenAIProvider constructed with:', {
            hasEndpoint: !!this.endpoint,
            hasDeployment: !!this.deployment,
            hasApiKey: !!this.apiKey,
            model: this.model
        });
    }
    
    async generateAnalysis(prompt, context) {
        try {
            // Use secure API endpoint instead of direct Azure OpenAI call
            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    context: context
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                content: data.content,
                usage: data.usage,
                model: data.model || this.model
            };
            
        } catch (error) {
            console.error('Azure OpenAI API call failed:', error);
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }
    
    async generateRecommendations(prompt, context) {
        return await this.generateAnalysis(prompt, context);
    }
}

    // Base Advisor Class
    window.BaseAdvisor = class BaseAdvisor {
    constructor(provider, config) {
        this.provider = provider;
        this.config = config;
        this.category = config.category;
        this.name = config.name;
        this.description = config.description;
    }
    
    async analyze(ymcaData, context = {}) {
        const performanceContext = this.extractPerformanceContext(ymcaData);
        const prompt = this.buildPrompt(ymcaData, context);
        
        // Check if provider is available
        if (!this.provider) {
            console.log(`⚠️ No AI provider available for ${this.name}, using fallback analysis`);
            return this.generateFallbackAnalysis(ymcaData, context);
        }
        
        try {
            const aiResponse = await this.provider.generateAnalysis(prompt, context);
            
            if (aiResponse.success) {
                return this.parseAIResponse(aiResponse.content, ymcaData, context);
            } else {
                // Fallback to rule-based analysis
                return this.generateFallbackAnalysis(ymcaData, context);
            }
        } catch (error) {
            console.error(`Error in ${this.name} analysis:`, error);
            return this.generateFallbackAnalysis(ymcaData, context);
        }
    }
    
    extractPerformanceContext(ymcaData) {
        return {
            overallScore: ymcaData.totalPoints || 0,
            maxScore: ymcaData.maxPoints || 80,
            percentage: ymcaData.percentage || 0,
            supportDesignation: ymcaData.overallSupportDesignation || 'Standard',
            period: ymcaData.period || 'current',
            calculatedAt: ymcaData.calculatedAt || new Date().toISOString()
        };
    }
    
    buildPrompt(ymcaData, context) {
        const performanceContext = this.extractPerformanceContext(ymcaData);
        
        return {
            system: this.getSystemPrompt(),
            user: this.buildUserPrompt(ymcaData, performanceContext, context)
        };
    }
    
    getSystemPrompt() {
        return `You are an expert YMCA consultant specializing in ${this.category} analysis. 
        Provide clear, actionable insights and recommendations based on the performance data provided.
        Focus on practical, implementable solutions that align with YMCA values and mission.
        
        CRITICAL: Use EXACTLY this format with NO Markdown formatting, NO headers, NO bold text:
        
        Executive Summary:
        [Your summary here - plain text only]
        
        Key Insights:
        - [Insight 1]
        - [Insight 2]
        
        Recommended Actions:
        Immediate:
        - [Action 1]
        - [Action 2]
        
        Short-term:
        - [Action 1]
        - [Action 2]
        
        Long-term:
        - [Action 1]
        - [Action 2]
        
        Success Metrics:
        - [Metric 1]
        - [Metric 2]
        
        Special Considerations:
        - [Consideration 1]
        - [Consideration 2]`;
    }
    
    buildUserPrompt(ymcaData, performanceContext, context) {
        return `Analyze the following YMCA performance data and provide insights:

YMCA: ${ymcaData.name}
Overall Score: ${performanceContext.overallScore}/${performanceContext.maxScore} (${performanceContext.percentage}%)
Support Designation: ${performanceContext.supportDesignation}
Period: ${performanceContext.period}

Performance Data: ${JSON.stringify(ymcaData.performanceSnapshot, null, 2)}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Insights (3-5 bullet points)
3. Recommended Actions (prioritized by immediate, short-term, long-term)
4. Success Metrics
5. Special Considerations for YMCAs`;
    }
    
    parseAIResponse(aiContent, ymcaData, context) {
        try {
            // Debug: Log what we received from AI
            console.log(`🤖 ${this.name} received AI response:`, {
                contentLength: aiContent?.length || 0,
                contentType: typeof aiContent,
                preview: aiContent?.substring(0, 200) || 'NO CONTENT'
            });
            
            // Try to parse structured response
            const sections = this.extractSections(aiContent);
            
            console.log(`✅ ${this.name} parsed sections:`, sections);
            
            return {
                category: this.category,
                advisor: this.name,
                timestamp: new Date().toISOString(),
                ymcaId: ymcaData.id,
                ymcaName: ymcaData.name,
                performanceContext: this.extractPerformanceContext(ymcaData),
                executiveSummary: sections.executiveSummary || 'Analysis completed',
                keyInsights: sections.keyInsights || [],
                recommendedActions: sections.recommendedActions || {},
                successMetrics: sections.successMetrics || [],
                specialConsiderations: sections.specialConsiderations || [],
                rawAIResponse: aiContent,
                source: 'azure-openai'
            };
        } catch (error) {
            console.error(`❌ ${this.name} Error parsing AI response:`, error);
            console.error('Raw AI content was:', aiContent);
            return this.generateFallbackAnalysis(ymcaData, context);
        }
    }
    
    extractSections(content) {
        // Simple section extraction - can be enhanced with more sophisticated parsing
        const sections = {};
        
        // Safety check for content
        if (!content || typeof content !== 'string') {
            console.warn('⚠️ extractSections: Invalid content received:', content);
            return sections;
        }
        
        // Extract executive summary
        const summaryMatch = content.match(/Executive Summary[:\s]*([^]*?)(?=Key Insights|$)/i);
        if (summaryMatch && summaryMatch[1]) sections.executiveSummary = summaryMatch[1].trim();
        
        // Extract key insights
        const insightsMatch = content.match(/Key Insights[:\s]*([^]*?)(?=Recommended Actions|$)/i);
        if (insightsMatch && insightsMatch[1]) {
            sections.keyInsights = insightsMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(line => line.length > 0);
        }
        
        // Extract recommended actions
        const actionsMatch = content.match(/Recommended Actions[:\s]*([^]*?)(?=Success Metrics|$)/i);
        if (actionsMatch && actionsMatch[1]) {
            const actionsText = actionsMatch[1];
            sections.recommendedActions = {
                immediate: this.extractActionList(actionsText, 'immediate'),
                shortTerm: this.extractActionList(actionsText, 'short-term'),
                longTerm: this.extractActionList(actionsText, 'long-term')
            };
        }
        
        // Extract success metrics
        const metricsMatch = content.match(/Success Metrics[:\s]*([^]*?)(?=Special Considerations|$)/i);
        if (metricsMatch && metricsMatch[1]) {
            sections.successMetrics = metricsMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(line => line.length > 0);
        }
        
        // Extract special considerations
        const considerationsMatch = content.match(/Special Considerations[:\s]*([^]*?)(?=$)/i);
        if (considerationsMatch && considerationsMatch[1]) {
            sections.specialConsiderations = considerationsMatch[1]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(line => line.length > 0);
        }
        
        return sections;
    }
    
    extractActionList(text, timeframe) {
        // Safety check for text parameter
        if (!text || typeof text !== 'string') {
            console.warn(`⚠️ extractActionList: Invalid text for timeframe '${timeframe}':`, text);
            return [];
        }
        
        // Enhanced patterns to handle various Markdown formats including headers
        const timeframePatterns = {
            immediate: /(?:immediate|\*\*immediate\*\*|\*immediate\*|#### immediate|### immediate|## immediate|# immediate)[:\s]*([^]*?)(?=short-term|long-term|####|###|##|#|$)/i,
            shortTerm: /(?:short-term|\*\*short-term\*\*|\*short-term\*|#### short-term|### short-term|## short-term|# short-term)[:\s]*([^]*?)(?=long-term|####|###|##|#|$)/i,
            longTerm: /(?:long-term|\*\*long-term\*\*|\*long-term\*|#### long-term|### long-term|## long-term|# long-term)[:\s]*([^]*?)(?=####|###|##|#|success metrics|$)/i
        };
        
        const match = text.match(timeframePatterns[timeframe]);
        if (!match || !match[1]) {
            console.warn(`⚠️ extractActionList: No match found for timeframe '${timeframe}' in text:`, text.substring(0, 100));
            return [];
        }
        
        return match[1]
            .split('\n')
            .filter(line => {
                const trimmed = line.trim();
                return trimmed.startsWith('-') || 
                       trimmed.startsWith('•') || 
                       trimmed.startsWith('*') || 
                       trimmed.startsWith('1.') || 
                       trimmed.startsWith('2.') || 
                       trimmed.startsWith('3.') ||
                       trimmed.startsWith('**') ||
                       /^\d+\./.test(trimmed);
            })
            .map(line => line.replace(/^[-•*1-9.\s]+/, '').trim())
            .filter(line => line.length > 0);
    }
    
    generateFallbackAnalysis(ymcaData, context) {
        // Rule-based fallback when AI is unavailable
        const performanceContext = this.extractPerformanceContext(ymcaData);
        const percentage = performanceContext.percentage;
        
        // Generate context-specific insights based on performance
        let insights = [];
        let actions = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };
        
        if (percentage < 40) {
            insights = [
                'Performance indicates significant improvement opportunities',
                'Focus on foundational operational and financial practices',
                'Consider seeking additional support and resources'
            ];
            actions.immediate = [
                'Conduct comprehensive performance assessment',
                'Identify critical improvement areas',
                'Develop immediate action plan'
            ];
            actions.shortTerm = [
                'Implement basic operational improvements',
                'Establish performance monitoring systems',
                'Seek guidance from Y-USA support resources'
            ];
            actions.longTerm = [
                'Build sustainable improvement framework',
                'Develop long-term strategic plan',
                'Establish continuous improvement culture'
            ];
        } else if (percentage < 70) {
            insights = [
                'Moderate performance with room for improvement',
                'Focus on specific areas of opportunity',
                'Build on existing strengths'
            ];
            actions.immediate = [
                'Review current performance data',
                'Identify specific improvement opportunities',
                'Prioritize high-impact initiatives'
            ];
            actions.shortTerm = [
                'Implement targeted improvements',
                'Enhance monitoring and reporting',
                'Develop staff training programs'
            ];
            actions.longTerm = [
                'Optimize operational efficiency',
                'Strengthen financial sustainability',
                'Enhance community impact'
            ];
        } else {
            insights = [
                'Strong performance with excellent foundation',
                'Focus on continuous improvement and innovation',
                'Consider sharing best practices with other YMCAs'
            ];
            actions.immediate = [
                'Review current performance metrics',
                'Identify innovation opportunities',
                'Plan for next level of excellence'
            ];
            actions.shortTerm = [
                'Implement advanced practices',
                'Develop leadership development programs',
                'Explore new service opportunities'
            ];
            actions.longTerm = [
                'Establish thought leadership position',
                'Develop sustainable growth strategies',
                'Create model for other YMCAs'
            ];
        }
        
        return {
            category: this.category,
            advisor: this.name,
            timestamp: new Date().toISOString(),
            ymcaId: ymcaData.id,
            ymcaName: ymcaData.name,
            performanceContext: performanceContext,
            executiveSummary: `Rule-based analysis for ${ymcaData.name} shows ${percentage < 40 ? 'significant improvement opportunities' : percentage < 70 ? 'moderate performance with room for growth' : 'strong performance with excellent foundation'}.`,
            keyInsights: insights,
            recommendedActions: actions,
            successMetrics: [
                'Performance score improvement',
                'Support designation upgrade',
                'Operational efficiency gains',
                'Financial sustainability enhancement'
            ],
            specialConsiderations: [
                'YMCA mission alignment',
                'Community impact focus',
                'Staff development and retention',
                'Financial stewardship'
            ],
            source: 'fallback-rules'
        };
    }
}

// Specialized Advisor Implementations
    class FinancialPerformanceAdvisor extends window.BaseAdvisor {
    constructor(provider) {
        super(provider, {
            category: 'financial',
            name: 'Financial Performance Advisor',
            description: 'Analyzes financial health and provides fiscal management guidance'
        });
    }
    
    getSystemPrompt() {
        return `You are an expert financial consultant specializing in nonprofit financial management, particularly for YMCAs. 
        Analyze financial metrics, identify sustainability challenges, and provide strategic recommendations for improving financial health and mission impact.
        Focus on balancing financial sustainability with mission-driven programming.
        
        CRITICAL: Use EXACTLY this format with NO Markdown formatting, NO headers, NO bold text:
        
        Executive Summary:
        [Your summary here - plain text only]
        
        Key Insights:
        - [Insight 1]
        - [Insight 2]
        
        Recommended Actions:
        Immediate:
        - [Action 1]
        - [Action 2]
        
        Short-term:
        - [Action 1]
        - [Action 2]
        
        Long-term:
        - [Action 1]
        - [Action 2]
        
        Success Metrics:
        - [Metric 1]
        - [Metric 2]
        
        Special Considerations:
        - [Consideration 1]
        - [Consideration 2]`;
    }
    
    buildUserPrompt(ymcaData, performanceContext, context) {
        const financialData = ymcaData.performanceSnapshot?.financialPerformance;
        
        return `Analyze the following YMCA financial performance data:

YMCA: ${ymcaData.name}
Financial Score: ${financialData?.totalPoints || 0}/40
Overall Score: ${performanceContext.overallScore}/${performanceContext.maxScore} (${performanceContext.percentage}%)
Support Designation: ${performanceContext.supportDesignation}

Financial Metrics: ${JSON.stringify(financialData, null, 2)}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Insights (3-5 bullet points)
3. Recommended Actions (prioritized by immediate, short-term, long-term)
4. Success Metrics
5. Special Considerations for YMCAs`;
    }
}

    class StaffRetentionAdvisor extends window.BaseAdvisor {
    constructor(provider) {
        super(provider, {
            category: 'operational',
            name: 'Staff Retention Advisor',
            description: 'Analyzes retention metrics and provides HR improvement strategies'
        });
    }
    
    getSystemPrompt() {
        return `You are an expert HR consultant specializing in YMCA staff retention and engagement strategies. 
        Analyze retention metrics, identify root causes of turnover, and provide evidence-based recommendations for improving staff satisfaction and retention.
        Consider YMCA mission and values in your recommendations.`;
    }
}

    class MembershipGrowthAdvisor extends window.BaseAdvisor {
    constructor(provider) {
        super(provider, {
            category: 'growth',
            name: 'Membership Growth Advisor',
            description: 'Analyzes growth patterns and provides expansion strategies'
        });
    }
    
    getSystemPrompt() {
        return `You are an expert membership development consultant specializing in YMCA growth strategies. 
        Analyze membership trends, identify growth opportunities, and provide strategic recommendations for expanding YMCA membership and community impact.
        Focus on mission-driven growth that serves community needs.`;
    }
}

    class MemberEngagementAdvisor extends window.BaseAdvisor {
    constructor(provider) {
        super(provider, {
            category: 'engagement',
            name: 'Member Engagement Advisor',
            description: 'Focuses on ARB framework and member experience'
        });
    }
    
    getSystemPrompt() {
        return `You are Derek, the YMCA Membership Advisor GPT. Your primary role is to support YMCA staff in building programs and practices that help members achieve, build relationships, and experience belonging. 
        These three pillars (Achievement, Relationships, and Belonging, or ARB) represent the YMCA's approach to transforming lives and strengthening community.
        Focus on the member as the hero of their own story, with the Y as the guide.`;
    }
}

// Advisor Registry and Management
    window.AdvisorRegistry = class AdvisorRegistry {
        constructor() {
        this.advisors = new Map();
        this.advisorConfigs = new Map();
    }
    
    registerAdvisor(advisorId, advisorClass, config) {
        this.advisors.set(advisorId, advisorClass);
        this.advisorConfigs.set(advisorId, config);
        console.log(`✅ Registered advisor: ${advisorId}`);
    }
    
    getAdvisor(advisorId, provider) {
        const AdvisorClass = this.advisors.get(advisorId);
        if (!AdvisorClass) {
            throw new Error(`Advisor not found: ${advisorId}`);
        }
        return new AdvisorClass(provider);
    }
    
    getAllAdvisors() {
        return Array.from(this.advisors.keys());
    }
    
    getAdvisorConfig(advisorId) {
        return this.advisorConfigs.get(advisorId);
    }
}

    // Main Advisor Manager
    window.AdvisorManager = class AdvisorManager {
    constructor(config) {
        this.config = config;
        this.provider = null;
        this.registry = new window.AdvisorRegistry();
        this.fallbackMode = config.fallbackMode || config.useFallbackOnly || false;
        this.loadBuiltInAdvisors();
        // Don't call init() here - it will be called externally
    }
    
    async init() {
        console.log('🔧 AdvisorManager initializing with config:', {
            hasAzureConfig: !!this.config.azureOpenAI,
            useSecureAPI: this.config.useSecureAPI,
            endpoint: this.config.azureOpenAI?.endpoint,
            deployment: this.config.azureOpenAI?.deployment
        });
        
        this.provider = this.initializeProvider();
        
        if (this.provider) {
            console.log('✅ Azure OpenAI provider initialized successfully');
        } else {
            console.log('⚠️ No AI provider available, using fallback mode');
        }
    }
    
    initializeProvider() {
        console.log('🔧 initializeProvider called with config:', {
            hasAzureConfig: !!this.config.azureOpenAI,
            azureConfig: this.config.azureOpenAI,
            useSecureAPI: this.config.useSecureAPI,
            fallbackMode: this.fallbackMode
        });
        
        // If in fallback mode, don't try to initialize Azure OpenAI
        if (this.fallbackMode) {
            console.log('🔄 Fallback mode enabled, skipping Azure OpenAI initialization');
            return null;
        }
        
        if (!this.config.azureOpenAI) {
            throw new Error('🚫 AZURE OPENAI REQUIRED: No Azure OpenAI configuration provided');
        }
        
        // Check if we have proper configuration
        const hasEndpoint = !!this.config.azureOpenAI.endpoint;
        const hasDeployment = !!this.config.azureOpenAI.deployment;
        const hasSecureAPI = this.config.useSecureAPI === true;
        
        if (!hasEndpoint || !hasDeployment) {
            throw new Error('🚫 AZURE OPENAI REQUIRED: Missing endpoint or deployment configuration');
        }
        
        if (!hasSecureAPI && !this.config.azureOpenAI.apiKey) {
            throw new Error('🚫 AZURE OPENAI REQUIRED: No API key and no secure API configured');
        }
        
        console.log('🔧 Provider initialization check:', {
            hasSecureAPI,
            hasApiKey: !!this.config.azureOpenAI.apiKey,
            endpoint: this.config.azureOpenAI.endpoint,
            deployment: this.config.azureOpenAI.deployment
        });
        
        try {
            console.log('✅ Initializing Azure OpenAI provider', {
                hasEndpoint,
                hasDeployment,
                hasSecureAPI,
                hasApiKey: !!this.config.azureOpenAI.apiKey
            });
            
            const provider = new window.AzureOpenAIProvider(this.config.azureOpenAI);
            console.log('✅ AzureOpenAIProvider created successfully');
            return provider;
            
        } catch (error) {
            console.error('❌ Failed to initialize Azure OpenAI provider:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                config: this.config.azureOpenAI
            });
            return null;
        }
    }
    
    loadBuiltInAdvisors() {
        // Register all built-in advisors
        this.registry.registerAdvisor('financial', FinancialPerformanceAdvisor, {
            name: 'Financial Performance Advisor',
            description: 'Analyzes financial health and provides fiscal management guidance',
            category: 'financial'
        });
        
        this.registry.registerAdvisor('staff-retention', StaffRetentionAdvisor, {
            name: 'Staff Retention Advisor',
            description: 'Analyzes retention metrics and provides HR improvement strategies',
            category: 'operational'
        });
        
        this.registry.registerAdvisor('membership-growth', MembershipGrowthAdvisor, {
            name: 'Membership Growth Advisor',
            description: 'Analyzes growth patterns and provides expansion strategies',
            category: 'growth'
        });
        
        this.registry.registerAdvisor('member-engagement', MemberEngagementAdvisor, {
            name: 'Member Engagement Advisor',
            description: 'Focuses on ARB framework and member experience',
            category: 'engagement'
        });
        
        console.log(`✅ Loaded ${this.registry.getAllAdvisors().length} built-in advisors`);
    }
    
    async generateComprehensiveAnalysis(ymcaData, context = {}) {
        const analysis = {
            ymcaId: ymcaData.id,
            ymcaName: ymcaData.name,
            timestamp: new Date().toISOString(),
            overallAssessment: this.assessOverallPerformance(ymcaData),
            advisorInsights: {},
            crossCuttingRecommendations: [],
            actionPlan: this.generateMasterActionPlan(ymcaData, context),
            summary: {
                totalAdvisors: this.registry.getAllAdvisors().length,
                successfulAnalyses: 0,
                fallbackAnalyses: 0,
                aiProvider: this.provider ? 'azure-openai' : 'fallback-rules'
            }
        };
        
        // Run all registered advisors
        for (const advisorId of this.registry.getAllAdvisors()) {
            try {
                const advisor = this.registry.getAdvisor(advisorId, this.provider);
                const advisorAnalysis = await advisor.analyze(ymcaData, context);
                
                analysis.advisorInsights[advisorId] = advisorAnalysis;
                
                if (advisorAnalysis.source === 'azure-openai') {
                    analysis.summary.successfulAnalyses++;
                } else {
                    analysis.summary.fallbackAnalyses++;
                }
                
            } catch (error) {
                console.error(`Error running advisor ${advisorId}:`, error);
                analysis.advisorInsights[advisorId] = {
                    error: error.message,
                    source: 'error'
                };
            }
        }
        
        // Generate cross-cutting insights
        analysis.crossCuttingRecommendations = this.identifyCrossCuttingThemes(analysis.advisorInsights);
        
        // Analysis complete
        console.log('✅ AI analysis completed successfully with', Object.keys(analysis.advisorInsights).length, 'advisors');
        
        return analysis;
    }
    
    assessOverallPerformance(ymcaData) {
        const score = ymcaData.totalPoints || 0;
        const maxScore = ymcaData.maxPoints || 80;
        const percentage = (score / maxScore) * 100;
        
        let performanceLevel = 'Low';
        let supportNeeded = 'High';
        
        if (percentage >= 70) {
            performanceLevel = 'High';
            supportNeeded = 'Low';
        } else if (percentage >= 40) {
            performanceLevel = 'Moderate';
            supportNeeded = 'Medium';
        }
        
        const result = {
            score,
            maxScore,
            percentage: Math.round(percentage),
            performanceLevel,
            supportNeeded,
            supportDesignation: ymcaData.overallSupportDesignation || 'Standard'
        };
        
        // 🔍 DEBUG: Log the performance assessment
        console.log('🎯 PERFORMANCE ASSESSMENT:', result);
        console.log('🎯 YMCA data score:', ymcaData.totalPoints);
        console.log('🎯 YMCA data maxPoints:', ymcaData.maxPoints);
        
        return result;
    }
    
    generateMasterActionPlan(ymcaData, context) {
        const overallAssessment = this.assessOverallPerformance(ymcaData);
        
        return {
            immediate: [
                'Review current performance data',
                'Identify critical improvement areas',
                'Schedule leadership team meeting'
            ],
            shortTerm: [
                'Develop comprehensive improvement plan',
                'Set measurable goals and timelines',
                'Implement quick-win initiatives'
            ],
            longTerm: [
                'Build sustainable improvement framework',
                'Establish monitoring and reporting systems',
                'Create continuous improvement culture'
            ],
            priority: overallAssessment.supportNeeded === 'High' ? 'Critical' : 'Standard'
        };
    }
    
    identifyCrossCuttingThemes(advisorInsights) {
        const themes = [];
        const insights = Object.values(advisorInsights).filter(insight => !insight.error);
        
        // Identify common themes across advisors
        const commonKeywords = ['leadership', 'culture', 'processes', 'communication', 'training', 'resources'];
        
        commonKeywords.forEach(keyword => {
            const mentions = insights.filter(insight => 
                insight.keyInsights?.some(insight => 
                    insight.toLowerCase().includes(keyword)
                )
            ).length;
            
            if (mentions >= 2) {
                themes.push({
                    theme: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                    frequency: mentions,
                    priority: mentions >= 3 ? 'High' : 'Medium'
                });
            }
        });
        
        return themes.sort((a, b) => b.frequency - a.frequency);
    }
    
    // Utility methods
    getAdvisor(advisorId) {
        return this.registry.getAdvisor(advisorId, this.provider);
    }
    
    getAllAdvisors() {
        return this.registry.getAllAdvisors();
    }
    
    getAdvisorConfig(advisorId) {
        return this.registry.getAdvisorConfig(advisorId);
    }
    } // End of AdvisorManager class
} // End of else block

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdvisorManager: window.AdvisorManager,
        AzureOpenAIProvider: window.AzureOpenAIProvider,
        BaseAdvisor: window.BaseAdvisor,
        AdvisorRegistry: window.AdvisorRegistry
    };
}

console.log('✅ ai-advisory-framework.js loaded completely');
console.log('Available classes:', {
    AdvisorManager: typeof window.AdvisorManager,
    AzureOpenAIProvider: typeof window.AzureOpenAIProvider,
    BaseAdvisor: typeof window.BaseAdvisor,
    AdvisorRegistry: typeof window.AdvisorRegistry
});
