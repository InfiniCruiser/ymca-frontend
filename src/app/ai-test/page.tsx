'use client';

import { useState } from 'react';

export default function AITestPage() {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const testAIAnalysis = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: {
            system: 'You are a helpful YMCA performance analyst. Provide a brief analysis.',
            user: 'Analyze this YMCA performance: Total Score: 65/80 (81.25%). What are the key areas for improvement?'
          },
          context: {
            ymcaName: 'Test YMCA',
            totalScore: 65,
            maxScore: 80
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.content);
      } else {
        setError(data.error || 'AI analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testAIStatus = async () => {
    try {
      const response = await fetch('/api/ai-status');
      const data = await response.json();
      console.log('AI Status:', data);
      alert(`AI Status: ${JSON.stringify(data.status, null, 2)}`);
    } catch (err) {
      console.error('Error testing AI status:', err);
      alert('Error testing AI status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Analysis Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test AI Analysis</h2>
          <button
            onClick={testAIAnalysis}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate AI Analysis'}
          </button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Test AI Status</h2>
          <button
            onClick={testAIStatus}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Check AI Status
          </button>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {aiResponse && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">AI Response</h3>
            <div className="whitespace-pre-wrap text-gray-800">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
}
