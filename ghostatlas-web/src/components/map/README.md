# Map Components

This directory contains all map-related components for the GhostAtlas Web Application.

## Components

### HauntedMap
The main map component that integrates Google Maps with custom styling and functionality.

**Features:**
- Dark horror-themed map styling
- Custom ghost markers with green glow
- Marker clustering for performance (>50 markers)
- Google Places search box
- Info windows with encounter previews
- Hotspot detection and animation
- Responsive design

**Usage:**
```tsx
import { HauntedMap } from '@/components/map';

<HauntedMap
  encounters={encounters}
  center={{ lat: 37.7749, lng: -122.4194 }}
  zoom={12}
  onMarkerClick={(encounter) => console.log(encounter)}
  className="h-[600px]"
/>
```

**Props:**
- `encounters: Encounter[]` - Array of encounters to display
- `onMarkerClick?: (encounter: Encounter) => void` - Callback when marker is clicked
- `center?: { lat: number; lng: number }` - Map center (default: San Francisco)
- `zoom?: number` - Initial zoom level (default: 10)
- `className?: string` - Additional CSS classes

### MapMarker
Custom marker component with ghost icon and animations.

**Features:**
- Custom SVG ghost icon
- Green glow effect
- Pulsing animation for hotspots
- Click handling

**Usage:**
```tsx
import { MapMarker } from '@/components/map';

<MapMarker
  encounter={encounter}
  isHotspot={true}
  onClick={(encounter) => console.log(encounter)}
/>
```

**Props:**
- `encounter: Encounter` - The encounter to display
- `isHotspot?: boolean` - Whether this is a hotspot location
- `onClick?: (encounter: Encounter) => void` - Click handler
- `clusterer?: any` - Clusterer instance for clustering

### MapInfoWindow
Info window component that displays encounter preview.

**Features:**
- Horror-themed styling
- Encounter preview with story excerpt
- Rating and verification display
- Link to full detail page

**Usage:**
```tsx
import { MapInfoWindow } from '@/components/map';

<MapInfoWindow
  encounter={encounter}
  onClose={() => setSelectedEncounter(null)}
/>
```

**Props:**
- `encounter: Encounter` - The encounter to display
- `onClose: () => void` - Callback when info window is closed

## Setup

### Environment Variables
Add your Google Maps API key to `.env`:
```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Google Maps API Requirements
Enable the following APIs in Google Cloud Console:
- Maps JavaScript API
- Places API

## Styling

All components use the GhostAtlas horror theme:
- **Background:** #000000 or #0A0A0A
- **Accent:** #00FF41 (eerie green)
- **Text:** #E0E0E0 or #FFFFFF
- **Effects:** Green glow using `text-glow` class

## Performance

### Marker Clustering
- Automatically enabled when >50 markers
- Uses `@react-google-maps/api` MarkerClusterer
- Custom cluster styling with green theme

### Optimization Tips
1. Limit encounters to viewport area
2. Use pagination for large datasets
3. Implement virtual scrolling for marker lists
4. Cache map tiles with Service Worker

## Testing

### Manual Testing
1. Verify map loads with dark theme
2. Check markers display at correct locations
3. Test marker click opens info window
4. Verify search box finds locations
5. Test clustering with >50 markers
6. Check hotspot animations
7. Test on mobile/tablet/desktop

### Demo Component
Use `MapDemo.tsx` for visual testing:
```tsx
import { MapDemo } from '@/components/map/MapDemo';

<MapDemo />
```

## Troubleshooting

### Map Not Loading
- Check `VITE_GOOGLE_MAPS_API_KEY` is set
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors
- Ensure billing is enabled in Google Cloud

### Markers Not Displaying
- Verify encounters have valid latitude/longitude
- Check encounter status is 'approved'
- Ensure encounters array is not empty
- Check map zoom level is appropriate

### Search Not Working
- Verify Places API is enabled
- Check API key has Places API permissions
- Ensure search box is loaded before use

### Performance Issues
- Enable marker clustering for large datasets
- Reduce number of encounters loaded
- Implement viewport-based filtering
- Use pagination or infinite scroll

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

- Keyboard navigation supported
- ARIA labels on interactive elements
- Screen reader compatible
- Focus indicators visible

## Future Enhancements

- [ ] Custom cluster icons with ghost theme
- [ ] Heatmap layer for encounter density
- [ ] Filter controls in map UI
- [ ] Drawing tools for area selection
- [ ] Street View integration
- [ ] Real-time updates via WebSocket
- [ ] Offline map caching

## Related Files

- `src/pages/MapPage.tsx` - Full map page implementation
- `src/hooks/useEncounters.ts` - Data fetching hook
- `src/types/api.ts` - TypeScript interfaces
- `src/utils/config.ts` - Configuration utilities
