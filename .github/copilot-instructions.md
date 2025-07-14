<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# 3D Car Portfolio Development Instructions

This is a 3D interactive portfolio website built with Three.js and Cannon.js physics engine. When working on this project, please follow these guidelines:

## Project Overview
- This is a game-style portfolio where users drive a 3D car to explore different sections
- Built with Three.js for 3D rendering, Cannon.js for physics, and GSAP for animations
- Features interactive zones for Projects, About, and Contact sections
- Optimized for both desktop and mobile devices

## Code Guidelines

### Three.js Best Practices
- Always dispose of geometries, materials, and textures when removing objects
- Use object pooling for frequently created/destroyed objects like particles
- Optimize geometry with appropriate level of detail
- Use efficient shadow mapping and lighting

### Physics Integration
- Keep physics bodies synchronized with visual meshes
- Use appropriate mass and material properties for realistic behavior
- Implement proper collision detection and response
- Optimize physics simulation for performance

### Performance Considerations
- Monitor frame rate and optimize for 60fps
- Use LOD (Level of Detail) for distant objects
- Implement frustum culling for better performance
- Consider using instanced rendering for repeated objects

### Audio Implementation
- Use Web Audio API for realistic engine sounds
- Implement spatial audio for immersive experience
- Handle browser autoplay policies properly
- Provide audio controls for user preference

### UI/UX Guidelines
- Ensure responsive design for all screen sizes
- Implement smooth transitions and animations
- Provide clear visual feedback for interactions
- Maintain accessibility standards

### Mobile Optimization
- Implement touch controls for mobile devices
- Reduce quality settings for lower-end devices
- Optimize texture sizes and polygon counts
- Handle orientation changes gracefully

## File Structure
- Keep 3D world logic in `src/World/` directory
- UI components should be in `src/UI/` directory
- Utility functions in `src/Utils/` directory
- Audio management in `src/Audio/` directory

## Code Style
- Use ES6+ modern JavaScript features
- Implement proper error handling and fallbacks
- Add meaningful comments for complex 3D math
- Follow consistent naming conventions
- Use TypeScript-style JSDoc comments for better IntelliSense

## Testing Considerations
- Test on multiple devices and browsers
- Verify WebGL compatibility
- Check performance on lower-end devices
- Validate touch controls on mobile devices

## Common Patterns
- Use the singleton pattern for main Experience class
- Implement event-driven architecture for communication between modules
- Use composition over inheritance for 3D objects
- Implement proper cleanup methods for memory management
