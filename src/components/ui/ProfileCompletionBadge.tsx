'use client';

import { User as UserType } from '@/contexts/AuthContext';
import { calculateProfileCompletion, getProfileCompletenessColor, getProfileCompletenessLabel } from '@/lib/profileUtils';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileCompletionBadgeProps {
  user: UserType | null;
  showDetails?: boolean;
}

export default function ProfileCompletionBadge({ user, showDetails = false }: ProfileCompletionBadgeProps) {
  const completion = calculateProfileCompletion(user);
  const color = getProfileCompletenessColor(completion.percentage);
  const label = getProfileCompletenessLabel(completion.percentage);

  const colorClasses: Record<string, {bg: string; border: string; text: string; icon: string; progress: string}> = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      progress: 'bg-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: 'text-yellow-600',
      progress: 'bg-yellow-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600',
      progress: 'bg-red-500'
    }
  };

  const classes = colorClasses[color];

  if (!showDetails) {
    // Compact badge version
    return (
      <Link href="/settings" className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - completion.percentage / 100)}`}
              className={classes.text}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">{completion.percentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Profile</p>
          <p className="text-xs text-gray-600">{label}</p>
        </div>
      </Link>
    );
  }

  // Detailed card version
  return (
    <div className={`p-6 rounded-lg border ${classes.bg} ${classes.border}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Profile Completion
          </h3>
          <p className={`text-sm ${classes.text} font-medium`}>
            {label}
          </p>
        </div>
        {completion.percentage === 100 ? (
          <CheckCircle className={`w-6 h-6 ${classes.icon}`} />
        ) : (
          <AlertCircle className={`w-6 h-6 ${classes.icon}`} />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">
            {completion.completedFields} of {completion.totalFields} fields completed
          </span>
          <span className={`font-semibold ${classes.text}`}>
            {completion.percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${classes.progress}`}
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {completion.missingFields.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Complete your profile:
          </p>
          <ul className="space-y-1">
            {completion.missingFields.map((field, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Call to Action */}
      {completion.percentage < 100 && (
        <Link
          href="/settings"
          className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Complete Profile
        </Link>
      )}
    </div>
  );
}
