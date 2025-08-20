# NevoChat Landing Page

A professional Next.js TypeScript landing page for NevoChat - a web agency specializing in modern websites and smart chatbots with multi-language support.

## 🌟 Features

- **Multi-language Support** (Hebrew, French, English) with next-intl
- **Modern Design** with Tailwind CSS and neon green color scheme
- **Smooth Animations** using Framer Motion
- **Responsive Design** optimized for all devices
- **Professional Components** including Hero, Services, About, Contact, Portfolio
- **SEO Optimized** with proper meta tags and structure
- **TypeScript** for type safety and better development experience

## 🚀 Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **next-intl** - Internationalization
- **Heroicons** - Beautiful SVG icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🎨 Design Features

- **Neon Green Theme** with professional dark background
- **Animated Elements** including floating icons and smooth transitions
- **Modern Glass Effects** with backdrop blur
- **Professional Typography** with gradient text effects
- **Interactive Components** with hover and focus states

## 📂 Project Structure

```
nevochat-landing-page/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── portfolio/
│   │   │   └── services/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Services.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Footer.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── middleware.ts
│   └── i18n.ts
├── i18n/
│   ├── he.json (Hebrew - Default)
│   ├── en.json (English)
│   └── fr.json (French)
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nevochat-landing-page
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌍 Internationalization

The application supports three languages:

- **Hebrew (he)** - Default language, RTL support
- **English (en)** - LTR
- **French (fr)** - LTR

Translation files are located in the `i18n/` directory. To add new translations:

1. Add the new locale to `src/middleware.ts`
2. Create a new JSON file in `i18n/[locale].json`
3. Update the `locales` array in `src/i18n.ts`

## 📱 Pages & Sections

### Home Page (`/`)
- **Hero Section** - Main introduction with CTAs
- **Services Section** - Web development, chatbots, integrations
- **About Section** - Company information and stats
- **Contact Section** - Contact form and information
- **Footer** - Links and company details

### Dedicated Pages
- `/services` - Detailed services information
- `/about` - Extended about information
- `/contact` - Contact form and details
- `/portfolio` - Project showcase

## 🎯 Services Highlighted

1. **Website Development**
   - Professional, responsive websites
   - Modern design and functionality
   - SEO optimized

2. **Smart Chatbots**
   - WhatsApp integration
   - Social media platforms
   - WordPress integration
   - Google Sheets connectivity
   - Calendar integration
   - Custom integrations on demand

3. **System Integrations**
   - Database connections
   - External service APIs
   - Custom solutions

## 🖥️ Supported Integrations

The website showcases integration capabilities with:

- 💬 WhatsApp
- 🗃️ WordPress
- 📊 Google Sheets
- 📅 Google Calendar
- 📘 Facebook
- 📷 Instagram
- 💬 Telegram
- 📧 Email

## 🎨 Customization

### Colors
The primary color scheme uses neon green (`#39ff14`) with variations. Update colors in `tailwind.config.js`:

```javascript
colors: {
  neon: {
    green: '#39ff14',
    cyan: '#00ffff',
    pink: '#ff10f0',
    yellow: '#ffff00',
  },
}
```

### Content
Update translations in the `i18n/` JSON files to modify text content.

### Styling
Modify styles in:
- `src/app/globals.css` - Global styles
- Individual component files for component-specific styles
- `tailwind.config.js` - Tailwind configuration

## 📧 Contact Configuration

Update contact information in the translation files and component files:

- Email: `contact@nevochat.com`
- Phone: Update in Contact component
- WhatsApp: Update WhatsApp links in Contact and Footer components

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Other Platforms
1. Build the project: `npm run build`
2. Deploy the `.next` folder to your hosting platform

## 🔧 Configuration Files

- **next.config.js** - Next.js configuration with next-intl
- **tailwind.config.js** - Tailwind CSS customization
- **postcss.config.js** - PostCSS configuration
- **tsconfig.json** - TypeScript configuration

## 📄 License

This project is created for NevoChat. All rights reserved.

## 🤝 Support

For support and inquiries, contact NevoChat team.

---

**Built with ❤️ for NevoChat - Advanced Digital Solutions**
