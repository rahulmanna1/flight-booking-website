// Check-in Modal Component
// Handle online check-in with seat selection and boarding pass generation

import React, { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  CheckCircle,
  Plane,
  Users,
  Clock,
  MapPin,
  Luggage,
  Utensils,
  QrCode,
  Download,
  Mail,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  Armchair,
  Info,
} from 'lucide-react';
import { FlightBooking, PassengerInfo, FlightSegment } from '../../types/booking';
import { useBooking } from '../../contexts/BookingContext';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
}

export function CheckInModal({
  isOpen,
  onClose,
  bookingId,
}: CheckInModalProps) {
  const {
    state,
    getBooking,
    checkInPassenger,
    formatBookingReference,
  } = useBooking();

  const [booking, setBooking] = useState<FlightBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [step, setStep] = useState<'passengers' | 'seats' | 'services' | 'confirmation' | 'success' | 'error'>('passengers');
  const [selectedPassengers, setSelectedPassengers] = useState<string[]>([]);
  const [seatSelections, setSeatSelections] = useState<{[passengerId: string]: {[segmentId: string]: string}}>({});
  const [selectedServices, setSelectedServices] = useState<{[passengerId: string]: string[]}>({});

  // Mock seat map data - in reality, this would come from airline APIs
  const mockSeatMap = {
    rows: Array.from({length: 30}, (_, i) => ({
      number: i + 1,
      seats: ['A', 'B', 'C', 'D', 'E', 'F'].map(letter => ({
        id: `${i + 1}${letter}`,
        letter,
        type: i < 3 ? 'business' : 'economy',
        status: Math.random() > 0.7 ? 'occupied' : 'available',
        extraLegroom: [12, 13, 23, 24].includes(i + 1),
        price: [12, 13, 23, 24].includes(i + 1) ? 25 : 0,
      }))
    }))
  };

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
      // Pre-select all passengers
      if (bookingData) {
        setSelectedPassengers(bookingData.passengers.map(p => p.id));
      }
    } catch (error) {
      console.error('Failed to load booking details:', error);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePassengerToggle = (passengerId: string) => {
    setSelectedPassengers(prev =>
      prev.includes(passengerId)
        ? prev.filter(id => id !== passengerId)
        : [...prev, passengerId]
    );
  };

  const handleSeatSelect = (passengerId: string, segmentId: string, seatId: string) => {
    setSeatSelections(prev => ({
      ...prev,
      [passengerId]: {
        ...prev[passengerId],
        [segmentId]: seatId,
      }
    }));
  };

  const handleServiceToggle = (passengerId: string, service: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [passengerId]: prev[passengerId]?.includes(service)
        ? prev[passengerId].filter(s => s !== service)
        : [...(prev[passengerId] || []), service],
    }));
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    setIsCheckingIn(true);
    setStep('confirmation');

    try {
      // Process check-in for each selected passenger and segment
      for (const passengerId of selectedPassengers) {
        for (const segment of booking.flightSegments) {
          const seatNumber = seatSelections[passengerId]?.[segment.id];
          await checkInPassenger(booking.id, passengerId, segment.id, seatNumber);
        }
      }
      setStep('success');
    } catch (error) {
      console.error('Check-in failed:', error);
      setStep('error');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
      // Reset modal state
      setStep('passengers');
      setSelectedPassengers([]);
      setSeatSelections({});
      setSelectedServices({});
    } else if (!isCheckingIn) {
      onClose();
    }
  };

  const canProceedToSeats = selectedPassengers.length > 0;
  const canProceedToServices = selectedPassengers.every(passengerId =>
    booking?.flightSegments.every(segment =>
      seatSelections[passengerId]?.[segment.id]
    ) ?? false
  );

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
              <p>Loading check-in details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!booking) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Not Found</DialogTitle>
            <DialogDescription>
              Could not find the booking for check-in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>Online Check-in</span>
          </DialogTitle>
          <DialogDescription>
            Check-in for booking {formatBookingReference(booking.bookingReference)}
          </DialogDescription>
        </DialogHeader>

        {/* Flight Information */}
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {booking.flightSegments.map((segment, index) => {
                const departureInfo = formatDateTime(segment.departure.dateTime);
                const arrivalInfo = formatDateTime(segment.arrival.dateTime);
                
                return (
                  <div key={segment.id} className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-bold text-lg">{segment.departure.airport.code}</div>
                      <div className="text-xs text-muted-foreground">{departureInfo.time}</div>
                      <div className="text-xs text-muted-foreground">{departureInfo.date}</div>
                    </div>
                    <div className="flex-1 text-center">
                      <Plane className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-xs text-muted-foreground">{segment.flightNumber}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{segment.arrival.airport.code}</div>
                      <div className="text-xs text-muted-foreground">{arrivalInfo.time}</div>
                      <div className="text-xs text-muted-foreground">{arrivalInfo.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="flex-1 overflow-auto">
          {step === 'passengers' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Passengers for Check-in</h3>
                <div className="space-y-3">
                  {booking.passengers.map((passenger) => (
                    <Card key={passenger.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={passenger.id}
                            checked={selectedPassengers.includes(passenger.id)}
                            onCheckedChange={() => handlePassengerToggle(passenger.id)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={passenger.id} className="cursor-pointer">
                              <div className="font-medium">
                                {passenger.title} {passenger.firstName} {passenger.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {passenger.type.charAt(0).toUpperCase() + passenger.type.slice(1)} • 
                                Born {new Date(passenger.dateOfBirth).toLocaleDateString()}
                              </div>
                            </Label>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {passenger.type}
                          </Badge>
                        </div>
                        
                        {/* Special Requirements */}
                        {(passenger.specialRequests?.length || passenger.dietaryRequirements?.length) && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex flex-wrap gap-1">
                              {passenger.dietaryRequirements?.map((req, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Utensils className="h-3 w-3 mr-1" />
                                  {req}
                                </Badge>
                              ))}
                              {passenger.specialRequests?.map((req, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Online check-in is available 24 hours before departure. 
                  Please ensure all passenger information is correct before proceeding.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'seats' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Seats</h3>
                
                {selectedPassengers.map(passengerId => {
                  const passenger = booking.passengers.find(p => p.id === passengerId);
                  if (!passenger) return null;

                  return (
                    <div key={passengerId} className="space-y-4 mb-8">
                      <h4 className="font-medium">
                        {passenger.firstName} {passenger.lastName}
                      </h4>
                      
                      {booking.flightSegments.map(segment => (
                        <Card key={segment.id}>
                          <CardHeader>
                            <CardTitle className="text-base">
                              {segment.flightNumber}: {segment.departure.airport.code} → {segment.arrival.airport.code}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Seat Map */}
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="text-xs text-center mb-2 text-muted-foreground">
                                  Front of Aircraft
                                </div>
                                
                                {/* Seat Legend */}
                                <div className="flex justify-center space-x-4 mb-4 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-green-200 border rounded"></div>
                                    <span>Available</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-red-200 border rounded"></div>
                                    <span>Occupied</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-blue-200 border-2 border-blue-500 rounded"></div>
                                    <span>Selected</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-yellow-200 border rounded"></div>
                                    <span>Extra Legroom (+$25)</span>
                                  </div>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {mockSeatMap.rows.slice(0, 20).map((row) => (
                                    <div key={row.number} className="flex items-center justify-center space-x-1">
                                      <div className="w-6 text-xs text-center">{row.number}</div>
                                      {row.seats.slice(0, 3).map((seat) => (
                                        <Button
                                          key={seat.id}
                                          size="sm"
                                          variant="outline"
                                          className={`w-8 h-8 p-0 text-xs ${
                                            seat.status === 'occupied' 
                                              ? 'bg-red-200 cursor-not-allowed' 
                                              : seat.extraLegroom 
                                                ? 'bg-yellow-100 hover:bg-yellow-200'
                                                : seatSelections[passengerId]?.[segment.id] === seat.id
                                                  ? 'bg-blue-200 border-blue-500 border-2'
                                                  : 'bg-green-100 hover:bg-green-200'
                                          }`}
                                          disabled={seat.status === 'occupied'}
                                          onClick={() => handleSeatSelect(passengerId, segment.id, seat.id)}
                                        >
                                          {seat.letter}
                                        </Button>
                                      ))}
                                      <div className="w-4"></div> {/* Aisle */}
                                      {row.seats.slice(3).map((seat) => (
                                        <Button
                                          key={seat.id}
                                          size="sm"
                                          variant="outline"
                                          className={`w-8 h-8 p-0 text-xs ${
                                            seat.status === 'occupied' 
                                              ? 'bg-red-200 cursor-not-allowed' 
                                              : seat.extraLegroom 
                                                ? 'bg-yellow-100 hover:bg-yellow-200'
                                                : seatSelections[passengerId]?.[segment.id] === seat.id
                                                  ? 'bg-blue-200 border-blue-500 border-2'
                                                  : 'bg-green-100 hover:bg-green-200'
                                          }`}
                                          disabled={seat.status === 'occupied'}
                                          onClick={() => handleSeatSelect(passengerId, segment.id, seat.id)}
                                        >
                                          {seat.letter}
                                        </Button>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Selected Seat Info */}
                              {seatSelections[passengerId]?.[segment.id] && (
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Armchair className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium">
                                      Selected: {seatSelections[passengerId][segment.id]}
                                    </span>
                                  </div>
                                  {/* Add seat price if extra legroom */}
                                  <Badge variant="secondary">Free</Badge>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'services' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
                
                {selectedPassengers.map(passengerId => {
                  const passenger = booking.passengers.find(p => p.id === passengerId);
                  if (!passenger) return null;

                  const availableServices = [
                    { id: 'priority_boarding', name: 'Priority Boarding', price: 15, icon: Users },
                    { id: 'extra_baggage', name: 'Extra Baggage (23kg)', price: 45, icon: Luggage },
                    { id: 'meal_upgrade', name: 'Meal Upgrade', price: 25, icon: Utensils },
                    { id: 'wifi', name: 'In-flight WiFi', price: 12, icon: Smartphone },
                  ];

                  return (
                    <Card key={passengerId}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {passenger.firstName} {passenger.lastName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {availableServices.map(service => (
                            <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                              <Checkbox
                                id={`${passengerId}-${service.id}`}
                                checked={selectedServices[passengerId]?.includes(service.id)}
                                onCheckedChange={() => handleServiceToggle(passengerId, service.id)}
                              />
                              <service.icon className="h-4 w-4 text-muted-foreground" />
                              <div className="flex-1">
                                <Label htmlFor={`${passengerId}-${service.id}`} className="cursor-pointer">
                                  <div className="font-medium">{service.name}</div>
                                  <div className="text-sm text-muted-foreground">${service.price}</div>
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center space-y-6 py-8">
              <RefreshCw className="h-16 w-16 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Processing Check-in</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we complete your check-in...
                </p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-6 py-8">
              <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-700">Check-in Successful!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You have successfully checked in for your flight.
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Checked-in Passengers:</strong>
                      <ul className="mt-2 space-y-1">
                        {selectedPassengers.map(passengerId => {
                          const passenger = booking.passengers.find(p => p.id === passengerId);
                          return passenger ? (
                            <li key={passengerId}>
                              {passenger.firstName} {passenger.lastName}
                              {booking.flightSegments.map(segment => (
                                <span key={segment.id} className="ml-2 font-mono text-xs">
                                  {segment.flightNumber}: {seatSelections[passengerId]?.[segment.id] || 'Seat TBD'}
                                </span>
                              ))}
                            </li>
                          ) : null;
                        })}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Boarding Pass
                </Button>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Boarding Pass
                </Button>
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Mobile Boarding Pass
                </Button>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Please arrive at the airport at least 2 hours before domestic flights 
                  and 3 hours before international flights.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center space-y-6 py-8">
              <AlertTriangle className="h-16 w-16 mx-auto text-red-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">Check-in Failed</h3>
                <p className="text-sm text-muted-foreground">
                  We encountered an error during check-in. Please try again or contact support.
                </p>
              </div>

              {state.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {state.errors[0].message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {step === 'passengers' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep('seats')}
                disabled={!canProceedToSeats}
              >
                Continue to Seat Selection
              </Button>
            </>
          )}

          {step === 'seats' && (
            <>
              <Button variant="outline" onClick={() => setStep('passengers')}>
                Back
              </Button>
              <Button
                onClick={() => setStep('services')}
                disabled={!canProceedToServices}
              >
                Continue to Services
              </Button>
            </>
          )}

          {step === 'services' && (
            <>
              <Button variant="outline" onClick={() => setStep('seats')}>
                Back
              </Button>
              <Button onClick={handleCheckIn}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Check-in
              </Button>
            </>
          )}

          {(step === 'success' || step === 'error') && (
            <div className="flex space-x-2 ml-auto">
              {step === 'error' && (
                <Button variant="outline" onClick={() => setStep('passengers')}>
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CheckInModal;