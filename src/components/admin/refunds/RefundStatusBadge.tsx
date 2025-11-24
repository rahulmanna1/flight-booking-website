// Refund Status Badge Component
// Visual indicator for refund status with color coding and icons

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  FileText,
  CheckCircle,
  RefreshCw,
  XCircle,
  Ban,
  AlertCircle,
} from 'lucide-react';

type RefundStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

interface RefundStatusBadgeProps {
  status: RefundStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfig: Record<RefundStatus, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: FileText,
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: RefreshCw,
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function RefundStatusBadge({
  status,
  showIcon = true,
  size = 'md',
}: RefundStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${sizeClasses[size]} font-medium border inline-flex items-center gap-1.5`}
    >
      {showIcon && <Icon className={iconSizeClasses[size]} />}
      {config.label}
    </Badge>
  );
}

// Helper function to get status description for tooltips
export function getRefundStatusDescription(status: RefundStatus): string {
  const descriptions: Record<RefundStatus, string> = {
    PENDING: 'Refund request has been submitted and is awaiting review',
    UNDER_REVIEW: 'Refund request is being reviewed by an administrator',
    APPROVED: 'Refund has been approved and will be processed soon',
    PROCESSING: 'Refund is being processed by the payment provider',
    COMPLETED: 'Refund has been successfully completed and funds have been returned',
    REJECTED: 'Refund request has been rejected',
    CANCELLED: 'Refund request has been cancelled',
  };
  
  return descriptions[status] || 'Unknown status';
}

// Helper function to determine if status is final
export function isRefundStatusFinal(status: RefundStatus): boolean {
  return ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(status);
}

// Helper function to determine if status is in progress
export function isRefundStatusInProgress(status: RefundStatus): boolean {
  return ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING'].includes(status);
}
