# ♿ Accessibility Guide

## Overview

This guide documents accessibility best practices and implementation standards for the Flight Booking Website.

## WCAG 2.1 AA Compliance Goals

### Key Principles
1. **Perceivable** - Information and UI components must be presentable to users
2. **Operable** - UI components and navigation must be operable
3. **Understandable** - Information and UI operation must be understandable
4. **Robust** - Content must be robust enough for assistive technologies

## Implementation Standards

### 1. ARIA Labels & Roles

#### Buttons
```tsx
// Always include aria-label for icon-only buttons
<button aria-label="Close modal" onClick={onClose}>
  <X className="w-4 h-4" />
</button>

// Describe action, not icon
<button aria-label="Search flights" className="...">
  <Search className="w-5 h-5" />
</button>
```

#### Form Inputs
```tsx
// Always associate labels with inputs
<label htmlFor="email" className="...">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!errors.email}
  aria-describedby="email-error"
/>
{errors.email && (
  <span id="email-error" role="alert" className="...">
    {errors.email}
  </span>
)}
```

#### Select/Dropdown
```tsx
<select
  id="cabin-class"
  aria-label="Select cabin class"
  value={cabinClass}
  onChange={handleChange}
>
  <option value="">Choose cabin class</option>
  <option value="economy">Economy</option>
</select>
```

### 2. Touch Targets (Mobile)

#### Minimum Size Requirements
- **iOS Standard**: 44x44 pixels minimum
- **Android Standard**: 48x48 dp minimum
- **Recommended**: 48x48 pixels for consistency

#### Implementation
```tsx
// Bad - Too small for touch
<button className="h-8 px-2">Click</button>

// Good - Meets minimum standard
<button className="min-h-[44px] px-4">Click</button>

// Better - With adequate spacing
<button className="h-12 px-6 my-2">Click</button>
```

### 3. Keyboard Navigation

#### Tab Order
- Ensure logical tab order follows visual layout
- Use `tabIndex={0}` for custom interactive elements
- Use `tabIndex={-1}` to exclude from tab order temporarily

#### Focus Management
```tsx
// Visible focus indicators
.focus-visible:focus {
  @apply ring-2 ring-blue-500 ring-offset-2 outline-none;
}

// Trap focus in modals
const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  // Focus management logic
};
```

#### Keyboard Shortcuts
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape to close modals
    if (e.key === 'Escape') closeModal();
    
    // Enter to submit forms
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      handleSubmit();
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### 4. Color Contrast

#### WCAG AA Requirements
- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+): 3:1 contrast ratio
- **UI components**: 3:1 contrast ratio

#### Color Palette Contrast Ratios
```css
/* Primary colors */
--blue-500: #3B82F6; /* 3.2:1 on white (AA for large text) */
--blue-600: #2563EB; /* 4.5:1 on white (AA for normal text) */

/* Text colors */
--gray-900: #111827; /* 16.5:1 on white (AAA) */
--gray-700: #374151; /* 10.7:1 on white (AAA) */
--gray-600: #4B5563; /* 7.5:1 on white (AA) */
```

### 5. Screen Reader Support

#### Landmark Regions
```tsx
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    {/* Navigation items */}
  </nav>
</header>

<main role="main">
  {/* Main content */}
</main>

<footer role="contentinfo">
  {/* Footer content */}
</footer>
```

#### Live Regions
```tsx
// Announce dynamic content changes
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// For urgent announcements
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {errorMessage}
</div>
```

#### Skip Links
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
>
  Skip to main content
</a>
```

### 6. Forms & Validation

#### Error Handling
```tsx
<form aria-labelledby="form-title" noValidate>
  <h2 id="form-title">Search Flights</h2>
  
  {/* Form-level errors */}
  {formError && (
    <div role="alert" className="..." aria-live="assertive">
      {formError}
    </div>
  )}
  
  {/* Field-level errors */}
  <div>
    <label htmlFor="departure">Departure City</label>
    <input
      id="departure"
      aria-required="true"
      aria-invalid={!!errors.departure}
      aria-describedby={errors.departure ? 'departure-error' : undefined}
    />
    {errors.departure && (
      <span id="departure-error" role="alert">
        {errors.departure}
      </span>
    )}
  </div>
</form>
```

#### Required Fields
```tsx
// Visual and programmatic indicators
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
/>
```

### 7. Modal Dialogs

#### Implementation
```tsx
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      const previouslyFocused = document.activeElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
        // Restore focus
        (previouslyFocused as HTMLElement)?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
      tabIndex={-1}
    >
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose} aria-label="Close modal">
          Close
        </button>
      </div>
    </div>
  );
};
```

### 8. Images & Icons

#### Alt Text
```tsx
// Decorative images
<img src="pattern.svg" alt="" role="presentation" />

// Informative images
<img src="flight.jpg" alt="Airplane taking off at sunset" />

// Icons with text
<button>
  <Search aria-hidden="true" />
  <span>Search</span>
</button>

// Icon-only buttons
<button aria-label="Close">
  <X aria-hidden="true" />
</button>
```

### 9. Component Checklist

#### Buttons
- [ ] Minimum 44x44px touch target
- [ ] Clear focus indicator
- [ ] Descriptive text or aria-label
- [ ] Disabled state is indicated programmatically
- [ ] Loading state announced to screen readers

#### Forms
- [ ] All inputs have associated labels
- [ ] Required fields indicated programmatically
- [ ] Error messages associated with fields
- [ ] Form submission errors announced
- [ ] Autocomplete attributes where appropriate

#### Navigation
- [ ] Landmark regions defined
- [ ] Skip links provided
- [ ] Current page indicated in navigation
- [ ] Keyboard accessible
- [ ] Mobile menu accessible

#### Modals
- [ ] Focus trapped within modal
- [ ] ESC key closes modal
- [ ] Focus restored on close
- [ ] Announced to screen readers
- [ ] Background content inert

#### Tables
- [ ] Caption or aria-label
- [ ] Column headers marked with `<th scope="col">`
- [ ] Row headers marked with `<th scope="row">`
- [ ] Complex tables use aria-describedby

## Testing Tools

### Automated Testing
```bash
# Install dependencies
npm install -D @axe-core/react eslint-plugin-jsx-a11y

# Run accessibility tests
npm run test:a11y
```

### Manual Testing
1. **Keyboard Navigation**: Tab through entire page
2. **Screen Reader**: Test with NVDA (Windows) or VoiceOver (Mac)
3. **Zoom**: Test at 200% zoom level
4. **Color Blindness**: Use browser extensions to simulate
5. **Mobile**: Test touch targets and gestures

### Browser Extensions
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Visual accessibility evaluation
- **Lighthouse**: Includes accessibility audit
- **Color Contrast Analyzer**: Check contrast ratios

## Common Issues & Fixes

### Issue: Missing ARIA Label
```tsx
// Before
<button onClick={handleDelete}>
  <Trash2 />
</button>

// After
<button onClick={handleDelete} aria-label="Delete item">
  <Trash2 aria-hidden="true" />
</button>
```

### Issue: Insufficient Touch Target
```tsx
// Before
<button className="h-8 px-2">Click</button>

// After
<button className="min-h-[44px] px-4 py-2">Click</button>
```

### Issue: Form Without Labels
```tsx
// Before
<input type="email" placeholder="Email" />

// After
<label htmlFor="email" className="sr-only">Email</label>
<input id="email" type="email" placeholder="Email" />
```

### Issue: Non-Semantic Buttons
```tsx
// Before
<div onClick={handleClick}>Click me</div>

// After
<button onClick={handleClick}>Click me</button>
```

## Priority Implementation Plan

### Phase 1 - Critical (High Impact)
1. Add ARIA labels to all icon-only buttons
2. Fix touch target sizes (min 44px)
3. Associate all form labels with inputs
4. Add focus indicators to all interactive elements

### Phase 2 - Important (Medium Impact)
5. Implement keyboard navigation for custom components
6. Add skip links
7. Fix color contrast issues
8. Add screen reader announcements for dynamic content

### Phase 3 - Enhancement (Nice to Have)
9. Add keyboard shortcuts
10. Implement focus management in SPAs
11. Add accessibility settings panel
12. Create high contrast theme

---

**Last Updated**: 2025-01-24
**Status**: Implementation Guide - Ready for Adoption
