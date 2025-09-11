# Upface - Modern Websites for Local Businesses

![Upface Logo](public/assets/upface-logo.png)

A modern, dark-themed website for **Upface**, a development agency specializing in websites and applications for local businesses. Built with Next.js, Tailwind CSS, Firebase, and deployed on Vercel.

## 🚀 Features

- **Modern Design**: Dark theme inspired by x.ai and warp.dev
- **Responsive**: Mobile-first design with smooth animations
- **Admin Dashboard**: CRM, content management, and freelancer panel
- **Authentication**: Firebase Auth for secure admin access
- **SEO Optimized**: Structured data, meta tags, and analytics ready
- **Demo Showcase**: Interactive carousel of portfolio projects
- **Contact Forms**: Ready for email service integration

## 📋 Pages

- **Home** (`/`) - Hero, value props, demo carousel, CTA
- **Services** (`/services`) - Web dev, mobile apps, custom solutions
- **Pricing** (`/pricing`) - Transparent pricing tiers
- **Mission** (`/mission`) - Company mission and values
- **About** (`/about`) - Company story and timeline
- **Contact** (`/contact`) - Contact form and info
- **FAQ** (`/faq`) - Common questions
- **Demos** (`/demos`) - Portfolio showcase
- **Admin** (`/admin`) - Protected dashboard (requires login)
- **Login** (`/login`) - Authentication page

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Analytics**: Google Analytics (optional)
- **Deployment**: Vercel

## ⚡ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/guhdnews/upface-site.git
   cd upface-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Firebase config (see setup below).

4. **Add your MidJourney assets**
   Place generated images in `public/assets/`:
   - `hero-nebula.png` - Homepage background
   - `upface-logo.png` - Company logo
   - `demo-*.png` - Demo thumbnails
   - `upface-og-image.png` - Social media image

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Visit the site**
   Open [http://localhost:3000](http://localhost:3000)

## 🔥 Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project named "upface-site"
   - Enable Authentication and Firestore

2. **Configure Authentication**
   - Enable Email/Password provider
   - Create your admin user:
     ```
     Email: admin@upface.dev
     Password: your_secure_password
     ```

3. **Get Firebase Config**
   - Go to Project Settings → General
   - Add a web app and copy the config
   - Update `.env.local` with your values:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:your_app_id
   ```

## 🎨 MidJourney Asset Generation

Generate these images using MidJourney and place in `public/assets/`:

### Required Assets:
- `hero-nebula.png` - Dark space/nebula background for hero
- `upface-logo.png` - Company logo (square format)
- `upface-og-image.png` - Social media preview (1200x630)
- `demo-restaurant-1.png` - Restaurant demo thumbnail
- `demo-restaurant-2.png` - Restaurant demo alternate
- `demo-construction-1.png` - Construction demo thumbnail
- `demo-cleaning-app.png` - Cleaning app demo thumbnail
- Plus additional demo thumbnails as needed

### Sample MidJourney Prompts:
```
"Dark cosmic nebula background, minimalist, high contrast, purple and blue tones --ar 16:9"
"Modern tech company logo, letter U, gradient blue, clean design --ar 1:1"
"Restaurant website mockup, dark theme, modern interface --ar 16:10"
```

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to GitHub**
   - Push your code to GitHub
   - Go to [Vercel](https://vercel.com)
   - Import your repository

2. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Deploy**
   - Vercel will automatically deploy
   - Get your live URL: `https://your-project.vercel.app`

4. **Custom Domain** (Optional)
   - Add your domain in Vercel dashboard
   - Update DNS records as instructed
   - Update `NEXT_PUBLIC_SITE_URL` environment variable

## 📊 Analytics Setup

1. **Google Analytics** (Optional)
   - Create GA4 property
   - Get Measurement ID
   - Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 🔐 Admin Access

1. **Login**: Visit `/login`
2. **Demo Credentials** (if Firebase not set up):
   - Email: `admin@upface.dev`
   - Password: `upface2025`
3. **Admin Dashboard**: Accessible at `/admin` after login

### Admin Features:
- **CRM**: Manage clients and projects
- **Content**: Edit pages and demos
- **Freelancers**: Track team performance
- **Analytics**: Business metrics dashboard

## 🎯 Business Model

Upface targets local businesses with:
- **Basic Plan**: $1,000 - Site revamp
- **Pro Plan**: $3,000 - Site + app
- **Enterprise**: $5,000 - Custom solutions

### Target Niches:
1. Restaurants (ordering, reservations)
2. Construction (projects, quotes)
3. Cleaning Services (booking, tracking)
4. Gyms (classes, memberships)
5. Auto Shops (services, appointments)
6. Salons (booking, stylists)
7. Retail (catalog, loyalty)
8. Plumbing (scheduling, quotes)
9. Venues (events, ticketing)
10. General loyalty apps

## 📝 Development Notes

- Uses Tailwind CSS v4 syntax
- Firebase runs in demo mode without config
- All forms ready for backend integration
- SEO optimized with structured data
- Mobile-first responsive design
- Dark theme throughout

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for local businesses everywhere**
