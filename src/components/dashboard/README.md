# Dashboard Components Documentation

This directory contains all the components used in the enhanced user dashboard.

## Components Overview

### 1. TravelStatsWidgets

**File**: `TravelStatsWidgets.tsx`

Displays comprehensive travel statistics in a grid layout with visual cards.

**Props**:
```typescript
interface TravelStatsWidgetsProps {
  stats: TravelStats;
  growth?: {
    bookingGrowth: number;
    spendingGrowth: number;
  };
}
```

**Features**:
- Total flights with breakdown (upcoming/completed)
- Destinations visited (cities & countries)
- Total spending with YoY growth indicator
- Carbon footprint calculation
- Average flight cost
- Favorite destination highlight with most-used airline

**Usage**:
```tsx
import TravelStatsWidgets from '@/components/dashboard/TravelStatsWidgets';

<TravelStatsWidgets 
  stats={travelStats}
  growth={{ bookingGrowth: 15, spendingGrowth: 8 }}
/>
```

---

### 2. SpendingChart

**File**: `SpendingChart.tsx`

Interactive line chart showing monthly spending trends using Recharts library.

**Props**:
```typescript
interface SpendingChartProps {
  monthlySpending: Array<{
    month: string;
    amount: number;
    bookings: number;
  }>;
}
```

**Features**:
- Dual-axis line chart (spending & bookings count)
- Interactive tooltips with formatted values
- Responsive design (adapts to container width)
- Color-coded lines (blue for spending, green for bookings)
- Month/year labels on X-axis

**Usage**:
```tsx
import SpendingChart from '@/components/dashboard/SpendingChart';

<SpendingChart monthlySpending={travelStats.monthlySpending} />
```

---

### 3. BookingTimeline

**File**: `BookingTimeline.tsx`

Displays recent bookings in a timeline format with status indicators.

**Props**:
```typescript
interface BookingTimelineProps {
  bookings: Booking[];
  title?: string;
  emptyMessage?: string;
}

interface Booking {
  id: string;
  bookingReference: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  flightData: {
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    airline?: string;
    flightNumber?: string;
  };
}
```

**Features**:
- Status badges with color coding (confirmed, pending, cancelled, completed)
- Flight route visualization with icons
- Airline and flight number display
- Booking reference and date
- Total amount
- Link to detailed booking view
- Empty state with custom message
- "View all" link to bookings page

**Status Colors**:
- Confirmed: Green
- Pending: Yellow
- Cancelled: Red
- Completed: Blue

**Usage**:
```tsx
import BookingTimeline from '@/components/dashboard/BookingTimeline';

<BookingTimeline 
  bookings={recentBookings}
  title="Recent Bookings"
  emptyMessage="No bookings yet. Start exploring flights!"
/>
```

---

### 4. QuickActions

**File**: `QuickActions.tsx`

Grid of action buttons for common tasks.

**Props**: None (stateless component)

**Features**:
- 4 quick action buttons in 2x2 grid:
  - Search Flights
  - My Bookings
  - View Reports
  - Profile Settings
- Color-coded buttons with icons
- Hover effects
- Responsive grid layout

**Usage**:
```tsx
import QuickActions from '@/components/dashboard/QuickActions';

<QuickActions />
```

**Customization**:
To add/modify actions, edit the `actions` array in the component:
```typescript
const actions = [
  {
    icon: Search,
    label: 'Search Flights',
    href: '/search',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  // Add more actions...
];
```

---

## Dependencies

All dashboard components require:
- `lucide-react` - Icon library
- `recharts` - Charting library (for SpendingChart)
- `next/link` - Next.js navigation

## API Integration

### Travel Stats API

**Endpoint**: `/api/stats/travel`

**Method**: GET

**Authentication**: Required (Bearer token)

**Response**:
```typescript
{
  stats: TravelStats;
  monthlySpending: MonthlySpending[];
  topDestinations: TopDestination[];
  growth: GrowthMetrics;
}
```

### Bookings API

**Endpoint**: `/api/bookings?limit=5`

**Method**: GET

**Authentication**: Required (Bearer token)

**Response**:
```typescript
{
  bookings: Booking[];
}
```

### Booking History API

**Endpoint**: `/api/bookings/history`

**Method**: GET

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `status` (string): Filter by booking status
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort direction (asc/desc)
- `startDate` (string): Filter by date range start
- `endDate` (string): Filter by date range end

**Response**:
```typescript
{
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

---

## Styling

All components use Tailwind CSS utility classes for styling:
- Responsive breakpoints: `sm:`, `md:`, `lg:`
- Color scheme: Blue primary, with semantic colors for status
- Shadows: `shadow-md` for cards
- Hover effects: `hover:shadow-lg`, `hover:bg-*`
- Transitions: `transition-colors`, `transition-shadow`

---

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators while fetching data
3. **Empty States**: Provide meaningful empty state messages
4. **Accessibility**: All interactive elements are keyboard accessible
5. **Performance**: Components use client-side rendering (`'use client'`)
6. **Type Safety**: All components use TypeScript with proper interfaces

---

## Testing

### Unit Testing
```bash
# Test individual components
npm test -- TravelStatsWidgets
npm test -- SpendingChart
npm test -- BookingTimeline
```

### Integration Testing
```bash
# Test dashboard page with all components
npm test -- dashboard/page
```

### Visual Testing
1. Open dashboard in browser: `http://localhost:3000/dashboard`
2. Check responsive design at different breakpoints
3. Verify hover states and interactions
4. Test with different data scenarios (empty, partial, full)

---

## Troubleshooting

### Charts not rendering
- Ensure `recharts` is installed: `npm install recharts`
- Check that `monthlySpending` data has valid format
- Verify component is client-side (`'use client'`)

### API data not loading
- Check authentication token is valid
- Verify API endpoints are accessible
- Check browser console for errors
- Ensure CORS is configured if using different domain

### Styling issues
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`
- Check Tailwind configuration includes dashboard components

---

## Future Enhancements

- [ ] Add destination map visualization
- [ ] Implement flight frequency graph
- [ ] Add export functionality (PDF/CSV)
- [ ] Create comparison views (month-over-month, year-over-year)
- [ ] Add filtering and sorting to timeline
- [ ] Implement real-time updates via WebSocket
- [ ] Add data refresh button
- [ ] Create customizable dashboard layouts

---

## Contributing

When adding new dashboard components:
1. Create component in `src/components/dashboard/`
2. Add proper TypeScript interfaces
3. Include error handling and loading states
4. Update this README with component documentation
5. Add unit tests
6. Test responsive design
7. Update `dashboard/page.tsx` to include new component
