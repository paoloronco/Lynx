# Lynx - Personal Link Hub

A beautiful, highly customizable link-in-bio application that you can deploy anywhere. 
Perfect for creators, entrepreneurs, and professionals who want to share their important links in one elegant place.

## ✨ Features

#### 🎨 **Advanced Customization**

- **Complete Theme Control**: Customize colors, gradients, typography, and layout
- **Visual Theme Editor**: Real-time preview with intuitive color pickers and sliders
- **Multiple Font Options**: Choose from 9+ professional font families
- **Responsive Design**: Optimized for all devices and screen sizes
- **Export/Import Themes**: Save and share your custom themes as JSON files

#### 🔗 **Flexible Link Management**

- **Multiple Link Types**: Regular links and text cards with clickable items
- **Custom Icons**: Support for emojis, SVG, and image uploads
- **Individual Link Styling**: Custom colors and sizes for each link
- **Drag & Drop Reordering**: Intuitive link organization
- **Link Descriptions**: Add context to your links

#### 👤 **Profile Customization**

- **Profile Picture Upload**: Custom avatar support
- **Rich Bio Section**: Tell your story with formatted text
- **Social Media Integration**: Built-in social link support
- **Dynamic Content**: Update profile information in real-time

#### 🔐 **Enterprise-Grade Security**

- **Secure Authentication**: PBKDF2 password hashing with salt
- **Session Management**: 12-hour secure sessions with auto-expiry
- **Strong Password Requirements**: Enforced password complexity
- **Database Integration**: Supabase backend for secure data storage
- **First-Time Setup**: Guided initial configuration

### 🎯 **Professional Features**

- **Admin Dashboard**: Comprehensive management interface
- **Password Management**: Change credentials securely
- **Data Persistence**: Automatic saving with localStorage fallback
- **SEO Optimized**: Clean URLs and meta tags
- **Analytics Ready**: Easy integration with tracking services

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account (for database features)

###  Installation

1. **Clone the repository**
   
   ```bash
   git clone <your-repo-url>
   cd lynx
   ```

2. **Install dependencies**
   
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`

4. **Start development server**
   
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Visit your app**
   
   - Public view: `http://localhost:5173`
   - Admin panel: `http://localhost:5173/admin`

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

## 🎨 Customization Guide

### Theme Customization

Access the theme editor in the admin panel to customize:

- **Colors**: Primary, background, text, and accent colors
- **Gradients**: Background gradients with direction control
- **Typography**: Font family, sizes for different elements
- **Layout**: Card spacing, border radius, glow effects
- **Content**: Default text and messaging

### Link Types

1. **Regular Links**: Standard clickable links with icons and descriptions
2. **Text Cards**: Display multiple related links in a single card

### Advanced Styling

- Individual link background and text colors
- Three size options: Small, Medium, Large
- Custom icons via emoji, SVG, or image upload
- Glassmorphism effects with customizable blur and glow

## 🚢 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/lynx)

1. Fork this repository
2. Connect to Vercel
3. Add environment variables
4. Deploy with one click

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/lynx)

1. Fork this repository
2. Connect to Netlify
3. Add environment variables
4. Deploy automatically

### Manual Deployment

```bash
npm run build
# Upload the 'dist' folder to your hosting provider
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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


