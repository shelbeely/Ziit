# GitHub Copilot Agent Instructions

## Skill-First Development Policy

This repository uses [skills.sh](https://skills.sh) for reusable agent capabilities. Follow these rules when working on this codebase:

### Skills Discovery and Usage

1. **Skills are available via npx skills**
   - All skills can be invoked using `npx skills <command>`
   - Skills provide reusable, battle-tested implementations

2. **Search before implementing**
   - Before implementing new features, always search for relevant skills:
     ```bash
     npx skills find <query>
     ```
     Example: `npx skills find testing` or `npx skills find linting`
   - Check `.github/skills/` directory for already installed skills

3. **Prefer skills over custom implementations**
   - When a skill exists that solves your problem, use it
   - Skills are maintained, tested, and follow best practices
   - Only write custom code when no suitable skill exists

4. **Install skills dynamically**
   - When you discover a useful skill, install it:
     ```bash
     npx skills add <skill-name>
     ```
   - Document installed skills in `.github/skills/README.md`

5. **Treat skills as reusable capabilities**
   - Installed skills extend the agent's capabilities
   - Skills can be composed together for complex workflows
   - Reference skills in documentation and comments

### Workflow

1. **Check existing skills first**: Look in `.github/skills/` for available capabilities
2. **Search for new skills**: Use `npx skills find` to discover relevant tools
3. **Evaluate and install**: Install skills that provide value to the project
4. **Document**: Update `.github/skills/README.md` when adding new skills
5. **Use**: Incorporate skills into your implementation

### Examples

```bash
# Find skills related to testing
npx skills find testing

# Install a skill from agent-skills repository
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices

# List installed skills
npx skills list
```

## Additional Guidelines

- Keep dependencies minimal and well-justified
- Follow existing code style and conventions
- Write clear commit messages
- Test changes before committing
