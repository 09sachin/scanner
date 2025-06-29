# Barcode & Invoice Generator

A professional Progressive Web App (PWA) for generating barcodes, QR codes, scanning codes, and creating GST-compliant invoices.

🔗 **Live Demo**: [scanner.bitsandbots.in](https://scanner.bitsandbots.in)

## ✨ Features

### 🏷️ Barcode & QR Code Generator
- **Multiple barcode formats**: CODE128, CODE39, EAN13, EAN8, UPC, ITF14, MSI, Pharmacode
- **QR Code generation** with customizable error correction levels
- **Template-based QR codes** for:
  - Website URLs
  - Contact information (vCard)
  - WiFi network sharing
  - Email composition (Gmail)
  - SMS messages
  - App Store/Play Store links
  - Custom JSON data
- **Customizable styling**: Colors, dimensions, display options
- **Export functionality**: Download as PNG

### 📱 Code Scanner
- **Dual scanning modes**: Upload image or live camera scanning
- **Multi-format support**: Both QR codes and barcodes
- **Real-time camera scanning** with Html5-QrCode
- **Scan history** with timestamp and copy functionality
- **Mobile-optimized** camera interface

### 🧾 Invoice Generator
- **GST-compliant invoices** for Indian businesses
- **Professional templates** with multiple styling options
- **Comprehensive business & customer details**
- **Item management** with GST calculations
- **Automatic tax calculations** (CGST, SGST, IGST)
- **PDF export** functionality
- **Invoice preview** before generation

### 🌐 Progressive Web App (PWA)
- **Offline functionality** with service worker
- **Installable** on mobile and desktop
- **App shortcuts** for quick access to features
- **Dark/Light theme** with system preference detection
- **Responsive design** for all screen sizes

## 🚀 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Live URL
- **Production**: [scanner.bitsandbots.in](https://scanner.bitsandbots.in)

### Deployment Process
1. Push changes to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Static files are served from GitHub Pages
4. Custom domain (scanner.bitsandbots.in) is configured

### Manual Deployment
```bash
npm run build
# Files are exported to the 'out' directory
# GitHub Actions handles the rest
```

## 🛠️ Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd barcode_invoice_gen

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (disabled in build)
```

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Barcode Generation**: JsBarcode
- **QR Code Generation**: qrcode library
- **Code Scanning**: Html5-QrCode, jsQR, Quagga
- **PDF Generation**: jsPDF, html2canvas
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

## 📱 PWA Features

### Installation
- **Mobile**: Add to Home Screen from browser menu
- **Desktop**: Install button in address bar (Chrome/Edge)

### Offline Functionality
- Core features work offline
- Cached resources for faster loading
- Background sync for data

### App Shortcuts
Quick access to:
- Barcode Generator
- Code Scanner  
- Invoice Generator

## 🎨 Theming

### Dark/Light Mode
- System preference detection
- Manual toggle in navbar
- Persistent user preference
- Smooth transitions

### Color Scheme
- **Light Mode**: Clean whites and grays
- **Dark Mode**: Deep navy blue backgrounds
- **Accent Colors**: Blue gradient themes

## 📈 Performance

### Optimization
- Static site generation (SSG)
- Image optimization disabled for GitHub Pages
- Service worker caching
- Code splitting and lazy loading

### Lighthouse Score
- Performance: Optimized for static delivery
- Accessibility: WCAG compliant
- Best Practices: PWA standards
- SEO: Meta tags and structured data

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Customization
- Update `manifest.json` for PWA settings
- Modify `tailwind.config.js` for theming
- Edit `next.config.ts` for build settings

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🐛 Issues

Report issues on the [GitHub Issues](https://github.com/your-username/barcode_invoice_gen/issues) page.

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Visit [scanner.bitsandbots.in](https://scanner.bitsandbots.in)

---

**Built with ❤️ by BitsandBots**
