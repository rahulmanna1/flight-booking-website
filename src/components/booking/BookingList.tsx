// Booking List Component
// Main interface for viewing and managing bookings

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import {
  Plane,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Clock,
  Calendar,
  ChevronDown,
  RefreshCw,
  Plus,
  Download,
  BarChart3,
  Settings,
  Loader2,
} from 'lucide-react';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';
import { BookingSearchFilters, BookingStatus } from '../../types/booking';
import { useBooking } from '../../contexts/BookingContext';

interface BookingListProps {
  className?: string;
}

export function BookingList({ className = '' }: BookingListProps) {
  const {
    state,
    loadUserBookings,
    searchBookings,
    clearSearch,
    setViewMode,
    setSorting,
    goToPage,
    setPageSize,
    hideBookingDetails,
    loadBookingStats,
  } = useBooking();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<BookingStatus[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'upcoming' | 'past' | 'this-month'>('all');
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>();

  // Available booking statuses
  const bookingStatuses: BookingStatus[] = [
    'PENDING_PAYMENT',
    'PAYMENT_FAILED',
    'CONFIRMED',
    'TICKETED',
    'CHECKED_IN',
    'BOARDING',
    'DEPARTED',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'EXPIRED',
  ];

  // Load bookings on component mount
  useEffect(() => {
    loadUserBookings();
    loadBookingStats();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() && selectedStatuses.length === 0 && dateFilter === 'all') {
      // Clear search if no filters
      clearSearch();
      await loadUserBookings();
      return;
    }

    const filters: BookingSearchFilters = {};

    // Status filters
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }

    // Date filters
    if (dateFilter !== 'all') {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case 'upcoming':
          filters.dateRange = {
            start: startOfToday.toISOString(),
            end: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString(),
            type: 'travel',
          };
          break;
        case 'past':
          filters.dateRange = {
            start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
            end: startOfToday.toISOString(),
            type: 'travel',
          };
          break;
        case 'this-month':
          filters.dateRange = {
            start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
            type: 'created',
          };
          break;
      }
    }

    await searchBookings(filters);
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setDateFilter('all');
    clearSearch();
    await loadUserBookings();
  };

  const handleStatusToggle = (status: BookingStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleRefresh = async () => {
    if (state.searchResults) {
      await handleSearch();
    } else {
      await loadUserBookings();
    }
  };

  const handleViewModeChange = (mode: 'list' | 'grid' | 'timeline') => {
    setViewMode(mode);
  };

  const handleSortChange = (sortBy: string) => {
    const currentSortBy = state.ui.sortBy;
    const currentOrder = state.ui.sortOrder;
    
    if (currentSortBy === sortBy) {
      // Toggle order if same field
      setSorting(sortBy as any, currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      setSorting(sortBy as any, 'desc');
    }
  };

  const handlePageSizeChange = (size: string) => {
    setPageSize(parseInt(size));
  };

  const getStatusLabel = (status: BookingStatus): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const bookings = state.searchResults ? state.searchResults.bookings : state.bookings;
  const isLoading = state.isLoadingBookings || state.isSearching;
  const hasActiveFilters = selectedStatuses.length > 0 || dateFilter !== 'all' || searchQuery.trim();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your flight bookings
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by booking reference, passenger name, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={hasActiveFilters ? 'bg-primary/10 border-primary' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {selectedStatuses.length + (dateFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedStatuses.length > 0
                            ? `${selectedStatuses.length} selected`
                            : 'All statuses'
                          }
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>Select Statuses</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {bookingStatuses.map((status) => (
                          <DropdownMenuCheckboxItem
                            key={status}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => handleStatusToggle(status)}
                          >
                            {getStatusLabel(status)}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All dates</SelectItem>
                        <SelectItem value="upcoming">Upcoming trips</SelectItem>
                        <SelectItem value="past">Past trips</SelectItem>
                        <SelectItem value="this-month">Booked this month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex items-end space-x-2">
                    <Button onClick={handleSearch} className="flex-1">
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              `${state.pagination.total} booking${state.pagination.total !== 1 ? 's' : ''} found`
            )}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear all filters
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={state.ui.viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="rounded-r-none border-r"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={state.ui.viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="rounded-none border-r"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={state.ui.viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('timeline')}
              className="rounded-l-none"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Controls */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {state.ui.sortOrder === 'asc' ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange('createdAt')}>
                Date Created
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('travelDate')}>
                Travel Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('status')}>
                Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('total')}>
                Total Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('bookingReference')}>
                Booking Reference
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page Size */}
          <Select value={state.pagination.limit.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bookings Display */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted rounded w-32"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-16 bg-muted rounded w-48"></div>
                    <div className="h-8 bg-muted rounded w-8"></div>
                    <div className="h-16 bg-muted rounded w-48"></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <>
          {/* Bookings Grid/List */}
          <div className={
            state.ui.viewMode === 'grid' 
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                viewMode={state.ui.viewMode}
                onViewDetails={(bookingId) => setSelectedBookingId(bookingId)}
              />
            ))}
          </div>

          {/* Pagination */}
          {state.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {state.pagination.page} of {state.pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(state.pagination.page - 1)}
                  disabled={!state.pagination.hasPrevious}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(state.pagination.page + 1)}
                  disabled={!state.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-muted-foreground mb-6">
              {hasActiveFilters
                ? 'No bookings match your current filters. Try adjusting your search criteria.'
                : 'You don\'t have any bookings yet. Book your first flight to get started!'
              }
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book a Flight
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={!!selectedBookingId}
        onClose={() => setSelectedBookingId(undefined)}
        bookingId={selectedBookingId}
      />
    </div>
  );
}

export default BookingList;