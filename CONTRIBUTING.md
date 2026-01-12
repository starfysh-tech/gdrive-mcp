# Contributing to gdrive-mcp

Thank you for your interest in contributing to gdrive-mcp! This document provides guidelines for contributing to the project.

---

## How to Contribute

### Reporting Bugs

Found a bug? Help us fix it:

1. **Check existing issues** — Search [<img src="assets/github-icon.png" width="14" alt="GitHub"> GitHub Issues](https://github.com/starfysh-tech/gdrive-mcp/issues) to see if it's already reported
2. **Create a new issue** — Include:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node.js version, package version)
   - Relevant error messages or logs

### Suggesting Features

Have an idea for improvement?

1. **Check existing issues** — See if someone already suggested it
2. **Create a feature request** — Explain:
   - What problem it solves
   - How it should work
   - Why it would be useful to others

### Contributing Code

#### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/gdrive-mcp.git
cd gdrive-mcp

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Run tests (if available)
npm test
```

#### Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Follow existing code style
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes**:
   - Run `npm run build` to ensure it compiles
   - Test manually with Claude Desktop
   - Run `npm test` if tests exist

4. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Follow conventional commits format (e.g., `feat:`, `fix:`, `docs:`)

5. **Push and create a pull request**:
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a PR on [<img src="assets/github-icon.png" width="14" alt="GitHub"> GitHub](https://github.com/starfysh-tech/gdrive-mcp/pulls)
   - Describe what your changes do and why
   - Reference any related issues

6. **Wait for review**:
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Once approved, your PR will be merged

---

## Code Style Guidelines

- **TypeScript**: Use TypeScript for all new code
- **Naming**: Use camelCase for functions and variables
- **Formatting**: Follow the existing code style
- **Comments**: Add comments for complex logic
- **Error Handling**: Include proper error handling and user-friendly messages

---

## Working with Google APIs

When adding or modifying Google API functionality:

1. **Check API limitations** — Review official Google API documentation
2. **Test with real data** — Use your own Google Workspace account
3. **Handle errors gracefully** — Provide clear error messages
4. **Update documentation** — Document new features in README and docs/
5. **Consider OAuth scopes** — Only request necessary permissions

---

## Documentation

Good documentation helps everyone:

- Update `README.md` for user-facing changes
- Update `docs/` files for detailed changes
- Add JSDoc comments to new functions
- Include examples for new features

---

## Testing

While we don't have comprehensive automated tests yet:

- Test your changes manually
- Test with different Google Workspace file types
- Test error cases and edge conditions
- Verify backward compatibility

---

## Questions?

- **[<img src="assets/github-icon.png" width="14" alt="GitHub"> Open an issue](https://github.com/starfysh-tech/gdrive-mcp/issues)** for questions
- **Check [docs/](docs/)** for detailed documentation
- **Read the [MCP documentation](https://modelcontextprotocol.io/)** for protocol details

---

## Code of Conduct

Be respectful and considerate:

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

---

## License

By contributing to gdrive-mcp, you agree that your contributions will be licensed under the MIT License.

---

Thank you for making gdrive-mcp better! 🚀
