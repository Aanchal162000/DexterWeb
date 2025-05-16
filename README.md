# Dexter - Next.js Dashboard Application

A modern, well-organized Next.js application with TypeScript and Tailwind CSS.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── common/         # Reusable components
│   ├── dashboard/      # Dashboard-specific components
│   └── trade/          # Trading-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── styles/             # Global styles and theme
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── store/              # State management
├── assets/             # Static assets
│   ├── images/        # Image assets
│   │   ├── dashboard/ # Dashboard images
│   │   ├── trade/     # Trading images
│   │   └── common/    # Common images
│   └── icons/         # Icon assets
├── layouts/            # Layout components
└── interfaces/         # TypeScript interfaces
```

## Technology Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- ESLint
- React

## Design Standards

### Colors

The project uses a comprehensive color system defined in `src/styles/theme.ts`:

- Primary colors (Blue)
- Neutral colors (Gray)
- Success colors (Green)
- Error colors (Red)
- Warning colors (Yellow)

### Typography

- Primary font: Inter
- Monospace font: JetBrains Mono
- Font sizes and line heights are standardized in the theme

### Spacing

A consistent spacing scale is defined in the theme, ranging from 0 to 96 units.

### Breakpoints

Standard breakpoints for responsive design:

- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Animations

Common animations are defined in `src/styles/animations.ts`:

- Fade in/out
- Slide in from different directions
- Scale in/out
- Bounce
- Pulse
- Spin

## Component Guidelines

1. Components should be reusable and modular
2. Maximum component size: 600 lines
3. Use TypeScript interfaces for props
4. Implement proper error handling
5. Follow accessibility best practices

## State Management

- Use React Context for global state
- Implement custom hooks for reusable logic
- Keep components focused and maintainable

## Code Organization

1. Keep interfaces in separate files
2. Implement hooks in the hooks directory
3. Place utility functions in the utils directory
4. Maintain consistent file naming conventions

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Guidelines

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Write clean, maintainable code
4. Document complex logic
5. Test components thoroughly

## Contributing

1. Create a new branch for your feature
2. Follow the established code style
3. Write clear commit messages
4. Submit a pull request

## License

MIT License
