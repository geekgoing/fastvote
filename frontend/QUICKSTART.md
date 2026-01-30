# FastVote Frontend - Quick Start

## Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment** (optional)
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` if your backend is not at `http://localhost:8000`:
   ```
   NEXT_PUBLIC_API_URL=http://your-backend-url:port
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Testing the Voting Page

1. **Start the backend** (in another terminal)
   ```bash
   cd ../backend
   docker-compose up  # or your backend start command
   ```

2. **Create a vote room** via backend API or admin interface

3. **Visit the voting page**
   ```
   http://localhost:3000/vote/{uuid}
   ```

   Replace `{uuid}` with your room's UUID

## Key Features

### Public Room Flow
1. Load page → See room title and options
2. Select an option → Click "SUBMIT_VOTE"
3. View real-time results

### Protected Room Flow
1. Load page → Password prompt
2. Enter password → Click "VERIFY"
3. If correct → Continue to voting interface

### After Voting
- Results update in real-time via WebSocket
- Progress bars animate as new votes arrive
- Copy link button to share with others
- Can't vote twice (fingerprint tracking)

## Scripts

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Serve production build
npm run lint     # Run ESLint
```

## File Structure

```
frontend/
├── app/
│   ├── vote/[uuid]/page.tsx  # Voting page
│   ├── page.tsx               # Home page
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── lib/
│   ├── api.ts                 # API client
│   └── fingerprint.ts         # Device fingerprinting
└── public/                    # Static assets
```

## Troubleshooting

### "Vote room not found"
- Check the UUID is correct
- Ensure backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct

### WebSocket not connecting
- Check browser console for errors
- Verify backend WebSocket endpoint is accessible
- Some corporate firewalls block WebSocket

### "Already voted" message
- Clear localStorage to reset fingerprint
- Or use incognito mode for testing

### Environment variables not working
- Restart dev server after changing `.env.local`
- Variables must start with `NEXT_PUBLIC_` for client access

## Production Deployment

1. **Build production bundle**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform
   ```
   NEXT_PUBLIC_API_URL=https://your-production-api.com
   ```

3. **Start production server**
   ```bash
   npm start
   ```

   Or use the generated `.next` folder with your hosting provider

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Requires: WebSocket, localStorage, Clipboard API

## Design Philosophy

The interface uses a **brutalist-modernist** aesthetic:
- Stark black/white color scheme
- Monospace fonts for data
- Bold typography for headlines
- Hard-edged geometric forms
- No unnecessary decoration
- Full dark mode support

This creates a distinctive, memorable voting experience that stands out from generic UI patterns.
