# D2Deals Driveway

A premium car dealership website showcasing luxury and performance vehicles with a modern, sleek interface.

## Features

- 🚗 **Vehicle Showcase**: Dynamic vehicle inventory with images, prices, and features
- 🎨 **Modern UI**: Smooth animations and transitions powered by GSAP
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🎥 **Video Content**: CEO introduction video with interactive playback
- ⚡ **Fast Performance**: Built with Vite for optimal loading speeds
- 🗄️ **Database**: SQLite database for vehicle management

## Tech Stack

- **Frontend**: React 19, Vite, GSAP
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (pg)
- **Styling**: CSS3 with custom animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd d2deals-driveway
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values as needed.

4. **Start development servers**:

   **Terminal 1 - Frontend**:
   ```bash
   npm run dev
   ```

   **Terminal 2 - Backend**:
   ```bash
   npm run server
   ```

5. **Open your browser**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally
- `npm run server` - Start backend server (development)
- `npm run server:prod` - Start backend server (production)
- `npm run start` - Start production server (serves both frontend and backend)
- `npm run lint` - Run ESLint

## Project Structure

```
d2deals-driveway/
├── public/          # Static assets (images, videos)
├── server/         # Backend API
│   ├── data/       # SQLite database files
│   ├── db.js       # Database operations
│   └── index.js    # Express server
├── src/            # Frontend React app
│   ├── components/ # React components
│   ├── App.jsx     # Main app component
│   └── main.jsx    # Entry point
├── .env.example    # Environment variables template
└── package.json    # Dependencies and scripts
```

## Environment Variables

### Frontend
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:4000)

### Backend
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (production only)

## Database

The application uses **PostgreSQL** for vehicle storage. 

### Setup PostgreSQL

**Quick Setup (Free Cloud Options):**
1. **Railway**: [railway.app](https://railway.app) - Free tier available
2. **Render**: [render.com](https://render.com) - Free tier available  
3. **Supabase**: [supabase.com](https://supabase.com) - Free tier available
4. **Neon**: [neon.tech](https://neon.tech) - Free tier available

See [POSTGRESQL_SETUP.md](./POSTGRESQL_SETUP.md) for detailed setup instructions.

### Environment Variables

Set `DATABASE_URL` in your `.env` file:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

The database will automatically:
- Create the `vehicles` table on first run
- Seed default vehicles if the table is empty

### Vehicle Schema
- `id` - Primary key (SERIAL)
- `name` - Vehicle name
- `price` - Price string
- `image` - Image path
- `description` - Vehicle description
- `features` - JSONB array of features
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Vercel** (Recommended):
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Railway**:
   - Connect GitHub repo
   - Auto-deploys on push

3. **Render**:
   - Create Web Service
   - Connect repo
   - Set build/start commands

## API Endpoints

- `GET /health` - Health check
- `GET /vehicles` - Get all vehicles
- `GET /vehicles/:id` - Get vehicle by ID
- `POST /vehicles` - Create new vehicle

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved

## Support

For issues or questions, please contact the development team.
