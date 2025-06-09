import React from 'react';
import { AlertTriangle, Settings, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

const ConfigurationBanner: React.FC = () => {
  // Only show banner if Supabase is not configured and we're in production
  if (isSupabaseConfigured || !import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="container-custom">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Demo Mode - Database Not Connected
              </p>
              <p className="text-xs text-amber-700">
                Some features are limited. Local LLM assessments work fully offline.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-800"
            >
              <Settings className="mr-1 h-3 w-3" />
              Setup Database
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationBanner;