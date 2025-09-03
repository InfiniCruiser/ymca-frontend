'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import frameworkQuestions from '@/data/framework-questions.json';
import { useAuthContext } from '@/contexts/auth-context';

interface Question {
  id: string;
  section: string;
  area: string;
  metric: string;
  pathway: string;
  type: string;
  options?: string[];
  required: boolean;
  score: number;
  yusa_access: boolean;
  documents_to_review?: string[];
  file_upload_required: boolean;
  help_text: string;
}

interface SurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (responses: any) => void;
}

type YusaAccessFilter = 'all' | 'yusa_access' | 'non_yusa_access';

export function PeriodSurvey({ isOpen, onClose, onComplete }: SurveyProps) {
  const { user } = useAuthContext();
  const [currentSection, setCurrentSection] = useState<'Risk Mitigation' | 'Governance' | 'Engagement'>('Risk Mitigation');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, File[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [yusaAccessFilter, setYusaAccessFilter] = useState<YusaAccessFilter>('all');

  // Filter questions based on Y-USA access and current section
  const filteredQuestions = frameworkQuestions.filter((question: Question) => {
    const matchesSection = question.section === currentSection;
    const matchesYusaFilter = 
      yusaAccessFilter === 'all' ||
      (yusaAccessFilter === 'yusa_access' && question.yusa_access) ||
      (yusaAccessFilter === 'non_yusa_access' && !question.yusa_access);
    
    return matchesSection && matchesYusaFilter;
  });

  const questions: Question[] = filteredQuestions;

  useEffect(() => {
    if (isOpen) {
      setCurrentSection('Risk Mitigation');
      setCurrentQuestion(0);
      setResponses({});
      setFileUploads({});
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset to first question when section changes
    setCurrentQuestion(0);
  }, [currentSection, yusaAccessFilter]);

  if (!isOpen) return null;

  const currentQuestionData = questions[currentQuestion];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  // Calculate current score
  const calculateScore = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    questions.forEach((question) => {
      maxPossibleScore += question.score;
      const response = responses[question.id];
      if (response === 'Yes') {
        totalScore += question.score;
      }
    });
    
    return { totalScore, maxPossibleScore, percentage: maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0 };
  };

  const { totalScore, maxPossibleScore, percentage } = calculateScore();

  const handleResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = (questionId: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFileUploads(prev => ({
        ...prev,
        [questionId]: fileArray
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Move to next section or submit if last section
      if (currentSection === 'Risk Mitigation') {
        setCurrentSection('Governance');
      } else if (currentSection === 'Governance') {
        setCurrentSection('Engagement');
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      // Move to previous section
      if (currentSection === 'Engagement') {
        setCurrentSection('Governance');
        setCurrentQuestion(questions.length - 1);
      } else if (currentSection === 'Governance') {
        setCurrentSection('Risk Mitigation');
        setCurrentQuestion(questions.length - 1);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create a submission record with metadata
      const submission = {
        id: `period_${Date.now()}`,
        timestamp: new Date().toISOString(),
        totalQuestions: totalQuestions,
        responses: responses,
        fileUploads: fileUploads,
        score: {
          totalScore,
          maxPossibleScore,
          percentage
        },
        yusaAccessFilter,
        organizationId: user?.organizationId, // Include organizationId from auth context
        submittedBy: user?.email || 'current-user',
        completed: true
      };
      
      // Save to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('ymca_survey_submissions') || '[]');
      existingSubmissions.push(submission);
      localStorage.setItem('ymca_survey_submissions', JSON.stringify(existingSubmissions));
      
      // Also save the latest submission for easy access
      localStorage.setItem('ymca_latest_submission', JSON.stringify(submission));
      
      // Try to submit to backend API (optional)
      try {
        const backendSubmission = {
          periodId: submission.id,
          totalQuestions: submission.totalQuestions,
          responses: submission.responses,
          fileUploads: submission.fileUploads,
          score: submission.score,
          yusaAccessFilter: submission.yusaAccessFilter,
          submittedBy: user?.email || 'current-user',
          organizationId: user?.organizationId // Get organizationId from authenticated user context
        };
        
        const response = await fetch('/api/v1/submissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendSubmission)
        });
        
        if (response.ok) {
          toast.success('Survey submitted successfully!');
        } else {
          console.warn('Backend submission failed, but data saved locally');
        }
      } catch (error) {
        console.warn('Backend submission failed, but data saved locally:', error);
      }
      
      onComplete(submission);
      onClose();
    } catch (error) {
      console.error('Error submitting survey:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sections = [
    { name: 'Risk Mitigation', color: 'bg-red-100 text-red-800' },
    { name: 'Governance', color: 'bg-blue-100 text-blue-800' },
    { name: 'Engagement', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">OEA Self-Assessment Survey</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Y-USA Access Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select question level
            </label>
            <select
              value={yusaAccessFilter}
              onChange={(e) => setYusaAccessFilter(e.target.value as YusaAccessFilter)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Questions</option>
              <option value="yusa_access">Y-USA Access Only</option>
              <option value="non_yusa_access">Non-Y-USA Access Only</option>
            </select>
          </div>

          {/* Section Navigation */}
          <div className="flex space-x-2 mb-4">
            {sections.map((section) => (
              <button
                key={section.name}
                onClick={() => setCurrentSection(section.name as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentSection === section.name
                    ? `${section.color} border-2 border-current`
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Progress and Score */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress: {currentQuestion + 1} of {totalQuestions}</span>
                <span>{Math.round(percentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-sm text-gray-600">Current Score</div>
              <div className="text-lg font-bold text-indigo-600">
                {totalScore.toFixed(1)} / {maxPossibleScore.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentQuestionData ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="border-b pb-4">
                <div className="text-sm text-gray-500 mb-2">
                  {currentQuestionData.section} {'>'} {currentQuestionData.area}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {currentQuestionData.metric}
                </h3>
                <p className="text-gray-700">
                  {currentQuestionData.pathway}
                </p>
              </div>

              {/* Question Response */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Do you meet this requirement?
                  </label>
                  <div className="space-y-2">
                    {currentQuestionData.options?.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.id}`}
                          value={option}
                          checked={responses[currentQuestionData.id] === option}
                          onChange={(e) => handleResponse(currentQuestionData.id, e.target.value)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                {currentQuestionData.file_upload_required && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(currentQuestionData.id, e.target.files)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Required documents: {currentQuestionData.documents_to_review?.join(', ')}
                      </p>
                      {fileUploads[currentQuestionData.id] && (
                        <div className="mt-2">
                          <p className="text-xs text-green-600">
                            {fileUploads[currentQuestionData.id].length} file(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Y-USA Access Indicator */}
                <div className="flex items-center text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    currentQuestionData.yusa_access 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentQuestionData.yusa_access ? 'Y-USA Access' : 'No Y-USA Access'}
                  </span>
                  <span className="ml-2 text-gray-500">
                    Score: {currentQuestionData.score} points
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No questions available for the selected filter.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 && currentSection === 'Risk Mitigation'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="text-sm text-gray-500">
              {currentSection} • Question {currentQuestion + 1} of {totalQuestions}
            </div>
            
            <button
              onClick={handleNext}
              disabled={!responses[currentQuestionData?.id]}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === totalQuestions - 1 && currentSection === 'Engagement' 
                ? (isSubmitting ? 'Submitting...' : 'Submit Survey') 
                : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
