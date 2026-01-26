# SELS Portal - Next.js Learning Management System

A modern, accessible learning management system built with Next.js, designed specifically for learners with special educational needs.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 3
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Package Manager**: npm

## Features

- ✨ Accessibility-first design with high contrast colors
- 🌍 Multi-language support (Arabic/English)
- 🎨 Dark/Light theme with customizable font sizes
- 📱 Fully responsive design
- 🔐 Authentication system
- 📚 Course management and learning paths
- 🎓 Interactive lessons and progress tracking
- 📊 User dashboard and settings

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   ├── dashboard/         # Dashboard pages
│   │   ├── page.tsx       # Dashboard home
│   │   ├── courses/       # Courses listing
│   │   └── settings/      # User settings
│   └── globals.css        # Global styles and theme
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── services/             # API services
├── i18n/                 # Internationalization
└── public/               # Static assets

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd SELS-Portal
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Docker Deployment

### Build Docker Image

```bash
docker build -t sels-portal .
```

### Run Docker Container

```bash
docker run -p 3000:3000 sels-portal
```

### Docker Compose (Optional)

```bash
docker-compose up -d
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

## Accessibility Features

- High contrast color schemes
- Adjustable font sizes (small, medium, large, extra-large)
- Clear navigation and focus indicators
- Screen reader friendly
- Keyboard navigation support
- Calm, distraction-free interface

## Theme Customization

The theme uses CSS variables defined in `app/globals.css`. You can customize:

- Primary and secondary colors
- Background and foreground colors
- Border and input styles
- Font sizes and spacing

## Contributing

This project follows accessibility-first principles. When contributing:

1. Ensure all interactive elements are keyboard accessible
2. Maintain high color contrast ratios
3. Test with screen readers
4. Keep designs simple and clear
5. Follow the existing code style

## License

[Add your license here]

## Support

For support, email support@sels.education or visit our contact page.
