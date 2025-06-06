import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, User, Building, Briefcase, Heart, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GuestProfile {
  email: string;
  fullName: string;
  company: string;
  position: string;
  interestLevel: string;
  howHeardAbout: string;
  additionalNotes: string;
}

interface GuestWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onComplete: () => void;
}

const GuestWizard: React.FC<GuestWizardProps> = ({ isOpen, onClose, userEmail, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<GuestProfile>({
    email: userEmail,
    fullName: '',
    company: '',
    position: '',
    interestLevel: '',
    howHeardAbout: '',
    additionalNotes: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('guest_profiles')
        .insert({
          email: profile.email,
          full_name: profile.fullName,
          company: profile.company,
          position: profile.position,
          interest_level: profile.interestLevel,
          how_heard_about: profile.howHeardAbout,
          additional_notes: profile.additionalNotes
        });

      if (error) throw error;

      // Store completion status locally
      localStorage.setItem('guest_wizard_completed', 'true');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving guest profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.fullName.trim() !== '';
      case 2:
        return profile.company.trim() !== '' && profile.position.trim() !== '';
      case 3:
        return profile.interestLevel !== '' && profile.howHeardAbout !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Welcome to AI Sanity Check</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                <User className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Tell us about yourself</h3>
              <p className="text-sm text-slate-600">Help us understand who's interested in AI evaluation</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="mt-1 block w-full rounded-md border-slate-300 bg-slate-50 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2: Professional Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Professional Background</h3>
              <p className="text-sm text-slate-600">Understanding your role helps us tailor the experience</p>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700">
                Company/Organization *
              </label>
              <input
                type="text"
                id="company"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="e.g., OpenAI, Google, Startup Inc."
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700">
                Position/Role *
              </label>
              <input
                type="text"
                id="position"
                value={profile.position}
                onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="e.g., AI Engineer, Product Manager, Researcher"
              />
            </div>
          </div>
        )}

        {/* Step 3: Interest and Discovery */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Heart className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Your Interest</h3>
              <p className="text-sm text-slate-600">Help us understand your needs and how you found us</p>
            </div>

            <div>
              <label htmlFor="interestLevel" className="block text-sm font-medium text-slate-700">
                Interest Level *
              </label>
              <select
                id="interestLevel"
                value={profile.interestLevel}
                onChange={(e) => setProfile({ ...profile, interestLevel: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              >
                <option value="">Select your interest level</option>
                <option value="high">High - Ready to implement AI evaluation</option>
                <option value="medium">Medium - Exploring options</option>
                <option value="low">Low - Just learning about the space</option>
                <option value="just_browsing">Just browsing</option>
              </select>
            </div>

            <div>
              <label htmlFor="howHeardAbout" className="block text-sm font-medium text-slate-700">
                How did you hear about us? *
              </label>
              <select
                id="howHeardAbout"
                value={profile.howHeardAbout}
                onChange={(e) => setProfile({ ...profile, howHeardAbout: e.target.value })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
              >
                <option value="">Select an option</option>
                <option value="search_engine">Search Engine (Google, Bing, etc.)</option>
                <option value="social_media">Social Media (Twitter, LinkedIn, etc.)</option>
                <option value="colleague_referral">Colleague/Friend Referral</option>
                <option value="conference_event">Conference/Event</option>
                <option value="blog_article">Blog/Article</option>
                <option value="github">GitHub</option>
                <option value="ai_community">AI Community/Forum</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: Additional Notes */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <MessageSquare className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Anything else?</h3>
              <p className="text-sm text-slate-600">Share any additional thoughts or questions</p>
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-slate-700">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                value={profile.additionalNotes}
                onChange={(e) => setProfile({ ...profile, additionalNotes: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                placeholder="Any specific use cases, questions, or feedback you'd like to share..."
              />
            </div>

            <div className="rounded-lg bg-violet-50 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-violet-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-violet-900">Thank you!</h4>
                  <p className="text-sm text-violet-700">
                    Your information helps us improve AI Sanity Check and better serve the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  Complete
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestWizard;