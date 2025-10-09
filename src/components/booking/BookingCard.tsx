// Booking Card Component
// Display individual booking information in a card format

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  Plane, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CreditCard,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { FlightBooking } from '../../types/booking';
import { useBooking } from '../../contexts/BookingContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BookingCardProps {
  booking: FlightBooking;
  viewMode?: 'list' | 'grid' | 'timeline';
  onViewDetails?: (bookingId: string) => void;
  onEditBooking?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  className?: string;
}

export function BookingCard({
  booking,
  viewMode = 'list',
  onViewDetails,
  onEditBooking,
  onCancelBooking,
  className = '',
}: BookingCardProps) {
  const { 
    getBookingStatusColor, 
    getBookingStatusLabel, 
    canCancelBooking, 
    canModifyBooking,
    canCheckIn,
    formatBookingReference,
    showBookingDetails,
    showCancellationModal,
    showCheckInModal,
    refreshBooking,
  } = useBooking();
  
  const { formatAmount } = useCurrency();

  // Get primary flight segment for display
  const primarySegment = booking.flightSegments[0];
  const isRoundTrip = booking.tripType === 'round-trip';
  const returnSegment = isRoundTrip ? booking.flightSegments[1] : null;

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
  };

  const departureInfo = formatDateTime(primarySegment.departure.dateTime);
  const arrivalInfo = formatDateTime(primarySegment.arrival.dateTime);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(booking.id);
    } else {
      showBookingDetails(booking.id);
    }
  };

  const handleEditBooking = () => {
    if (onEditBooking) {
      onEditBooking(booking.id);
    }
  };

  const handleCancelBooking = () => {
    if (onCancelBooking) {
      onCancelBooking(booking.id);
    } else {
      showCancellationModal(booking.id);
    }
  };

  const handleCheckIn = () => {
    showCheckInModal(booking.id);
  };

  const handleRefresh = async () => {
    await refreshBooking(booking.id);
  };

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'CONFIRMED':
      case 'TICKETED':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <XCircle className="h-4 w-4" />;
      case 'PENDING_PAYMENT':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const cardContent = (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold">
              {formatBookingReference(booking.bookingReference)}
            </CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`text-${getBookingStatusColor(booking.status)}-700 border-${getBookingStatusColor(booking.status)}-200 bg-${getBookingStatusColor(booking.status)}-50`}
            >
              {getStatusIcon()}
              <span className="ml-1">{getBookingStatusLabel(booking.status)}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {canModifyBooking(booking) && (
                  <DropdownMenuItem onClick={handleEditBooking}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modify Booking
                  </DropdownMenuItem>
                )}
                {canCheckIn(booking) && (
                  <DropdownMenuItem onClick={handleCheckIn}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check In
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {canCancelBooking(booking) && (
                  <DropdownMenuItem 
                    onClick={handleCancelBooking}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Booking
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Flight Route Information */}
        <div className="space-y-3">
          {/* Outbound Flight */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="font-mono text-lg font-bold">
                  {primarySegment.departure.airport.code}
                </div>
                <div className="text-sm text-muted-foreground">
                  {departureInfo.time}
                </div>
                <div className="text-xs text-muted-foreground">
                  {departureInfo.date}
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full h-px bg-border"></div>
                <div className="absolute bg-background px-2 text-xs text-muted-foreground">
                  <Plane className="h-4 w-4" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="font-mono text-lg font-bold">
                  {primarySegment.arrival.airport.code}
                </div>
                <div className="text-sm text-muted-foreground">
                  {arrivalInfo.time}
                </div>
                <div className="text-xs text-muted-foreground">
                  {arrivalInfo.date}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium">
                {primarySegment.airline.name}
              </div>
              <div className="text-xs text-muted-foreground">
                Flight {primarySegment.flightNumber}
              </div>
              <div className="text-xs text-muted-foreground">
                {primarySegment.duration}
              </div>
            </div>
          </div>

          {/* Return Flight (if round-trip) */}
          {returnSegment && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="font-mono text-lg font-bold">
                      {returnSegment.departure.airport.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(returnSegment.departure.dateTime).time}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(returnSegment.departure.dateTime).date}
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="w-full h-px bg-border"></div>
                    <div className="absolute bg-background px-2 text-xs text-muted-foreground">
                      <Plane className="h-4 w-4 transform rotate-180" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-mono text-lg font-bold">
                      {returnSegment.arrival.airport.code}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(returnSegment.arrival.dateTime).time}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(returnSegment.arrival.dateTime).date}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {returnSegment.airline.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Flight {returnSegment.flightNumber}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {returnSegment.duration}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Booking Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Passengers:</span>
            <span className="font-medium">{booking.passengers.length}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Booked:</span>
            <span className="font-medium">
              {new Date(booking.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Class:</span>
            <span className="font-medium capitalize">
              {primarySegment.serviceClass.replace('-', ' ')}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold text-primary">
              {formatAmount(booking.pricing.total)}
            </span>
          </div>
        </div>

        {/* Additional Services */}
        {Object.values(booking.selectedServices).some(service => service) && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-1">
              {booking.selectedServices.seatSelection && (
                <Badge variant="secondary" className="text-xs">Seat Selection</Badge>
              )}
              {booking.selectedServices.extraBaggage && (
                <Badge variant="secondary" className="text-xs">Extra Baggage</Badge>
              )}
              {booking.selectedServices.meals && (
                <Badge variant="secondary" className="text-xs">Meals</Badge>
              )}
              {booking.selectedServices.insurance && (
                <Badge variant="secondary" className="text-xs">Insurance</Badge>
              )}
              {booking.selectedServices.priorityBoarding && (
                <Badge variant="secondary" className="text-xs">Priority Boarding</Badge>
              )}
              {booking.selectedServices.loungeAccess && (
                <Badge variant="secondary" className="text-xs">Lounge Access</Badge>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            onClick={handleViewDetails} 
            className="flex-1" 
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          {canCheckIn(booking) && (
            <Button 
              onClick={handleCheckIn} 
              variant="outline" 
              size="sm"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          
          {canModifyBooking(booking) && (
            <Button 
              onClick={handleEditBooking} 
              variant="outline" 
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modify
            </Button>
          )}
        </div>
      </CardContent>
    </>
  );

  if (viewMode === 'grid') {
    return (
      <Card 
        className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}
        onClick={handleViewDetails}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      {cardContent}
    </Card>
  );
}

export default BookingCard;