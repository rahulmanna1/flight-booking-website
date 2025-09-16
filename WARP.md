# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack (fast refresh enabled)
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

### Testing & Quality
- `npx tsc --noEmit` - Type check TypeScript without emitting files
- `npm run lint -- --fix` - Auto-fix linting issues where possible
- `npm run lint -- src/components/forms/` - Lint specific directory
- `npx tsc --project tsconfig.json --noEmit` - Run TypeScript compiler with full checking

### Development Workflow
- `git checkout -b feature/name` - Create a new feature branch
- `npm run dev -- --port 3001` - Run dev server on alternate port
- `npm run build && npm start` - Test production build locally

## Architecture Overview

This is a **Next.js 15** flight booking application using the **App Router** pattern with TypeScript and Tailwind CSS.

### Project Structure
- **`src/app/`** - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with Geist fonts and global styles
  - `page.tsx` - Homepage with hero section, search form, and features
  - `search/page.tsx` - Dedicated search page with flight results
  - `booking/[id]/page.tsx` - Individual booking detail/checkout page
  - `bookings/page.tsx` - User bookings management page
  - `support/page.tsx` - Customer support and help page
  - `login/page.tsx` - User authentication page
  - `register/page.tsx` - User registration page
  - `help/page.tsx` - Comprehensive help center with FAQs
  - `contact/page.tsx` - Contact form and information page
  - `terms/page.tsx` - Terms and conditions page
  - `privacy/page.tsx` - Privacy policy page
- **`src/components/`** - Reusable React components organized by category:
  - `forms/` - Form components (SearchForm, BookingForm)
  - `ui/` - UI components (Header, CurrencySelector)
  - `cards/` - Display components (FlightCard)
  - `FlightResults.tsx` - Flight search results with filtering
- **`src/contexts/`** - React context providers
  - `CurrencyContext.tsx` - Global currency management

### Key Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Styling**: Tailwind CSS 4.0 (latest)
- **Type Safety**: TypeScript 5 with strict mode
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Icons**: Lucide React
- **Date Handling**: date-fns

### Component Architecture
The application follows a modular component structure:

1. **Forms** use React Hook Form with Zod schemas for validation
2. **UI Components** are built with Tailwind CSS and Lucide icons
3. **Cards** display structured data (flights) with consistent styling
4. **TypeScript interfaces** define strict data contracts

### Data Flow Architecture
1. User inputs search criteria in `SearchForm` component
2. Form data is validated with Zod schemas
3. Search data is passed to parent components via callbacks
4. Mock flight data is generated in `FlightResults.tsx`
5. Results are displayed using `FlightCard` components
6. User selects a flight and proceeds to booking
7. Booking form collects passenger information
8. Booking confirmation is simulated with timeout

### State Management
- Forms use React Hook Form for controlled inputs
- Local component state with useState for UI interactions
- Context API for global state (currently only currency)
- No Redux or other global state libraries implemented

### Styling Patterns
- Utility-first approach with Tailwind CSS
- Consistent color scheme: blue-600 primary, gray scale for text
- Responsive design with mobile-first breakpoints
- Custom CSS variables for Geist fonts

## Development Notes

### Path Aliases
- `@/*` maps to `src/*` for cleaner imports

### Form Validation
All forms use Zod schemas for runtime validation with TypeScript inference. Form schemas are co-located with their components.

### Component Props
Components use TypeScript interfaces for strict typing. Props follow naming conventions with clear, descriptive names.

### Next.js Features Used
- App Router for file-based routing
- Server and Client Components (marked with 'use client')
- next/font for optimized font loading
- Built-in CSS support with PostCSS

## Code Patterns

### Form Components
```typescript
// Standard pattern for form components
const schema = z.object({ /* validation rules */ });
type FormData = z.infer<typeof schema>;

export default function FormComponent() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  // Form JSX with consistent styling
}
```

### Icon Usage
All icons use Lucide React with consistent sizing (w-4 h-4 for inline, w-5 h-5 for buttons).

### Responsive Design
Components use Tailwind responsive prefixes (md:, lg:) for desktop-first responsive behavior.

### Data Handling Pattern
```typescript path=null start=null
// Component with data handling pattern
export default function ComponentWithData({ initialData }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  const handleAction = async () => {
    setLoading(true);
    try {
      // Process data
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  // Component JSX
}
```

## Troubleshooting

### Common Issues
- If Turbopack fails, try running with standard webpack: `npm run dev -- --no-turbo`
- TypeScript errors often require running `npx tsc --noEmit` for full details
- For styling issues, check both the Tailwind classes and the global CSS file

### Performance Optimization
- React components use appropriate memoization techniques
- Images should use Next.js Image component for optimization
- Forms implement proper validation and error handling
