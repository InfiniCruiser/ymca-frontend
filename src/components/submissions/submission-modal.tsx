'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import frameworkQuestions from '@/data/framework-questions.json';

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

interface Submission {
  id: string;
  periodId: string;
  totalQuestions: number;
  responses: Record<string, any>;
  completed: boolean;
  submittedBy?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrganization: string;
}

export function SubmissionModal({ isOpen, onClose, selectedOrganization }: SubmissionModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponses, setEditedResponses] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load submissions when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, selectedOrganization]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filter submissions by organization if needed
          const filteredSubmissions = data.submissions.filter((sub: Submission) => 
            !selectedOrganization || sub.organizationId === selectedOrganization
          );
          setSubmissions(filteredSubmissions);
        } else {
          toast.error('Failed to load submissions');
        }
      } else {
        toast.error('Failed to load submissions');
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionSelect = (submission: Submission) => {
    setSelectedSubmission(submission);
    setEditedResponses({ ...submission.responses });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (selectedSubmission) {
      setEditedResponses({ ...selectedSubmission.responses });
      setIsEditing(false);
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setEditedResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedSubmission) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/submissions/${selectedSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: editedResponses,
          submittedBy: selectedSubmission.submittedBy
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Submission updated successfully!');
          setSelectedSubmission(data.submission);
          setIsEditing(false);
          // Reload submissions to get updated data
          loadSubmissions();
        } else {
          toast.error('Failed to update submission');
        }
      } else {
        toast.error('Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    } finally {
      setIsSaving(false);
    }
  };

  const getQuestionById = (questionId: string): Question | undefined => {
    return frameworkQuestions.find((q: Question) => q.id === questionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedSubmission ? 'View/Edit Submission' : 'Select Submission'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Submission List */}
          <div className="w-1/3 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submissions</h3>
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No submissions found</div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      onClick={() => handleSubmissionSelect(submission)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSubmission?.id === submission.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        Period: {submission.periodId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(submission.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Questions: {submission.totalQuestions}
                      </div>
                      <div className="text-xs text-gray-500">
                        Status: {submission.completed ? 'Completed' : 'Draft'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submission Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedSubmission ? (
              <div className="p-6">
                {/* Submission Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Submission Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        Period: {selectedSubmission.periodId}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!isEditing ? (
                        <button
                          onClick={handleEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(selectedSubmission.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {formatDate(selectedSubmission.updatedAt)}
                    </div>
                    <div>
                      <span className="font-medium">Submitted By:</span> {selectedSubmission.submittedBy || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {selectedSubmission.completed ? 'Completed' : 'Draft'}
                    </div>
                  </div>
                </div>

                {/* Responses */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Survey Responses</h4>
                  <div className="space-y-6">
                    {Object.entries(selectedSubmission.responses).map(([questionId, response]) => {
                      const question = getQuestionById(questionId);
                      if (!question) return null;

                      return (
                        <div key={questionId} className="border rounded-lg p-4">
                          <div className="mb-2">
                            <div className="text-sm text-gray-500">
                              {question.section} {'>'} {question.area}
                            </div>
                            <h5 className="font-medium text-gray-900">{question.metric}</h5>
                            <p className="text-sm text-gray-600">{question.pathway}</p>
                          </div>
                          
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Response:
                            </label>
                            {isEditing ? (
                              <div className="space-y-2">
                                {question.options?.map((option) => (
                                  <label key={option} className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question-${questionId}`}
                                      value={option}
                                      checked={editedResponses[questionId] === option}
                                      onChange={(e) => handleResponseChange(questionId, e.target.value)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                                {response || 'No response'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
