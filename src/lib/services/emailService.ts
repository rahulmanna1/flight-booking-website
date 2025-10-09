// Email Service for Flight Booking Confirmations
// Handles sending confirmation, cancellation, and reminder emails

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'bookings@flightbooker.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'FlightBooker';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const isEmailConfigured = !!SENDGRID_API_KEY;

interface FlightDetails {
  id: string;
  airline: string;
  flightNumber: string;
  from: {
    code: string;
    name: string;
    city: string;
  };
  to: {
    code: string;
    name: string;
    city: string;
  };
  departure: {
    date: string;
    time: string;
  };
  arrival: {
    date: string;
    time: string;
  };
  duration: string;
  class: string;
}

interface BookingDetails {
  id: string;
  bookingReference: string;
  confirmationNumber: string;
  passengerName: string;
  passengerEmail: string;
  flightDetails: FlightDetails;
  price: {
    total: number;
    currency: string;
  };
  bookingDate: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  
  static isConfigured(): boolean {
    return isEmailConfigured;
  }

  // Send booking confirmation email
  static async sendBookingConfirmation(bookingDetails: BookingDetails): Promise<EmailResult> {
    if (!isEmailConfigured) {
      console.warn('⚠️ Email service not configured, skipping booking confirmation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { flightDetails } = bookingDetails;
      
      const htmlContent = this.generateBookingConfirmationHTML(bookingDetails);
      const textContent = this.generateBookingConfirmationText(bookingDetails);

      const msg = {
        to: bookingDetails.passengerEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: `Flight Booking Confirmation - ${bookingDetails.bookingReference}`,
        text: textContent,
        html: htmlContent,
        trackingSettings: {
          clickTracking: {
            enable: false
          },
          openTracking: {
            enable: true
          }
        }
      };

      const [response] = await sgMail.send(msg);
      
      console.log(`✅ Booking confirmation email sent to ${bookingDetails.passengerEmail}`);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };

    } catch (error: any) {
      console.error('❌ Failed to send booking confirmation email:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  // Send booking cancellation email
  static async sendBookingCancellation(bookingDetails: BookingDetails): Promise<EmailResult> {
    if (!isEmailConfigured) {
      console.warn('⚠️ Email service not configured, skipping cancellation email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const htmlContent = this.generateCancellationHTML(bookingDetails);
      const textContent = this.generateCancellationText(bookingDetails);

      const msg = {
        to: bookingDetails.passengerEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME
        },
        subject: `Flight Booking Cancelled - ${bookingDetails.bookingReference}`,
        text: textContent,
        html: htmlContent
      };

      const [response] = await sgMail.send(msg);
      
      console.log(`✅ Cancellation email sent to ${bookingDetails.passengerEmail}`);
      
      return {
        success: true,
        messageId: response.headers['x-message-id'] as string
      };

    } catch (error: any) {
      console.error('❌ Failed to send cancellation email:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }
  }

  // Generate booking confirmation HTML email
  private static generateBookingConfirmationHTML(booking: BookingDetails): string {
    const { flightDetails } = booking;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formatPrice = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Flight Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
        .flight-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .route { display: flex; align-items: center; justify-content: space-between; margin: 20px 0; }
        .city { text-align: center; }
        .city-code { font-size: 24px; font-weight: bold; }
        .city-name { color: #666; font-size: 14px; }
        .arrow { font-size: 20px; color: #2563eb; }
        .details { margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✈️ Flight Booking Confirmed</h1>
            <p>Your flight has been successfully booked!</p>
        </div>
        
        <div class="content">
            <h2>Hello ${booking.passengerName}!</h2>
            <p>Thank you for booking with FlightBooker. Your flight booking has been confirmed.</p>
            
            <div class="flight-info">
                <h3>Flight Details</h3>
                <div class="route">
                    <div class="city">
                        <div class="city-code">${flightDetails.from.code}</div>
                        <div class="city-name">${flightDetails.from.city}</div>
                        <div>${flightDetails.departure.time}</div>
                    </div>
                    <div class="arrow">✈️</div>
                    <div class="city">
                        <div class="city-code">${flightDetails.to.code}</div>
                        <div class="city-name">${flightDetails.to.city}</div>
                        <div>${flightDetails.arrival.time}</div>
                    </div>
                </div>
                
                <div class="details">
                    <div class="detail-row">
                        <span><strong>Booking Reference:</strong></span>
                        <span>${booking.bookingReference}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Confirmation Number:</strong></span>
                        <span>${booking.confirmationNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Flight Number:</strong></span>
                        <span>${flightDetails.flightNumber}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Airline:</strong></span>
                        <span>${flightDetails.airline}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Flight Date:</strong></span>
                        <span>${formatDate(flightDetails.departure.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Class:</strong></span>
                        <span style="text-transform: capitalize;">${flightDetails.class}</span>
                    </div>
                    <div class="detail-row">
                        <span><strong>Total Paid:</strong></span>
                        <span><strong>${formatPrice(booking.price.total, booking.price.currency)}</strong></span>
                    </div>
                </div>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4>📋 What's Next?</h4>
                <ul>
                    <li>Check-in online 24 hours before departure</li>
                    <li>Arrive at the airport 2 hours early for domestic flights</li>
                    <li>Have your ID and this confirmation ready</li>
                    <li>Check baggage allowance with the airline</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at support@flightbooker.com</p>
            <p>&copy; 2024 FlightBooker. Safe travels!</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate booking confirmation plain text email
  private static generateBookingConfirmationText(booking: BookingDetails): string {
    const { flightDetails } = booking;
    const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US');
    const formatPrice = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    };

    return `
FLIGHT BOOKING CONFIRMATION

Hello ${booking.passengerName}!

Your flight booking has been confirmed. Here are your flight details:

FLIGHT DETAILS:
Route: ${flightDetails.from.code} (${flightDetails.from.city}) → ${flightDetails.to.code} (${flightDetails.to.city})
Date: ${formatDate(flightDetails.departure.date)}
Departure: ${flightDetails.departure.time}
Arrival: ${flightDetails.arrival.time}
Duration: ${flightDetails.duration}

BOOKING INFORMATION:
Booking Reference: ${booking.bookingReference}
Confirmation Number: ${booking.confirmationNumber}
Flight Number: ${flightDetails.flightNumber}
Airline: ${flightDetails.airline}
Class: ${flightDetails.class}
Total Paid: ${formatPrice(booking.price.total, booking.price.currency)}

WHAT'S NEXT:
- Check-in online 24 hours before departure
- Arrive at the airport 2 hours early for domestic flights
- Have your ID and this confirmation ready
- Check baggage allowance with the airline

Need help? Contact us at support@flightbooker.com

Safe travels!
FlightBooker Team
    `.trim();
  }

  // Generate cancellation HTML email
  private static generateCancellationHTML(booking: BookingDetails): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Flight Booking Cancelled</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Flight Booking Cancelled</h1>
        </div>
        <div class="content">
            <h2>Hello ${booking.passengerName},</h2>
            <p>Your flight booking <strong>${booking.bookingReference}</strong> has been cancelled as requested.</p>
            <p>If a refund is applicable, it will be processed within 5-7 business days.</p>
            <p>Thank you for using FlightBooker.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Generate cancellation plain text email
  private static generateCancellationText(booking: BookingDetails): string {
    return `
FLIGHT BOOKING CANCELLED

Hello ${booking.passengerName},

Your flight booking ${booking.bookingReference} has been cancelled as requested.

If a refund is applicable, it will be processed within 5-7 business days.

Thank you for using FlightBooker.

Need help? Contact us at support@flightbooker.com
    `.trim();
  }
}

export default EmailService;