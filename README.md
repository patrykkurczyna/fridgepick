# FridgePick

An AI-powered meal planning application that helps users create weekly meal plans based on available ingredients and a curated recipe database.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

FridgePick solves the common problem of meal planning by intelligently suggesting recipes based on ingredients users have available in their homes and fridges. The application uses AI integration to make smart recipe selections while ensuring users can actually prepare the suggested meals with their available ingredients.

### Key Features

- **Ingredient Management**: Save, view, and manage food products and ingredients organized by categories
- **Recipe Database**: Maintain and browse a collection of recipes with sample data for testing
- **Smart Recipe Selection**: AI-powered recommendations based on available ingredients and user preferences
- **Weekly Meal Planning**: Create comprehensive weekly meal plans (5 meals per day)
- **User Authentication**: Simple login and registration system

## Tech Stack

- **[Astro](https://astro.build/)** - Modern web framework for building fast, content-focused websites
- **[React](https://react.dev/)** - UI library for building interactive components
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid styling
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

### UI Components & Libraries

- **Radix UI** - Headless UI components for React
- **Lucide React** - Beautiful icon library
- **Class Variance Authority** - Component styling variants
- **Tailwind Merge** - Utility for merging Tailwind classes

## Getting Started Locally

### Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fridgepick
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:4321`

### Building for Production

```bash
npm run build
npm run preview
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Automatically fix ESLint issues
- `npm run format` - Format code with Prettier

## Project Scope

### MVP Features (In Scope)

- ✅ Ingredient and food product management with category organization
- ✅ Simple user authentication (login/registration)
- ✅ Recipe database management (create, read, update, delete)
- ✅ Sample recipe data initialization for testing
- ✅ AI integration for intelligent recipe selection
- ✅ Weekly meal planning functionality

### Future Features (Out of MVP Scope)

- ❌ Recipe import from external sources (PDFs, websites)
- ❌ Advanced user preferences for meal planning
- ❌ Inventory updates via photos (fridge contents, receipts, shopping)

### Success Criteria

- **Accurate Recipe Selection**: 90% accuracy in suggesting recipes that can be prepared with available ingredients
- **Complete Meal Planning**: Generate balanced weekly meal plans with 5 meals per day
- **Ingredient Management**: Full CRUD functionality for user's ingredient inventory

## Project Status

🚧 **Development Phase** - MVP in active development

This project is currently in the MVP development stage. Core features are being implemented with a focus on creating a functional meal planning system that integrates AI for smart recipe recommendations.

### Current Version: 0.0.1

## License

MIT

---

*Built with modern web technologies and AI integration for an enhanced meal planning experience.*