<<<<<<< HEAD
# 🚗 3D Interactive Portfolio - Bruno Simon Style

An immersive 3D portfolio experience inspired by [Bruno Simon's legendary portfolio](https://bruno-simon.com/). Drive around in a cyberpunk world and explore different zones to discover projects, skills, and more!

## ✨ Features

### 🎮 Interactive 3D Experience
- **Drive-around Portfolio**: Navigate through different zones using WASD controls
- **Smooth Car Physics**: Realistic driving mechanics with Cannon.js physics engine
- **Dynamic Camera**: Follow-cam with mouse-controlled offset for cinematic experience
- **Particle Effects**: Dust particles, reset effects, and ambient animations

### 🎨 Bruno Simon Aesthetic
- **Neon Cyberpunk Theme**: Pink and cyan color palette with glowing effects
- **Hexagonal Ground Pattern**: Animated floating hexagons like Bruno's original
- **Glass Morphism UI**: Translucent interface elements with backdrop blur
- **Gradient Animations**: Dynamic background gradients and text effects

### 🎵 Immersive Audio
- **Synthesized Ambient Music**: Chord progressions using Web Audio API
- **Dynamic Engine Sounds**: Speed-responsive vehicle audio
- **UI Sound Effects**: Hover, click, and notification sounds
- **Music Toggle**: Mute/unmute functionality with visual feedback

### 📱 Modern UI Components
- **Performance Monitor**: Real-time FPS counter with color-coded status
- **Enhanced Minimap**: Zone indicators and car position tracking
- **Speed Gauge**: Animated speedometer with visual effects
- **Zone Detection**: Proximity-based information display

### 🏗️ Portfolio Sections
- **Projects Zone**: Showcase of latest work with tech stacks
- **About Zone**: Skills, experience, and personal journey
- **Contact Zone**: Interactive contact form with validation
- **Skills Zone**: Technical expertise and proficiency levels

## 🛠️ Technology Stack

### Core 3D Technologies
- **Three.js**: 3D graphics and rendering
- **Cannon.js**: Physics simulation
- **WebGL**: Hardware-accelerated graphics
- **GLSL Shaders**: Custom visual effects

### Frontend Framework
- **Vanilla JavaScript**: ES6+ modules and modern syntax
- **Vite**: Fast build tool and development server
- **CSS3**: Advanced animations and effects
- **HTML5**: Semantic markup and accessibility

### Animation & Audio
- **GSAP**: High-performance animations
- **Web Audio API**: Synthesized music and sound effects
- **CSS Animations**: Keyframe animations and transitions

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with WebGL support
- Good graphics card for optimal performance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd game_portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production
```bash
npm run build
npm run preview
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `W A S D` | Drive the car |
| `Mouse` | Look around (when holding click) |
| `Space` | Brake |
| `R` | Reset car position |
| `P` | Open Projects modal |
| `A` | Open About modal |
| `C` | Open Contact modal |
| `M` | Toggle music |
| `Esc` | Close modals |

## 🗺️ World Layout

```
        Projects Zone (-30, -30)
              🏗️
                 \
                  \
Skills Zone (50, 30) ⚡ ---- 🚗 Start (0, 0)
                  /
                 /
        Contact Zone (-20, 40)    About Zone (40, -40)
              📧                        👨‍💻
```

## 📁 Project Structure

```
src/
├── main.js                    # Main application entry
├── World/
│   ├── World.js              # Physics world setup
│   ├── Car.js                # Car model and physics
│   └── Environment.js        # 3D environment and lighting
├── UI/
│   ├── EnhancedUI.js         # Enhanced UI management
│   └── UI.js                 # Original UI (legacy)
├── Audio/
│   ├── EnhancedAudioManager.js # Synthesized audio system
│   └── AudioManager.js       # Original audio (legacy)
└── Utils/
    └── LoadingManager.js     # Asset loading management

public/
├── favicon.svg               # Site icon
└── assets/                   # Static assets

style.css                     # Bruno Simon inspired styles
index.html                    # Main HTML structure
vite.config.js               # Vite configuration
package.json                 # Dependencies and scripts
```

## 🎨 Customization

### Colors
The color palette is defined in CSS custom properties:
```css
:root {
  --primary-pink: #ff6b9d;
  --primary-cyan: #4ecdc4;
  --secondary-blue: #45b7d1;
  --accent-purple: #9b59b6;
  --dark-bg: #0d0d23;
  --darker-bg: #0a0a1a;
}
```

### Adding New Zones
1. Define zone in `EnhancedUI.js` `checkZoneProximity()` method
2. Add zone marker in minimap setup
3. Create corresponding modal content in HTML

### Car Customization
Edit the `setModel()` method in `Car.js` to modify:
- Car geometry and materials
- Lighting effects
- Particle systems
- Physics properties

## 🔧 Performance Optimization

### Recommended Settings
- **Shadows**: Enabled for realism (can be disabled for performance)
- **Anti-aliasing**: Enabled (can be disabled on mobile)
- **Physics Iterations**: Balanced for stability vs performance
- **Particle Count**: Optimized for visual impact

### Mobile Considerations
- Touch controls implemented for mobile devices
- Responsive design for different screen sizes
- Performance monitoring with FPS counter
- Automatic quality scaling based on device capabilities

## 🎵 Audio Features

### Ambient Music System
- **Chord Progressions**: C Major 7 → D Minor 7 → E Minor 7 → F Major 7
- **Reverb Effects**: Convolution reverb for spatial audio
- **Dynamic Mixing**: Volume responds to user interactions

### Engine Audio
- **Synthesized Engine**: Sawtooth wave with low-pass filtering
- **Speed Responsive**: Frequency and volume change with car speed
- **Realistic Physics**: Audio reflects actual car movement

## 🌟 Bruno Simon Inspiration

This portfolio pays homage to Bruno Simon's groundbreaking work while adding unique elements:

### Similarities
- ✅ 3D car driving experience
- ✅ Neon cyberpunk aesthetic  
- ✅ Interactive zone exploration
- ✅ Floating geometric elements
- ✅ Smooth animations and transitions

### Unique Additions
- 🎵 Synthesized ambient music system
- 📊 Real-time performance monitoring
- 🎮 Enhanced car physics and effects
- 📱 Mobile-responsive design
- 🔊 Dynamic audio engine
- ⚡ Modern UI components
- 🎨 Extended color palette

## � Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy dist folder to Vercel
```

### Netlify
```bash
npm run build
# Drag and drop dist folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push dist folder to gh-pages branch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bruno Simon** - Original inspiration and pioneering 3D web portfolio design
- **Three.js Community** - Amazing 3D library and ecosystem
- **Cannon.js** - Excellent physics engine
- **GSAP** - Powerful animation library
- **Vite** - Lightning-fast build tool

## 📞 Contact

- **Portfolio**: [Your Portfolio URL]
- **Email**: [your.email@example.com]
- **LinkedIn**: [Your LinkedIn]
- **GitHub**: [Your GitHub]
- **Twitter**: [Your Twitter]

---

**⭐ If you found this project inspiring, please give it a star!**

**🚗 Ready to drive through the digital world? Start your engines!**
