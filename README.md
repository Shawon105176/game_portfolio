# 3D Car Portfolio

একটি interactive 3D portfolio website যেখানে visitors একটি 3D car drive করে বিভিন্ন projects, about, এবং contact sections explore করতে পারে।

## 🚗 Features

- **3D Car Navigation**: WASD বা arrow keys দিয়ে গাড়ি চালান
- **Physics Simulation**: Realistic car physics with Cannon.js
- **Interactive Zones**: Projects, About, Contact areas
- **Dynamic Environment**: 3D buildings, trees, roads, water
- **Real-time Audio**: Engine sounds and ambient music
- **Responsive Design**: Mobile এবং desktop support
- **Performance Optimized**: Low-poly models এবং efficient rendering

## 🛠️ Technologies

- **Three.js** - 3D rendering and scene management
- **Cannon.js** - Physics engine for car movement and collision
- **GSAP** - Smooth animations and transitions
- **Vite** - Fast development and build tool
- **Web Audio API** - Real-time audio generation
- **Modern JavaScript** - ES6+ modules and classes

## 🎮 Controls

- **WASD** বা **Arrow Keys** - Drive the car
- **Mouse** - Look around (when mouse is pressed)
- **Space** - Brake
- **Touch** - Mobile steering (swipe gestures)

## 📱 Responsive Experience

- **Desktop**: Full 3D car driving experience
- **Mobile**: Touch controls with optimized performance
- **Adaptive Quality**: Automatic performance scaling based on device

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js installed on your system.

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🏗️ Project Structure

```
src/
├── main.js              # Main application entry point
├── World/
│   ├── World.js         # Physics world setup
│   ├── Car.js           # Car model and physics
│   └── Environment.js   # 3D world environment
├── UI/
│   └── UI.js            # User interface management
├── Audio/
│   └── AudioManager.js  # Sound and music system
└── Utils/
    └── LoadingManager.js # Loading screen management
```

## 🎨 Customization

### Adding New Projects

Edit the `populateProjects()` method in `src/UI/UI.js` to add your own projects:

```javascript
const projects = [
    {
        title: 'Your Project Name',
        description: 'Project description',
        technologies: ['Tech1', 'Tech2'],
        demo: 'https://demo-link.com',
        github: 'https://github.com/your-repo'
    }
]
```

### Modifying the World

- **Buildings**: Edit `setBuildings()` in `Environment.js`
- **Car Model**: Customize `setModel()` in `Car.js`
- **Lighting**: Adjust `setLights()` in `Environment.js`
- **Physics**: Tune parameters in `World.js`

### Styling

All styles are in `style.css`. The design uses:
- CSS Grid for responsive layouts
- CSS animations for smooth transitions
- Modern glassmorphism effects
- Custom color scheme with CSS variables

## 🔧 Performance Tips

1. **Graphics Quality**: The app automatically adjusts quality based on device performance
2. **Mobile Optimization**: Touch controls are optimized for mobile devices
3. **Loading**: Progressive loading with visual feedback
4. **Memory Management**: Efficient cleanup of 3D objects

## 🌐 Browser Support

- **Chrome** 60+ (recommended)
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+

WebGL support is required.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Contact

Feel free to reach out for collaborations or questions through the contact form in the 3D world!

---

**Note**: This is a demonstration portfolio. Replace the placeholder content with your actual projects and information.
