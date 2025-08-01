# Contributing to Lynx

Thank you for your interest in contributing to Lynx! We welcome contributions from the community and are excited to see what you'll bring to this project.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We expect all contributors to be respectful, inclusive, and constructive in their interactions.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ or **Bun**
- **Git**
- A **Supabase** account (for database features)
- A code editor (we recommend **VS Code**)

### Setting Up Your Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/lynx.git
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
   Add your Supabase credentials to `.env.local`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Verify everything works**
   - Visit `http://localhost:5173` for the public view
   - Visit `http://localhost:5173/admin` for the admin panel

## 📋 How to Contribute

### Reporting Issues

Before creating an issue, please:
1. **Search existing issues** to avoid duplicates
2. **Use the issue templates** when available
3. **Provide detailed information** including:
   - Steps to reproduce the issue
   - Expected vs actual behavior
   - Screenshots or videos if applicable
   - Browser and OS information
   - Console errors (if any)

### Suggesting Features

We love feature suggestions! When proposing a new feature:
1. **Check existing feature requests** first
2. **Explain the use case** and why it would be valuable
3. **Provide mockups or examples** if possible
4. **Consider the scope** - start with smaller, focused features

### Submitting Pull Requests

1. **Create a new branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following our coding standards
3. **Test thoroughly** - ensure all existing functionality still works
4. **Write or update tests** if applicable
5. **Update documentation** if needed
6. **Commit with clear messages** (see commit guidelines below)
7. **Push to your fork** and create a pull request

## 🎯 Development Guidelines

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components (avoid modifying)
│   ├── AdminView.tsx   # Admin dashboard
│   ├── PublicView.tsx  # Public link page
│   ├── LinkCard.tsx    # Link management
│   ├── ThemeCustomizer.tsx # Theme editor
│   └── ...
├── lib/                # Utilities and configurations
│   ├── auth.ts         # Authentication system
│   ├── theme.ts        # Theme management
│   ├── utils.ts        # Helper functions
│   └── supabase-data.ts # Database operations
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
└── assets/             # Static assets
```

### Coding Standards

#### TypeScript
- Use **TypeScript** for all new code
- Define proper **interfaces** and **types**
- Avoid `any` types - use proper typing
- Use **strict mode** settings

#### React
- Use **functional components** with hooks
- Follow **React best practices**
- Use **proper prop types** and interfaces
- Implement **error boundaries** where appropriate

#### Styling
- Use **Tailwind CSS** for styling
- Follow **existing design patterns**
- Use **shadcn/ui components** when possible
- Maintain **responsive design** principles

#### Code Quality
- Follow **ESLint** rules (run `npm run lint`)
- Use **meaningful variable names**
- Write **clear comments** for complex logic
- Keep functions **small and focused**

### Component Guidelines

#### Creating New Components
```typescript
// components/MyComponent.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface MyComponentProps {
  title: string;
  onAction: (data: string) => void;
  isLoading?: boolean;
}

export const MyComponent = ({ title, onAction, isLoading = false }: MyComponentProps) => {
  const [state, setState] = useState<string>("");

  const handleClick = () => {
    onAction(state);
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? "Loading..." : "Submit"}
      </Button>
    </Card>
  );
};
```

#### Theme Integration
When creating components that should respect the theme:
```typescript
// Use CSS custom properties for theme colors
<div className="bg-card text-foreground border-border">
  <h3 className="text-primary">Themed Content</h3>
</div>

// For dynamic styling, use the theme utilities
import { applyTheme } from "@/lib/theme";
```

### Database Guidelines

#### Supabase Integration
- Use the existing **Supabase client** from `@/integrations/supabase/client`
- Follow **existing patterns** for database operations
- Implement **proper error handling**
- Use **TypeScript types** for database schemas

#### Data Operations
```typescript
// lib/supabase-data.ts example
export const createLink = async (linkData: LinkData): Promise<LinkData> => {
  try {
    const { data, error } = await supabase
      .from('links')
      .insert(linkData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating link:', error);
    throw error;
  }
};
```

### Security Considerations

- **Never expose sensitive data** in client-side code
- Use **proper authentication** checks
- **Validate all inputs** on both client and server
- Follow **OWASP security guidelines**
- Use **environment variables** for secrets

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Writing Tests
- Write **unit tests** for utility functions
- Write **integration tests** for components
- Test **error scenarios** and edge cases
- Maintain **good test coverage**

Example test:
```typescript
// __tests__/components/LinkCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LinkCard } from '@/components/LinkCard';

describe('LinkCard', () => {
  const mockLink = {
    id: '1',
    title: 'Test Link',
    url: 'https://example.com',
    description: 'Test description'
  };

  it('renders link information correctly', () => {
    render(<LinkCard link={mockLink} onUpdate={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Test Link')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});
```

## 📝 Commit Guidelines

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(theme): add gradient direction selector
fix(auth): resolve session expiry issue
docs(readme): update installation instructions
style(components): improve button hover states
refactor(utils): simplify theme application logic
test(auth): add authentication flow tests
chore(deps): update dependencies
```

## 🎨 Design Guidelines

### UI/UX Principles
- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure WCAG compliance
- **Performance**: Optimize for speed and responsiveness
- **Mobile-first**: Design for mobile, enhance for desktop

### Color Usage
- Use **CSS custom properties** for theme colors
- Maintain **sufficient contrast** ratios
- Support **both light and dark** themes
- Test with **color blindness** simulators

### Animation Guidelines
- Use **subtle animations** for better UX
- Keep animations **under 300ms** for interactions
- Use **easing functions** for natural motion
- Provide **reduced motion** options

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped appropriately
- [ ] Security review completed
- [ ] Performance impact assessed

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: For questions and general discussion
- **Discord**: Join our community chat
- **Issues**: For bug reports and feature requests

### Maintainer Contact
- Create an issue for **technical questions**
- Use discussions for **general questions**
- Email for **security concerns**: security@yourapp.com

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Hall of Fame** for outstanding contributions

## 📄 License

By contributing to Lynx, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

Thank you for contributing to Lynx! Your efforts help make this project better for everyone. 🎉
