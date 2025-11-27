# Courier Tracking Platform

A modern, interactive courier tracking platform built with pure HTML, CSS, and JavaScript. Features real-time package tracking with animated maps, glassmorphism UI, and smooth transitions.

![Courier Tracking Platform](https://img.shields.io/badge/Status-Complete-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

- 🎨 **Modern UI/UX** - Glassmorphism effects, gradient backgrounds, and smooth animations
- 🗺️ **Interactive Maps** - Mapbox integration with animated courier markers
- 📦 **Real-time Tracking** - Live package status updates and location tracking
- 📍 **Detailed Timeline** - Complete checkpoint history with timestamps
- ⚡ **Fast & Responsive** - Optimized for all devices (mobile, tablet, desktop)
- 🎯 **No Dependencies** - Pure vanilla JavaScript (except Mapbox for maps)

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser.

### Option 2: Local Server (Recommended)
For the best experience, run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## 📋 Demo Tracking Codes

Try these tracking codes to see different package statuses:

- **TRACK001** - In Transit (New York → Los Angeles)
- **TRACK002** - Out for Delivery (Chicago → Miami)
- **TRACK003** - Delivered (Seattle → San Francisco)

## 🗺️ Mapbox Setup (Optional)

The platform includes a fallback view if Mapbox is not configured. To enable the interactive map:

1. Get a free Mapbox access token at [mapbox.com](https://www.mapbox.com/)
2. Open `js/tracking.js`
3. Replace the placeholder token on line 7:
   ```javascript
   mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN_HERE';
   ```

## 📁 Project Structure

```
courier/
├── index.html              # Landing page
├── tracking.html           # Tracking results page
├── styles/
│   ├── main.css           # Main styles & design system
│   └── tracking.css       # Tracking page specific styles
├── js/
│   ├── data.js            # Hardcoded tracking data
│   ├── main.js            # Landing page functionality
│   └── tracking.js        # Tracking page & map logic
└── README.md
```

## 🎨 Design Features

- **Glassmorphism Cards** - Frosted glass effect with backdrop blur
- **Gradient Backgrounds** - Animated gradient orbs
- **Smooth Animations** - CSS animations and transitions
- **Responsive Layout** - Mobile-first design approach
- **Custom Icons** - SVG icons and emoji for visual appeal

## 🔧 Customization

### Adding New Tracking Codes

Edit `js/data.js` and add new entries to the `trackingDatabase` object:

```javascript
'TRACK004': {
    trackingCode: 'TRACK004',
    status: 'in-transit',
    // ... add your data
}
```

### Changing Colors

Modify CSS variables in `styles/main.css`:

```css
:root {
    --primary: #8B5CF6;
    --secondary: #3B82F6;
    /* ... customize colors */
}
```

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎯 Key Technologies

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with variables, grid, flexbox
- **JavaScript ES6+** - Modern JavaScript features
- **Mapbox GL JS** - Interactive maps (optional)

## 📄 License

This project is open source and available for personal and commercial use.

## 🙏 Credits

- Icons: SVG & Emoji
- Fonts: Google Fonts (Inter)
- Maps: Mapbox GL JS

---

**Built with ❤️ using pure HTML, CSS, and JavaScript**
