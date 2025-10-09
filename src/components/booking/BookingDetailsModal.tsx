// Booking Details Modal Component
// Comprehensive view of booking information with actions

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Plane,
  Users,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Shield,
  Utensils,
  Luggage,
  Wifi,
  Monitor,
  Coffee,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Mail,
  Phone,
  Edit,
  RefreshCw,
  QrCode,
  Printer,
  MessageSquare,
  Star,
} from 'lucide-react';
import { FlightBooking, FlightSegment, PassengerInfo } from '../../types/booking';
import { useBooking } from '../../contexts/BookingContext';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export function BookingDetailsModal({
  isOpen,
  onClose,
  bookingId,
}: BookingDetailsModalProps) {
  const {
    state,
    getBooking,
    getBookingStatusColor,
    getBookingStatusLabel,
    canCancelBooking,
    canModifyBooking,
    canCheckIn,
    formatBookingReference,
    refreshBooking,
    sendBookingConfirmation,
    showCancellationModal,
    showCheckInModal,
  } = useBooking();

  const { formatAmount } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<FlightBooking | null>(null);

  // Load booking details when modal opens
  useEffect(() => {
    if (isOpen && bookingId) {
      loadBookingDetails();
    }
  }, [isOpen, bookingId]);

  const loadBookingDetails = async () => {
    if (!bookingId) return;
    
    setIsLoading(true);
    try {
      const bookingData = await getBooking(bookingId);
      setBooking(bookingData);
    } catch (error) {
      console.error('Failed to load booking details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (bookingId) {
      await refreshBooking(bookingId);
      await loadBookingDetails();
    }
  };

  const handleSendConfirmation = async () => {
    if (bookingId) {
      await sendBookingConfirmation(bookingId);
    }
  };

  const handleCheckIn = () => {
    if (bookingId) {
      showCheckInModal(bookingId);
      onClose();
    }
  };

  const handleCancelBooking = () => {
    if (bookingId) {
      showCancellationModal(bookingId);
      onClose();
    }
  };

  if (!booking && !isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Not Found</DialogTitle>
            <DialogDescription>
              The requested booking could not be found.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'ticketed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'pending_payment':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const FlightSegmentCard = ({ segment, isReturn = false }: { segment: FlightSegment; isReturn?: boolean }) => {
    const departureInfo = formatDateTime(segment.departure.dateTime);
    const arrivalInfo = formatDateTime(segment.arrival.dateTime);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Plane className={`h-5 w-5 ${isReturn ? 'transform rotate-180' : ''}`} />
            <span>{isReturn ? 'Return Flight' : 'Outbound Flight'}</span>
            <Badge variant="outline">{segment.flightNumber}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Flight Route */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">
                {segment.departure.airport.code}
              </div>
              <div className="text-sm text-muted-foreground">
                {segment.departure.airport.city}
              </div>
              <div className="text-sm font-medium mt-1">
                {departureInfo.time}
              </div>
              <div className="text-xs text-muted-foreground">
                {departureInfo.date}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center mx-4">
              <div className="text-xs text-muted-foreground mb-1">
                {segment.duration}
              </div>
              <div className="w-full h-px bg-border relative">
                <Plane className="h-4 w-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {segment.stops === 0 ? 'Direct' : `${segment.stops} stop${segment.stops > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold font-mono">
                {segment.arrival.airport.code}
              </div>
              <div className="text-sm text-muted-foreground">
                {segment.arrival.airport.city}
              </div>
              <div className="text-sm font-medium mt-1">
                {arrivalInfo.time}
              </div>
              <div className="text-xs text-muted-foreground">
                {arrivalInfo.date}
              </div>
            </div>
          </div>

          <Separator />

          {/* Flight Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Airline</div>
              <div className="text-muted-foreground">{segment.airline.name}</div>
            </div>
            <div>
              <div className="font-medium">Aircraft</div>
              <div className="text-muted-foreground">{segment.aircraft.type}</div>
            </div>
            <div>
              <div className="font-medium">Service Class</div>
              <div className="text-muted-foreground capitalize">
                {segment.serviceClass.replace('-', ' ')}
              </div>
            </div>
          </div>

          {/* Amenities */}
          {segment.amenities.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="font-medium mb-2">Amenities</div>
                <div className="flex flex-wrap gap-2">
                  {segment.wifi && (
                    <Badge variant="secondary">
                      <Wifi className="h-3 w-3 mr-1" />
                      Wi-Fi
                    </Badge>
                  )}
                  {segment.entertainment && (
                    <Badge variant="secondary">
                      <Monitor className="h-3 w-3 mr-1" />
                      Entertainment
                    </Badge>
                  )}
                  {segment.meals && segment.meals.length > 0 && (
                    <Badge variant="secondary">
                      <Utensils className="h-3 w-3 mr-1" />
                      Meals
                    </Badge>
                  )}
                  {segment.amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Seat Assignments */}
          {segment.seatAssignments && Object.keys(segment.seatAssignments).length > 0 && (
            <>
              <Separator />
              <div>
                <div className="font-medium mb-2">Seat Assignments</div>
                <div className="space-y-1">
                  {Object.entries(segment.seatAssignments).map(([passengerId, seatInfo]) => {
                    const passenger = booking?.passengers.find(p => p.id === passengerId);
                    return (
                      <div key={passengerId} className="flex justify-between text-sm">
                        <span>{passenger?.firstName} {passenger?.lastName}</span>
                        <span className="font-mono">{seatInfo.seatNumber}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const PassengerCard = ({ passenger }: { passenger: PassengerInfo }) => (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div>
              <div className="font-medium">
                {passenger.title} {passenger.firstName} {passenger.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
                {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)} • 
                Born {new Date(passenger.dateOfBirth).toLocaleDateString()}
              </div>
            </div>
            
            {passenger.passport && (
              <div className="text-sm">
                <div className="font-medium">Passport</div>
                <div className="text-muted-foreground">
                  {passenger.passport.number} • Expires {new Date(passenger.passport.expiryDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {passenger.frequentFlyer && (
              <div className="text-sm">
                <div className="font-medium">Frequent Flyer</div>
                <div className="text-muted-foreground">
                  {passenger.frequentFlyer.airline} • {passenger.frequentFlyer.membershipNumber}
                  <Badge variant="outline" className="ml-2">
                    <Star className="h-3 w-3 mr-1" />
                    {passenger.frequentFlyer.tier}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <Badge variant="outline" className="capitalize">
            {passenger.type}
          </Badge>
        </div>

        {/* Special Requirements */}
        {(passenger.specialRequests?.length || passenger.dietaryRequirements?.length) && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              {passenger.dietaryRequirements && passenger.dietaryRequirements.length > 0 && (
                <div>
                  <div className="text-sm font-medium">Dietary Requirements</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {passenger.dietaryRequirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Utensils className="h-3 w-3 mr-1" />
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {passenger.specialRequests && passenger.specialRequests.length > 0 && (
                <div>
                  <div className="text-sm font-medium">Special Requests</div>
                  <div className="text-sm text-muted-foreground">
                    {passenger.specialRequests.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>Booking {booking ? formatBookingReference(booking.bookingReference) : '...'}</span>
              </DialogTitle>
              <DialogDescription>
                {booking && `${booking.passengers.length} passenger${booking.passengers.length > 1 ? 's' : ''} • ${booking.tripType} trip`}
              </DialogDescription>
            </div>
            
            {booking && (
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  className={`text-${getBookingStatusColor(booking.status)}-700 border-${getBookingStatusColor(booking.status)}-200`}
                >
                  {getStatusIcon(booking.status)}
                  <span className="ml-1">{getBookingStatusLabel(booking.status)}</span>
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading booking details...</p>
            </div>
          </div>
        ) : booking ? (
          <ScrollArea className="max-h-[70vh]">
            <Tabs defaultValue="flights" className="space-y-4">
              <TabsList>
                <TabsTrigger value="flights">Flights</TabsTrigger>
                <TabsTrigger value="passengers">Passengers</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Flight Information Tab */}
              <TabsContent value="flights" className="space-y-4">
                {booking.flightSegments.map((segment, index) => (
                  <FlightSegmentCard
                    key={segment.id}
                    segment={segment}
                    isReturn={index > 0 && booking.tripType === 'round-trip'}
                  />
                ))}
              </TabsContent>

              {/* Passengers Tab */}
              <TabsContent value="passengers" className="space-y-4">
                <div className="grid gap-4">
                  {booking.passengers.map((passenger) => (
                    <PassengerCard key={passenger.id} passenger={passenger} />
                  ))}
                </div>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Price</span>
                        <span>{formatAmount(booking.pricing.basePrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span>{formatAmount(booking.pricing.taxes)}</span>
                      </div>
                      
                      {/* Add-ons */}
                      {Object.entries(booking.pricing.addOns).map(([service, amount]) => (
                        amount && (
                          <div key={service} className="flex justify-between text-sm">
                            <span className="capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span>{formatAmount(amount)}</span>
                          </div>
                        )
                      ))}

                      {/* Discounts */}
                      {booking.pricing.discounts.promoCode && (
                        <div className="flex justify-between text-green-600">
                          <span>Promo Code ({booking.pricing.discounts.promoCode.code})</span>
                          <span>-{formatAmount(booking.pricing.discounts.promoCode.discount)}</span>
                        </div>
                      )}

                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatAmount(booking.pricing.total)}</span>
                      </div>
                    </div>

                    {booking.payment && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Payment Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Method</span>
                              <span className="capitalize">{booking.payment.method}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status</span>
                              <Badge variant={booking.payment.status === 'completed' ? 'default' : 'secondary'}>
                                {booking.payment.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Transaction ID</span>
                              <span className="font-mono">{booking.payment.transactionId}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(booking.selectedServices).map(([service, selected]) => (
                        <div key={service} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selected ? 'bg-green-100 border-green-500' : 'border-gray-300'
                          }`}>
                            {selected && <CheckCircle className="h-3 w-3 text-green-600" />}
                          </div>
                          <span className="capitalize text-sm">
                            {service.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {booking.specialRequests.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h4 className="font-medium mb-2">Special Requests</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {booking.specialRequests.map((request, index) => (
                              <li key={index}>• {request}</li>
                            ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {booking.modifications.map((modification, index) => (
                        <div key={modification.id} className="border-l-2 border-muted pl-4 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="font-medium capitalize">
                              {modification.type.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(modification.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {modification.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            by {modification.performedBy.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        ) : null}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="space-x-2">
            <Button variant="outline" onClick={handleSendConfirmation}>
              <Mail className="h-4 w-4 mr-2" />
              Email Confirmation
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </Button>
          </div>

          <div className="space-x-2">
            {booking && canCheckIn(booking) && (
              <Button onClick={handleCheckIn}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In
              </Button>
            )}
            {booking && canModifyBooking(booking) && (
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modify Booking
              </Button>
            )}
            {booking && canCancelBooking(booking) && (
              <Button variant="destructive" onClick={handleCancelBooking}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Booking
              </Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BookingDetailsModal;