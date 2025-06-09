import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock, FileText } from 'lucide-react';

interface TestConfiguration {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  tests: string[];
  aiSystemPrompt?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  isPublic?: boolean;
}

interface TestCardProps {
  test: TestConfiguration;
}

const TestCard: React.FC<TestCardProps> = ({ test }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getStatusIcon = () => {
    switch (test.status) {
      case 'active':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-emerald-500" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (test.status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'draft':
        return 'Draft';
      default:
        return '';
    }
  };

  const getStatusClass = () => {
    switch (test.status) {
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'draft':
        return 'bg-slate-100 text-slate-800';
      default:
        return '';
    }
  };

  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case 'neo':
        return 'NEO-PI-R';
      case 'pes':
        return 'Perth Empathy Scale';
      case 'pcl':
        return 'PCL-R';
      default:
        return testType.toUpperCase();
    }
  };

  return (
    <div className="card group hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClass()}`}>
          {getStatusIcon()}
          <span className="ml-1.5">{getStatusText()}</span>
        </div>
        <div className="text-sm text-slate-500">
          Created: {formatDate(test.createdAt)}
        </div>
      </div>
      
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{test.name}</h3>
      <p className="mb-6 text-slate-600">{test.description || 'No description provided'}</p>
      
      <div className="mb-4 flex flex-wrap gap-2">
        {test.tests.map((testType) => (
          <span
            key={testType}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              testType === 'neo' ? 'bg-violet-100 text-violet-800' :
              testType === 'pes' ? 'bg-blue-100 text-blue-800' :
              'bg-emerald-100 text-emerald-800'
            }`}
          >
            {getTestTypeName(testType)}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between border-t border-slate-200 pt-4">
        {test.status === 'draft' || test.status === 'active' ? (
          <Link
            to={`/test/${test.id}`}
            className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
          >
            {test.status === 'draft' ? 'Edit Test' : 'Continue Test'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        ) : (
          <Link
            to={`/results/${test.id}`}
            className="inline-flex items-center text-sm font-medium text-violet-600 transition-colors group-hover:text-violet-700"
          >
            View Results
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        )}
        
        <div className="text-sm text-slate-500">
          {test.status === 'active' && 'Last updated: ' + formatDate(test.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default TestCard;