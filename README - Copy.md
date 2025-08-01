# Lynx - Personal Link Hub

A beautiful, highly customizable link-in-bio application that you can deploy anywhere. 
Perfect for creators, entrepreneurs, and professionals who want to share their important links in one elegant place.

## ✨ Features

#### 🎨 Customizable Design

* Full control of colors, gradients, fonts, and layout

* Live theme editor with instant preview

* Responsive design for all devices

* Import/export themes as JSON files

#### 🔗 Smart Link Management

* Support for links and grouped text cards

* Custom icons (emoji, SVG, image uploads)

* Per-link styling (colors, sizes)

* Drag-and-drop sorting with descriptions

#### 👤 Profile & Socials

* Profile picture upload

* Bio with rich text formatting

* Built-in social media links

* Real-time content updates

#### 🔐 Secure & Reliable

* Encrypted authentication and session handling

* Supabase database for safe data storage

* Strong password requirements

* Guided first-time setup

#### 🎯 Advanced Tools

* Admin dashboard for full site control

* Automatic data saving with local storage fallback

* SEO-friendly URLs and meta tags

* Ready for analytics integrations
  
  

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account (for database features)
  
  

🚢 Deployment

You can deploy Lynx in multiple ways:

### 1️⃣ Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/paoloronco/Lynx)

1. Fork this repository.
2. Go to [Vercel](https://vercel.com) and import your fork.
3. Add the required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Click **Deploy** and your app will be live in seconds.

* * *

### 2️⃣ Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/paoloronco/lynx)

1. Go to [Netlify](https://netlify.com) and connect your fork.
2. Set the same environment variables as on Vercel.
3. Deploy automatically with Netlify’s build process.

* * *

### 3️⃣ Manual Installation (Self-hosted)

If you want to host Lynx on your own server or a different provider:

1. **Clone the repository**
      git clone <your-repo-url>
      cd lynx

2. **Install dependencies**
      npm install

3. **Set up environment variables**
      cp .env.example .env.local
   Fill in your Supabase credentials.

4. **Build for production**
      npm run build

5. **Upload the `dist` folder** to your hosting provider (e.g., Nginx, Apache, or static hosting services).

* * *



## 🛠️ Configuration

### Initial Setup

1. Visit `/admin` for first-time setup
2. Create your admin credentials (strong password required)
3. Configure your profile information
4. Add your links and customize the theme
5. Your site is ready to share!

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```



### ## 🔧 Development

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom secure auth system
- **State Management**: React Query + Local Storage
- **Icons**: Lucide React
- **Routing**: React Router DOM

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔒 Security Features

- **Password Hashing**: PBKDF2 with 10,000 iterations
- **Session Security**: Secure session management with expiry
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Secure form handling

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/license/mit) file for details.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Database by [Supabase](https://supabase.com/)
- Originally created with [Lovable](https://lovable.dev/)

## 📞 Support

- 📧 Email: info@paoloronco.it
- 🐛 Issues: [GitHub Issues](https://github.com/paoloronco/lynx/issues)

---

**Made with ❤️ for creators and professionals who want to share their digital presence beautifully.**
