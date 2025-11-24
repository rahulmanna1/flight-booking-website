/**
 * Unit Tests - RefundStatusBadge Component
 * 
 * Tests for the refund status badge component including
 * status rendering, color mapping, icons, and helper functions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  RefundStatusBadge,
  getRefundStatusDescription,
  isRefundStatusFinal,
  isRefundStatusInProgress,
} from '../RefundStatusBadge';

describe('RefundStatusBadge Component', () => {
  describe('Status Rendering', () => {
    it('should render PENDING status correctly', () => {
      render(<RefundStatusBadge status="PENDING" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should render UNDER_REVIEW status correctly', () => {
      render(<RefundStatusBadge status="UNDER_REVIEW" />);
      expect(screen.getByText('Under Review')).toBeInTheDocument();
    });

    it('should render APPROVED status correctly', () => {
      render(<RefundStatusBadge status="APPROVED" />);
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    it('should render PROCESSING status correctly', () => {
      render(<RefundStatusBadge status="PROCESSING" />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should render COMPLETED status correctly', () => {
      render(<RefundStatusBadge status="COMPLETED" />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should render REJECTED status correctly', () => {
      render(<RefundStatusBadge status="REJECTED" />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
    });

    it('should render CANCELLED status correctly', () => {
      render(<RefundStatusBadge status="CANCELLED" />);
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });
  });

  describe('Color Classes', () => {
    it('should apply yellow color for PENDING', () => {
      const { container } = render(<RefundStatusBadge status="PENDING" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('should apply blue color for UNDER_REVIEW', () => {
      const { container } = render(<RefundStatusBadge status="UNDER_REVIEW" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    it('should apply emerald color for APPROVED', () => {
      const { container } = render(<RefundStatusBadge status="APPROVED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-emerald-100', 'text-emerald-800');
    });

    it('should apply indigo color for PROCESSING', () => {
      const { container } = render(<RefundStatusBadge status="PROCESSING" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-indigo-100', 'text-indigo-800');
    });

    it('should apply green color for COMPLETED', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply red color for REJECTED', () => {
      const { container } = render(<RefundStatusBadge status="REJECTED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
    });

    it('should apply gray color for CANCELLED', () => {
      const { container } = render(<RefundStatusBadge status="CANCELLED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Icon Display', () => {
    it('should show icon by default', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" />);
      const badge = container.firstChild;
      const svg = badge?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" showIcon={false} />);
      const badge = container.firstChild;
      const svg = badge?.querySelector('svg');
      expect(svg).not.toBeInTheDocument();
    });

    it('should show icon when showIcon is explicitly true', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" showIcon={true} />);
      const badge = container.firstChild;
      const svg = badge?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should apply medium size by default', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm', 'px-2.5', 'py-1');
    });

    it('should apply small size classes', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" size="sm" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');
    });

    it('should apply medium size classes', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" size="md" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-sm', 'px-2.5', 'py-1');
    });

    it('should apply large size classes', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" size="lg" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('text-base', 'px-3', 'py-1.5');
    });
  });

  describe('Badge Structure', () => {
    it('should render as Badge component with outline variant', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" />);
      const badge = container.firstChild;
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('border');
    });

    it('should have inline-flex items-center classes', () => {
      const { container } = render(<RefundStatusBadge status="COMPLETED" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('inline-flex', 'items-center');
    });
  });
});

describe('Helper Functions', () => {
  describe('getRefundStatusDescription', () => {
    it('should return correct description for PENDING', () => {
      const desc = getRefundStatusDescription('PENDING');
      expect(desc).toContain('submitted');
      expect(desc).toContain('awaiting review');
    });

    it('should return correct description for UNDER_REVIEW', () => {
      const desc = getRefundStatusDescription('UNDER_REVIEW');
      expect(desc).toContain('being reviewed');
      expect(desc).toContain('administrator');
    });

    it('should return correct description for APPROVED', () => {
      const desc = getRefundStatusDescription('APPROVED');
      expect(desc).toContain('approved');
      expect(desc).toContain('processed soon');
    });

    it('should return correct description for PROCESSING', () => {
      const desc = getRefundStatusDescription('PROCESSING');
      expect(desc).toContain('being processed');
      expect(desc).toContain('payment provider');
    });

    it('should return correct description for COMPLETED', () => {
      const desc = getRefundStatusDescription('COMPLETED');
      expect(desc).toContain('successfully completed');
      expect(desc).toContain('funds have been returned');
    });

    it('should return correct description for REJECTED', () => {
      const desc = getRefundStatusDescription('REJECTED');
      expect(desc).toContain('rejected');
    });

    it('should return correct description for CANCELLED', () => {
      const desc = getRefundStatusDescription('CANCELLED');
      expect(desc).toContain('cancelled');
    });

    it('should return unknown status message for invalid status', () => {
      const desc = getRefundStatusDescription('INVALID' as any);
      expect(desc).toBe('Unknown status');
    });
  });

  describe('isRefundStatusFinal', () => {
    it('should return true for COMPLETED', () => {
      expect(isRefundStatusFinal('COMPLETED')).toBe(true);
    });

    it('should return true for REJECTED', () => {
      expect(isRefundStatusFinal('REJECTED')).toBe(true);
    });

    it('should return true for CANCELLED', () => {
      expect(isRefundStatusFinal('CANCELLED')).toBe(true);
    });

    it('should return false for PENDING', () => {
      expect(isRefundStatusFinal('PENDING')).toBe(false);
    });

    it('should return false for UNDER_REVIEW', () => {
      expect(isRefundStatusFinal('UNDER_REVIEW')).toBe(false);
    });

    it('should return false for APPROVED', () => {
      expect(isRefundStatusFinal('APPROVED')).toBe(false);
    });

    it('should return false for PROCESSING', () => {
      expect(isRefundStatusFinal('PROCESSING')).toBe(false);
    });
  });

  describe('isRefundStatusInProgress', () => {
    it('should return true for PENDING', () => {
      expect(isRefundStatusInProgress('PENDING')).toBe(true);
    });

    it('should return true for UNDER_REVIEW', () => {
      expect(isRefundStatusInProgress('UNDER_REVIEW')).toBe(true);
    });

    it('should return true for APPROVED', () => {
      expect(isRefundStatusInProgress('APPROVED')).toBe(true);
    });

    it('should return true for PROCESSING', () => {
      expect(isRefundStatusInProgress('PROCESSING')).toBe(true);
    });

    it('should return false for COMPLETED', () => {
      expect(isRefundStatusInProgress('COMPLETED')).toBe(false);
    });

    it('should return false for REJECTED', () => {
      expect(isRefundStatusInProgress('REJECTED')).toBe(false);
    });

    it('should return false for CANCELLED', () => {
      expect(isRefundStatusInProgress('CANCELLED')).toBe(false);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle undefined status gracefully', () => {
    const { container } = render(<RefundStatusBadge status={undefined as any} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle null status gracefully', () => {
    const { container } = render(<RefundStatusBadge status={null as any} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with all props combined', () => {
    const { container } = render(
      <RefundStatusBadge status="COMPLETED" showIcon={true} size="lg" />
    );
    const badge = container.firstChild;
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-base', 'px-3', 'py-1.5');
    expect(badge?.querySelector('svg')).toBeInTheDocument();
  });
});
