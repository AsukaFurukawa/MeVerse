# MeVerse Frontend

This directory contains the Next.js frontend for the MeVerse application.

## Features

- Modern, award-winning inspired UI with Next.js and Chakra UI
- Dynamic personalized avatar system with 3D effects
- Advanced animations with Framer Motion
- Interactive chat interface with typing indicators
- Responsive design for all devices
- Dark/light mode theme customization
- Immersive micro-interactions and visual feedback

## Setup Instructions

1. Install Node.js (v18+ recommended)

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

- `components/` - Reusable UI components
- `pages/` - Next.js pages
- `public/` - Static assets
- `styles/` - Global styles and theme configuration
- `lib/` - Utility functions and API clients
- `context/` - React context providers
- `hooks/` - Custom React hooks

## UI Animations & Effects

MeVerse uses sophisticated UI animations to create an immersive and engaging user experience:

### General UI Effects
- Page transitions with staggered animations
- Parallax scrolling backgrounds
- Custom cursor effects
- Micro-interactions on button hovers
- Animated elements revealing on scroll
- Smooth morphing between states

### Avatar System
- Interactive 3D-like hovering effects
- Mood-based avatar animations
- Customizable appearance with animated transitions
- Blinking effects and subtle movements for lifelike feeling
- Reactive expressions based on conversation context

### Chat Interface
- Typing indicators with bouncing animations
- Message bubbles with dynamic entrance/exit effects
- Smooth scrolling and auto-focusing
- Voice message recording animations
- Status indicators (sending, sent, delivered, read)

## Inspired by Award-Winning Web Design

The UI design draws inspiration from award-winning websites featured on platforms like Awwwards. Key design principles implemented:

- Bold typography with gradient effects
- Depth through layered elements and subtle shadows
- Fluid animations that enhance rather than distract
- Thoughtful micro-interactions that provide feedback
- High contrast and vibrant accent colors
- Neumorphic UI elements that respond to user interaction
- Clean, minimal layouts with ample whitespace

## Future Enhancements

- Add WebGL particle effects for background
- Implement 3D avatar models using Three.js
- Add voice control capabilities using Web Speech API
- Create signature animations for brand identity
- Implement AR capabilities for avatar projection

## Avatar System

The avatar system allows users to create personalized digital representations:

- Basic customization (face, body, hair, clothing)
- Emotional expressions based on mood data
- Animation capabilities
- Integration with the digital twin personality 