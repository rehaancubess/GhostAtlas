# GhostAtlas Quick Reference

## API Configuration

### Base URLs
```
Development: https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api
Production: TBD
```

### Environment Variables
```bash
# .env.local
VITE_API_BASE_URL=https://your-api-url.com/api
VITE_GOOGLE_MAPS_API_KEY=your-key-here
```

## Color Palette

### Primary Colors
```css
--color-ghost-green: #00FF41    /* Neon green - primary */
--color-ghost-red: #FF0040      /* Neon red - accent */
--color-ghost-black: #000000    /* Background */
--color-ghost-gray: #E0E0E0     /* Text */
```

### Tailwind Classes
```tsx
text-ghost-green    bg-ghost-green    border-ghost-green
text-ghost-red      bg-ghost-red      border-ghost-red
text-ghost-gray     bg-ghost-black    border-ghost-gray
```

## Glow Effects

### Green Glow
```tsx
className="text-glow"           // Small text glow
className="text-glow-lg"        // Large text glow
className="shadow-green-glow"   // Box glow
className="shadow-green-glow-lg" // Large box glow
```

### Red Glow
```tsx
className="text-glow-red"       // Small red text glow
className="text-glow-red-lg"    // Large red text glow
className="shadow-red-glow"     // Red box glow
className="shadow-red-glow-lg"  // Large red box glow
```

## Button Variants

```tsx
<Button variant="primary">Green Button</Button>
<Button variant="secondary">Outlined Green</Button>
<Button variant="ghost">Transparent Green</Button>
<Button variant="danger">Standard Red</Button>
<Button variant="neon-red">Neon Red</Button>
```

## Common Patterns

### Card with Hover Effect
```tsx
<div className="
  bg-ghost-near-black
  border-2 border-ghost-green/30
  hover:border-ghost-red
  hover:shadow-red-glow-lg
  hover:scale-[1.03]
  transition-all duration-300
  rounded-lg p-6
">
  Content
</div>
```

### Heading with Red Accent
```tsx
<h1 className="font-creepster text-4xl text-ghost-green text-glow">
  Ghost<span className="text-ghost-red shadow-red-glow-lg">Atlas</span>
</h1>
```

### Text with Keyword Highlight
```tsx
<p className="text-ghost-gray">
  Have you experienced something{' '}
  <span className="text-ghost-red font-semibold">paranormal</span>?
</p>
```

### Animated Glow
```tsx
<div className="animate-glow-pulse">Green Pulse</div>
<div className="animate-glow-pulse-red">Red Pulse</div>
```

## Typography

### Font Families
```tsx
className="font-creepster"  // Spooky display font
className="font-sans"       // Inter (body text)
```

### Sizes
```tsx
text-xs   text-sm   text-base   text-lg   text-xl
text-2xl  text-3xl  text-4xl    text-5xl
```

## Animations

```tsx
animate-fade-in         // Fade in
animate-slide-up        // Slide up
animate-glow-pulse      // Green glow pulse
animate-glow-pulse-red  // Red glow pulse
```

## API Hooks

### Get Encounters
```tsx
const { data, isLoading, error } = useEncounters({
  latitude: 13.081084,
  longitude: 77.559572,
  radius: 50,
  limit: 100
});
```

### Get Single Encounter
```tsx
const { data, isLoading } = useEncounter(encounterId);
```

### Submit Encounter
```tsx
const { mutate, isLoading } = useSubmitEncounter();
mutate({
  authorName: "John Doe",
  location: { latitude: 13.08, longitude: 77.56 },
  originalStory: "I saw a ghost...",
  encounterTime: new Date().toISOString(),
  imageCount: 0
});
```

### Rate Encounter
```tsx
const { mutate } = useRateEncounter(encounterId);
mutate({ deviceId: "device-123", rating: 5 });
```

## Responsive Design

### Breakpoints
```tsx
sm:   640px   // Small devices
md:   768px   // Medium devices
lg:   1024px  // Large devices
xl:   1280px  // Extra large
2xl:  1536px  // 2X large
```

### Common Patterns
```tsx
// Mobile first
className="text-base sm:text-lg md:text-xl"
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Layout Components

### Page Layout
```tsx
import { PageLayout } from '@/components/layout';

<PageLayout>
  <YourContent />
</PageLayout>
```

### Navigation
```tsx
import { NavigationBar } from '@/components/layout';

<NavigationBar />
```

## Common Components

### Button
```tsx
import { Button } from '@/components/common';

<Button variant="primary" size="large" onClick={handleClick}>
  Click Me
</Button>
```

### Story Card
```tsx
import { StoryCard } from '@/components/stories';

<StoryCard encounter={encounter} />
```

### Modal
```tsx
import { Modal } from '@/components/common';

<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalContent />
</Modal>
```

## Testing

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Test API
```bash
./test-api.sh         # Test API endpoints
```

### Dev Server
```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

## Debugging

### Check API Calls
```tsx
// Enable in config.ts
if (import.meta.env.DEV) {
  console.log('[API Request]', config);
}
```

### Check Component Rendering
```tsx
// Use React DevTools
// Check console for errors
// Verify props with console.log
```

### Common Issues

**API not loading:**
- Check VITE_API_BASE_URL in .env
- Verify CORS is enabled
- Check network tab in DevTools

**Styles not applying:**
- Clear browser cache
- Rebuild: `npm run build`
- Check Tailwind config

**Animations not working:**
- Check for `prefers-reduced-motion`
- Verify CSS is loaded
- Check browser support

## Performance Tips

### Optimize Images
```tsx
<img loading="lazy" alt="..." />
```

### Memoize Components
```tsx
const MemoizedCard = React.memo(StoryCard);
```

### Lazy Load Routes
```tsx
const LazyPage = lazy(() => import('./Page'));
```

### Debounce Search
```tsx
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
);
```

## Accessibility

### Keyboard Navigation
```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

### Screen Reader Text
```tsx
<span className="sr-only">Hidden text for screen readers</span>
```

### ARIA Labels
```tsx
<button aria-label="Close modal">×</button>
```

## Git Workflow

```bash
git checkout -b feature/your-feature
git add .
git commit -m "feat: add feature"
git push origin feature/your-feature
```

## Deployment

```bash
npm run build         # Build for production
npm run preview       # Test production build
# Deploy dist/ folder to hosting
```

## Resources

- [Tailwind Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [React Router Docs](https://reactrouter.com)
- [AWS API Gateway](https://aws.amazon.com/api-gateway/)

## Support

- Check CloudWatch logs for API errors
- Review browser console for client errors
- Test with curl/Postman for API issues
- Use React DevTools for component debugging
