# FastVote Voting Page Implementation

## Overview

The voting page (`/vote/[uuid]`) provides a brutalist-modernist interface for participating in vote rooms and viewing real-time results.

## Design Philosophy

**Aesthetic Direction**: Brutalist-Modernist
- Raw, functional design with no decoration for decoration's sake
- Extreme typographic contrast (monospace data + bold sans headlines)
- Stark black/white foundation with electric cyan accents
- Hard-edged progress bars with snapping transitions
- Asymmetric layouts with generous white space

**Key Visual Elements**:
- Monospace labels for system-like data (vote counts, timestamps)
- Oversized bold headlines for room titles
- Binary color scheme (black/white swap in dark mode)
- Geometric form elements treated as architectural blocks
- Progress bars as solid rectangles with no rounded corners

## File Structure

```
frontend/
├── app/vote/[uuid]/page.tsx    # Main voting page component
├── lib/
│   ├── api.ts                   # API client with type-safe endpoints
│   └── fingerprint.ts           # Device fingerprinting for vote tracking
└── .env.local.example           # Environment configuration template
```

## Features Implemented

### 1. Dynamic Routing
- Uses Next.js 16 App Router with `[uuid]` dynamic segment
- Client-side component with `use(params)` for accessing route params

### 2. Room Loading
- Fetches room details via `GET /rooms/{uuid}` on mount
- Handles 404 errors with branded error page
- Shows loading state with minimal "LOADING_ROOM" indicator

### 3. Password Protection
- Detects `has_password: true` from room data
- Renders password input form before voting interface
- Verifies via `POST /rooms/{uuid}/verify`
- Displays validation errors inline

### 4. Voting Interface
- Radio button-style option selection
- Large, clickable card-based UI
- Visual feedback on hover and selection (full card inversion)
- Submit button disabled until option selected
- Submits via `POST /rooms/{uuid}/vote` with fingerprint

### 5. Duplicate Vote Handling
- Catches 409 Conflict status from API
- Transitions to "voted" state
- Shows "VOTE_SUBMITTED" confirmation
- Still displays live results

### 6. Real-Time Results
- WebSocket connection to `/ws/rooms/{uuid}`
- Parses JSON messages for vote updates
- Updates result counts and percentages immediately
- Progress bars animate width changes (300ms transition)
- Auto-reconnects after connection loss (3s delay)

### 7. Results Visualization
- Horizontal progress bars with vote counts
- Percentage calculations displayed
- Total vote count in header
- Brutalist aesthetic: solid rectangles, no curves
- Dark mode inverts colors (black ↔ white)

### 8. Link Sharing
- "COPY_LINK" button in header
- Copies current URL to clipboard
- Shows "COPIED!" confirmation for 2 seconds

### 9. Device Fingerprinting
- Generates UUID on first visit
- Persists in localStorage as `fastvote_fingerprint`
- Reused for vote tracking across sessions

## API Integration

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000  # Backend API URL
```

### Endpoints Used
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/rooms/{uuid}` | GET | Fetch room details |
| `/rooms/{uuid}/verify` | POST | Verify room password |
| `/rooms/{uuid}/vote` | POST | Submit vote |
| `/rooms/{uuid}/results` | GET | Get current results |
| `/ws/rooms/{uuid}` | WebSocket | Real-time result updates |

### Error Handling
- 404: Room not found
- 401: Incorrect password
- 409: Already voted
- Network errors: Generic failure messages
- WebSocket reconnection on disconnect

## Component States

The page manages five view states:

1. **loading**: Initial fetch in progress
2. **password**: Room is protected, awaiting password
3. **voting**: Active voting interface
4. **voted**: Post-vote confirmation with results
5. **error**: Fatal error (room not found, etc.)

## Type Safety

All API responses and requests use TypeScript interfaces:

```typescript
interface VoteRoom {
  uuid: string;
  title: string;
  options: string[];
  has_password: boolean;
  created_at: string;
}

interface VoteResults {
  room_uuid: string;
  results: Record<string, number>;
  total_votes: number;
}
```

## Dark Mode Support

Uses Tailwind's `dark:` variant for automatic dark mode:
- Detects system preference via `prefers-color-scheme`
- Full color inversion (bg/text/border)
- Maintains contrast ratios for accessibility
- Cyan accent remains consistent across modes

## Responsive Design

Mobile-first approach:
- Full-width cards on mobile
- Larger text sizes on desktop (`text-5xl` → `text-6xl`)
- Flexible padding (`py-12` → `md:py-20`)
- Touch-friendly button sizes (min 44px height)

## Accessibility

- Semantic HTML (forms, labels, buttons)
- Screen reader text for radio inputs (`.sr-only`)
- Keyboard navigation support
- Focus rings on inputs (`focus:ring-2`)
- High contrast text ratios
- Disabled state styling

## Performance Optimizations

- Server-side rendering disabled (client component needed for WebSocket)
- Lazy result loading (only after password verification)
- WebSocket message parsing in try-catch
- Reconnection logic prevents memory leaks
- Progress bar CSS transitions (GPU-accelerated)

## Browser Compatibility

- Modern browsers (Chrome 90+, Firefox 88+, Safari 15+)
- Requires WebSocket support
- Requires Clipboard API for link sharing
- localStorage for fingerprinting

## Testing Checklist

- [ ] Room loads without password
- [ ] Room loads with password
- [ ] Password verification succeeds
- [ ] Password verification fails
- [ ] Vote submission succeeds
- [ ] Duplicate vote handled (409)
- [ ] Real-time results update
- [ ] WebSocket reconnects on disconnect
- [ ] Link copy works
- [ ] Dark mode toggles correctly
- [ ] Mobile responsive layout
- [ ] 404 error page shows for invalid UUID

## Future Enhancements

Potential improvements:
- Vote result charts (pie/bar)
- Voter geolocation display
- Room expiration countdown
- Share to social media buttons
- QR code generation
- Vote history (if authenticated)
- Results export (CSV/PDF)
- Anonymous comments on votes
