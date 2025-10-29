import { User } from '@/contexts/AuthContext';

export interface ProfileCompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

export function calculateProfileCompletion(user: User | null): ProfileCompletionResult {
  if (!user) {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: 8,
      missingFields: []
    };
  }

  const fields = [
    { name: 'Avatar', value: user.avatar, label: 'Profile Picture' },
    { name: 'First Name', value: user.firstName, label: 'First Name' },
    { name: 'Last Name', value: user.lastName, label: 'Last Name' },
    { name: 'Email', value: user.email, label: 'Email' },
    { name: 'Phone', value: user.phone, label: 'Phone Number' },
    { name: 'Date of Birth', value: user.dateOfBirth, label: 'Date of Birth' },
    { name: 'Nationality', value: user.nationality, label: 'Nationality' },
    { name: 'Email Verified', value: user.preferences?.emailVerified, label: 'Email Verification' }
  ];

  const completedFields = fields.filter(field => field.value).length;
  const totalFields = fields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  const missingFields = fields
    .filter(field => !field.value)
    .map(field => field.label);

  return {
    percentage,
    completedFields,
    totalFields,
    missingFields
  };
}

export function getProfileCompletenessColor(percentage: number): string {
  if (percentage >= 80) return 'green';
  if (percentage >= 50) return 'yellow';
  return 'red';
}

export function getProfileCompletenessLabel(percentage: number): string {
  if (percentage === 100) return 'Complete';
  if (percentage >= 80) return 'Almost there';
  if (percentage >= 50) return 'In progress';
  return 'Just started';
}
