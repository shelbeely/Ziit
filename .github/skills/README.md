# Repository Skills

This directory contains references to installed skills from [skills.sh](https://skills.sh) that extend the GitHub Copilot agent's capabilities.

## What are Skills?

Skills are reusable, composable capabilities that agents can use to accomplish tasks more effectively. They provide:

- **Battle-tested implementations**: Skills are maintained and used across many projects
- **Consistent interfaces**: Skills follow standard patterns for easy integration
- **Reduced boilerplate**: Use existing solutions instead of reinventing the wheel
- **Enhanced capabilities**: Extend what agents can do without custom code

## Installed Skills

Skills installed in this repository:

Currently no skills are installed. Skills can be added from repositories like:
- `vercel-labs/agent-skills`: Collection of agent skills for React, Next.js, and more
  - Usage: `npx skills add vercel-labs/agent-skills --list` to see available skills

## How to Use Skills

### For Agents

1. **Check this directory first** - See what capabilities are already available
2. **Search for skills** - Use `npx skills find <query>` to discover new skills
3. **Install dynamically** - Add skills when they provide value: `npx skills add <skill-name>`
4. **Document additions** - Update this README when installing new skills

### For Developers

Skills are invoked through the skills CLI:

```bash
# Find skills
npx skills find <query>

# Install a skill
npx skills add <skill-name>

# List installed skills
npx skills list

# Get help
npx skills --help
```

## Skill Categories

Common skill categories that may be useful for this repository:

- **Code Quality**: Linters, formatters, code analyzers
- **Testing**: Test generators, test runners, coverage tools
- **Documentation**: Doc generators, API documentation
- **Build Tools**: Bundlers, compilers, optimization tools
- **Database**: Schema management, migrations, queries
- **API Development**: REST/GraphQL tools, API testing
- **Deployment**: CI/CD helpers, container tools

## Adding New Skills

When adding a skill:

1. Install it: `npx skills add <skill-name>`
2. Test it works: Verify the skill functions correctly
3. Document it: Add an entry to the "Installed Skills" section above
4. Commit: Include the skill reference in version control

## Resources

- [Skills.sh Documentation](https://skills.sh)
- [Available Skills Repository](https://github.com/vercel-labs/agent-skills)
- [Skills CLI Documentation](https://github.com/vercel-labs/skills-cli)
