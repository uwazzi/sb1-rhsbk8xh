import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, ArrowRight, HelpCircle, MessageSquare, Bot } from 'lucide-react';
import { mockConfigurations, getAllQuestions } from '../data/mockData';
import { TestConfiguration, TestQuestion } from '../types';
import { getGeminiResponse } from '../lib/gemini';
import { saveTestResponses } from '../lib/supabase';

const ExecuteTestPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<TestConfiguration | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const foundTest = mockConfigurations.find(t => t.id === id);
    
    if (foundTest) {
      setTest(foundTest);
      const allQuestions = getAllQuestions();
      const filteredQuestions = allQuestions.filter(q => 
        foundTest.tests.includes(q.testType as any)
      );
      setQuestions(filteredQuestions);
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleGeminiTest = async () => {
    if (!currentQuestion || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const prompt = `${currentQuestion.prompt}\n\nPlease provide a detailed response that reflects your understanding and approach to this situation.`;
      const response = await getGeminiResponse(prompt, test?.aiSystemPrompt);
      setCurrentResponse(response);
    } catch (error) {
      console.error('Error testing with Gemini:', error);
      // Show error in UI
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentResponse(userResponses[questions[currentQuestionIndex - 1].id] || '');
    }
  };
  
  const handleNext = () => {
    if (currentResponse.trim()) {
      setUserResponses({
        ...userResponses,
        [currentQuestion.id]: currentResponse
      });
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentResponse(userResponses[questions[currentQuestionIndex + 1].id] || '');
    }
  };
  
  const handleSubmit = async () => {
    if (currentResponse.trim()) {
      const updatedResponses = {
        ...userResponses,
        [currentQuestion.id]: currentResponse
      };
      setUserResponses(updatedResponses);
      
      try {
        // Save responses to Supabase
        await saveTestResponses(id!, updatedResponses);
        
        // Store responses locally for analysis
        localStorage.setItem(`test_${id}_responses`, JSON.stringify(updatedResponses));
        
        setIsSubmitting(true);
        navigate(`/progress/${id}`);
      } catch (error) {
        console.error('Error saving responses:', error);
        // Handle error appropriately
      }
    }
  };
  
  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };
  
  const getTestTypeName = (type: string) => {
    switch (type) {
      case 'neo':
        return 'NEO-PI-R';
      case 'pes':
        return 'Perth Empathy Scale';
      case 'pcl':
        return 'PCL-R';
      default:
        return type;
    }
  };
  
  if (!test || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600"></div>
          <p className="text-slate-600">Loading test...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex-grow">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-violet-600 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(getProgressPercentage())}% Complete</span>
            </div>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
                  {getTestTypeName(currentQuestion.testType)}
                  {currentQuestion.category && ` • ${currentQuestion.category}`}
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                  {currentQuestion.question}
                </h2>
              </div>
              
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
                <p>{currentQuestion.prompt}</p>
              </div>
              
              <div className="relative">
                <textarea
                  className="min-h-[200px] w-full rounded-lg border-slate-300 p-4 pr-12 text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your response here..."
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  disabled={isSubmitting || isProcessing}
                ></textarea>
                <button
                  className="absolute bottom-4 right-4 text-slate-400 hover:text-violet-600"
                  onClick={() => setCurrentResponse(prev => prev + '\n')}
                  title="Add new line"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    className="btn-outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0 || isSubmitting || isProcessing}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </button>
                  
                  <button
                    className="btn-outline flex items-center"
                    onClick={handleGeminiTest}
                    disabled={isSubmitting || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent"></div>
                        Testing with Gemini...
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" />
                        Test with Gemini
                      </>
                    )}
                  </button>
                </div>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    className="btn-primary"
                    onClick={handleNext}
                    disabled={!currentResponse.trim() || isSubmitting || isProcessing}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={!currentResponse.trim() || isSubmitting || isProcessing}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit All Responses
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Test Info</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">Name</div>
                    <div className="text-slate-900">{test.name}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase text-slate-500">Tests Included</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {test.tests.map(testType => (
                        <span 
                          key={testType}
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            testType === 'neo' ? 'bg-violet-100 text-violet-800' : 
                            testType === 'pes' ? 'bg-blue-100 text-blue-800' : 
                            'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {getTestTypeName(testType)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <div className="flex items-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900">Tips for Testing</h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-600">
                      <li>Use the "Test with Gemini" button to get AI responses</li>
                      <li>Review and modify AI responses if needed</li>
                      <li>Ensure responses are detailed and contextual</li>
                      <li>Maintain consistency across answers</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-slate-900">Question Navigation</h3>
                <div className="grid grid-cols-8 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
                        index === currentQuestionIndex
                          ? 'bg-violet-600 text-white'
                          : userResponses[questions[index].id]
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                      onClick={() => {
                        if (currentResponse.trim()) {
                          setUserResponses({
                            ...userResponses,
                            [currentQuestion.id]: currentResponse
                          });
                        }
                        setCurrentQuestionIndex(index);
                        setCurrentResponse(userResponses[questions[index].id] || '');
                      }}
                      disabled={isSubmitting || isProcessing}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecuteTestPage;