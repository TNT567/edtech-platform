# Contributing to EdTech Platform

Thank you for your interest in contributing to the EdTech Platform! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- JDK 17+
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/edtech-platform.git`
3. Copy environment variables: `cp .env.example .env`
4. Fill in your API keys in `.env`
5. Start the development environment: `docker-compose up -d`
6. Access the application at http://localhost:5173

## 📝 Code Style Guidelines

### Java (Backend)
- Follow Google Java Style Guide
- Use meaningful variable and method names
- Add JavaDoc comments for public methods
- Maximum line length: 120 characters
- Use `@Autowired` constructor injection
- Follow Spring Boot best practices

### TypeScript/React (Frontend)
- Use TypeScript strict mode
- Follow React functional components with hooks
- Use meaningful component and variable names
- Maximum line length: 100 characters
- Use Prettier for formatting
- Follow ESLint rules

### Code Formatting
```bash
# Backend (Java)
mvn spotless:apply

# Frontend (TypeScript/React)
cd edtech-frontend
npm run lint:fix
npm run format
```

## 🧪 Testing Requirements

### Backend Testing
- Write unit tests for all service classes
- Write integration tests for controllers
- Write property-based tests for core algorithms (BKT, AI)
- Minimum test coverage: 80%

### Frontend Testing
- Write unit tests for utility functions
- Write component tests for React components
- Write integration tests for user flows
- Use React Testing Library

### Running Tests
```bash
# Backend tests
mvn test

# Frontend tests
cd edtech-frontend
npm test

# All tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🔄 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run all tests
   mvn test
   cd edtech-frontend && npm test
   
   # Test Docker build
   docker-compose up --build
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `test:` for adding tests
   - `refactor:` for code refactoring

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a pull request using the provided template.

## 📋 Issue Guidelines

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Include relevant logs

### Feature Requests
- Use the feature request template
- Explain the problem you're solving
- Describe your proposed solution
- Consider implementation impact

## 🏗️ Architecture Guidelines

### Backend Architecture
- Follow microservice principles within modules
- Use dependency injection
- Implement proper error handling
- Follow RESTful API design
- Use appropriate HTTP status codes

### Frontend Architecture
- Use React functional components
- Implement proper state management
- Follow component composition patterns
- Use TypeScript for type safety
- Implement proper error boundaries

### Database Guidelines
- Use meaningful table and column names
- Add proper indexes for performance
- Include migration scripts for schema changes
- Follow normalization principles

## 🔒 Security Guidelines

- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines

## 📚 Documentation

### Code Documentation
- Add JavaDoc for Java classes and methods
- Add JSDoc for TypeScript functions
- Include inline comments for complex logic
- Update README for significant changes

### API Documentation
- Update OpenAPI/Swagger specifications
- Include request/response examples
- Document error responses
- Update API changelog

## 🎯 Contribution Areas

We welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Test coverage improvements
- Documentation enhancements

### Medium Priority
- New educational features
- UI/UX improvements
- Mobile responsiveness
- Accessibility improvements

### Low Priority
- Code refactoring
- Developer tooling
- Build process improvements

## 📞 Getting Help

- Create an issue for questions
- Join our discussions in GitHub Discussions
- Check existing documentation first
- Be respectful and constructive

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to EdTech Platform! 🎓