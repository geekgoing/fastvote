# FastVote Design System

## Aesthetic Direction

**Brutalist-Modernist Interface**

A voting experience that breaks from generic SaaS patterns. Inspired by Swiss design, brutalist architecture, and terminal interfaces. Every element serves function while making a visual statement.

## Core Principles

1. **Functional Honesty**
   - No fake depth (shadows, gradients, blur)
   - Elements are what they appear to be
   - Information architecture is visible

2. **Typographic Hierarchy**
   - Monospace for system data (IDs, counts, labels)
   - Bold sans for user-facing content (titles, options)
   - Extreme weight contrast (thin data vs. black headlines)

3. **Binary Color Palette**
   - Black/white foundation
   - No grays except for disabled states
   - Cyan accent only for success states
   - Full inversion in dark mode

4. **Architectural Forms**
   - Hard edges, no border-radius
   - Generous padding creates weight
   - White space as compositional element
   - Elements as solid blocks

## Color System

### Light Mode
```
Background:       #FFFFFF (white)
Foreground:       #000000 (black)
Borders:          #000000 (black)
Disabled:         #D4D4D4 (zinc-300)
Data Text:        #525252 (zinc-600)
Accent Success:   #06B6D4 (cyan-500)
Error:            #DC2626 (red-600)
```

### Dark Mode
```
Background:       #000000 (black)
Foreground:       #FFFFFF (white)
Borders:          #FFFFFF (white)
Disabled:         #404040 (zinc-700)
Data Text:        #A1A1AA (zinc-400)
Accent Success:   #22D3EE (cyan-400)
Error:            #F87171 (red-400)
```

## Typography

### Font Families
- **Geist Sans**: Headlines, body text, buttons (inherited from Next.js)
- **Geist Mono**: System labels, vote counts, timestamps

### Sizes
```
text-xs:    12px  (system labels)
text-sm:    14px  (buttons, data)
text-lg:    18px  (option text)
text-4xl:   36px  (error headings)
text-5xl:   48px  (room title mobile)
text-6xl:   60px  (room title desktop)
```

### Weights
```
font-bold:    700  (option text)
font-black:   900  (room title)
font-mono:    400  (all monospace)
```

## Component Patterns

### Button (Primary)
```css
bg-black dark:bg-white
text-white dark:text-black
font-mono text-sm
px-6 py-4
border-none
hover: bg-zinc-800 dark:bg-zinc-200
disabled: opacity-30
```

### Button (Secondary)
```css
bg-transparent
border-2 border-black dark:border-white
text-black dark:text-white
font-mono text-sm
px-6 py-3
hover: bg-black text-white dark:bg-white dark:text-black
```

### Input Field
```css
bg-transparent
border-2 border-black dark:border-white
px-4 py-3
font-mono text-sm
focus: ring-2 ring-cyan-500 dark:ring-cyan-400
```

### Radio Card (Option)
```css
border-2 p-6
default: border-zinc-300 dark:border-zinc-700
hover: border-black dark:border-white
selected: border-black bg-black dark:border-white dark:bg-white
  text-white dark:text-black
```

### Progress Bar
```css
container: h-3 bg-zinc-200 dark:bg-zinc-800
fill: bg-black dark:bg-white
transition: width 300ms linear (hard snap, no easing)
```

### System Label
```css
font-mono text-xs
text-black dark:text-white
uppercase (via content: ERROR, VOTE_ROOM, etc.)
```

## Layout Grid

### Container
```
max-w-3xl (768px)
mx-auto (centered)
px-4 (mobile gutter)
py-12 md:py-20 (vertical rhythm)
```

### Spacing Scale
```
gap-2:   8px   (progress bar label gap)
gap-3:   12px  (option card stack)
gap-4:   16px  (inline elements)
gap-6:   24px  (section spacing)
mb-8:    32px  (form to results)
mb-12:   48px  (major sections)
mb-16:   64px  (voting to results)
```

## Interaction States

### Hover
- Buttons: Subtle background darken (black → zinc-800)
- Cards: Border color change (zinc-300 → black)
- Links: Color shift to cyan accent

### Active/Selected
- Radio cards: Full inversion (background becomes black/white)
- Text inverts with background
- No partial states

### Focus
- 2px cyan ring around inputs
- Visible keyboard navigation
- No outline removal

### Disabled
- 30% opacity
- cursor-not-allowed
- No hover effects

### Loading
- Minimal text indicator ("LOADING_ROOM")
- No spinners or skeletons
- Instant state transitions

## Animation

### Progress Bars
```css
transition: width 300ms linear
```
Hard snap, no easing. Data visualization should be immediate and honest.

### State Changes
No transitions between view states (loading → voting → voted).
Instant DOM replacement maintains information density.

### Copy Confirmation
Text swap for 2 seconds ("COPY_LINK" → "COPIED!")
No toast notifications.

## Responsive Behavior

### Breakpoint: md (768px)

Mobile (< 768px):
- text-5xl titles
- py-12 vertical padding
- Full-width buttons
- Single column layout

Desktop (≥ 768px):
- text-6xl titles
- py-20 vertical padding
- Buttons stay full-width (intentional)
- Same single column (focus)

## Accessibility

### Keyboard Navigation
- Tab through options
- Space/Enter to select
- Form submission with Enter
- Focus visible on all interactive elements

### Screen Readers
- Radio inputs use sr-only class (visually hidden)
- Labels associated with inputs
- Error messages announced
- State changes announced

### Color Contrast
All text meets WCAG AA:
- Black on white: 21:1
- White on black: 21:1
- Zinc-600 on white: 4.7:1
- Zinc-400 on black: 5.8:1

### Touch Targets
- Minimum 44px height (buttons, options)
- Full-width cards on mobile
- Generous padding for thumb accuracy

## State Indicators

### System Messages
```
ERROR              (red, error state)
PROTECTED_ROOM     (black, password required)
PASSWORD_REQUIRED  (black, input label)
VOTE_ROOM          (black, active voting)
TOTAL_VOTES: N     (zinc-600, data)
VOTE_SUBMITTED     (cyan, success confirmation)
LIVE_RESULTS       (black, results section)
COPY_LINK          (black, interactive)
COPIED!            (black, confirmation)
```

All system text uses monospace and underscore_case for visual consistency.

## Mobile Considerations

- Touch-friendly 48px minimum button height
- No hover states on touch devices (relies on active states)
- Large tap targets for options
- Scrollable results section
- WebSocket works on mobile networks
- Works in mobile browsers (Safari, Chrome, Firefox)

## Performance

- CSS-only animations (GPU accelerated)
- No JavaScript animation libraries
- WebSocket for efficient real-time updates
- Minimal DOM updates (React diffing)
- No heavy fonts (system fonts via Geist)

## Future Design Enhancements

Potential additions that maintain the aesthetic:
- ASCII art vote confirmation
- Dot matrix style result displays
- Terminal-style command history
- Monospace QR codes
- Data visualization as ASCII charts
- Typewriter effect for titles (CSS animation)
- Glitch effect on state transitions
- Grid overlay toggle for composition
