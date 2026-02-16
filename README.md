### For users confused why their account got deleted check this issue https://github.com/0pandadev/Ziit/issues/81

> [!NOTE]
> **Ziit-Agent: Enhanced time tracking for GitHub Copilot Coding Agent**
> 
> This is a specialized fork of [Ziit](https://github.com/0PandaDEV/Ziit) with first-class support for GitHub Copilot Coding Agent. Track both traditional coding activity and AI-assisted development sessions in one unified dashboard.

<p align="center">
   <img src="https://github.com/user-attachments/assets/bc6a1efd-2a7a-473a-8f09-ae75cafeba84"/>
</p>

<h3 align="center">
   Time tracking for developers using AI coding agents
</h3>

<div align="center">
    <a href="https://docs.ziit.app">Docs</a>
    <span>  •  </span>
    <a href="https://ziit.app/stats">Stats</a>
    <span>  •  </span>
    <a href="https://ziit.app/leaderboard">Leaderboard</a>
    <span>  •  </span>
    <a href="https://discord.gg/Y7SbYphVw9">Discord</a>
    <span>  •  </span>
    <a href="https://github.com/0PandaDEV/Ziit">Upstream: Ziit</a>
</div>

<br>

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v3/monitor/1ym1e.svg)](https://status.ziit.app)
 ![ziit](https://ziit.app/api/public/badge/cm98il90n0000o52c3my0bf5p/ziit)


> [!IMPORTANT]
> Upvote Ziit on [AlternativeTo](https://alternativeto.net/software/ziit/about/), [ProductHunt](https://www.producthunt.com/posts/ziit), [PeerPush](https://peerpush.net/p/ziit) to help me promote it.

<details>
  <summary><kbd>Star History</kbd></summary>
  <a href="https://starchart.cc/0PandaDEV/Ziit">
    <picture>
      <img width="100%" src="https://starchart.cc/0PandaDEV/ziit.svg?variant=adaptive">
    </picture>
  </a>
</details>

## What is Ziit-Agent?

Ziit-Agent is a specialized fork of Ziit (pronounced 'tseet'), an open-source, self-hostable alternative to WakaTime. While maintaining all of Ziit's original capabilities, Ziit-Agent adds comprehensive GitHub Copilot Coding Agent integration to track AI-assisted development workflows alongside traditional coding activity.

Like the original Ziit, it provides a clean, minimal, and fast dashboard for displaying coding statistics, while ensuring privacy by keeping all data on your own server. It tracks coding activity such as projects, languages, editors, files, branches, operating systems, and time spent coding—all presented in a familiar interface inspired by Plausible Analytics.

![Ziit](https://github.com/user-attachments/assets/bf8e8d72-3181-47e7-924f-537c74f68819)

## About This Fork

Ziit-Agent enhances the original Ziit with first-class support for **GitHub Copilot Coding Agent**, enabling comprehensive tracking of AI-assisted development workflows. Key enhancements include:

- **Hooks-based integration** with GitHub Copilot Coding Agent
- **Extended heartbeat schema** to capture agent sessions, prompts, tool usage, and errors
- **Rich metadata tracking** for AI coding sessions including tool names, event types, and custom context
- **Cross-platform support** with both Bash and PowerShell hook scripts
- **Privacy-first approach** where all AI coding activity data stays on your Ziit instance

Ziit-Agent is perfect for developers who want to understand how they work with AI coding assistants while maintaining privacy and control over their data.

## Features

- Time tracking directly from VS Code to your Ziit instance of choice.
- **GitHub Copilot Coding Agent integration** - Track your AI-assisted coding sessions with hooks support.
- Filtering using different time ranges.
- Clean & Minimal dashboard showing only the information needed.
- Login with GitHub or Email and Password.
- Import Data from Wakatime or a WakAPI Instance.
- Saves data about your current project, OS, editor, file, language and git branch.
- Extended heartbeat data including category, event types, tool usage, and custom metadata.
- Badges to embed coding time for a project into a README.
- Public stats page to see information from the whole Ziit instance.
- Public leaderboard to see who has the most coding hours.
- More to come...

## How to use Ziit-Agent

First [setup an instance](https://docs.ziit.app/deploy) or sign up on the public one <https://ziit.app> then install the extension by searching for "Ziit" in your favorite IDE.

Supported IDE's:

- [VS Code (Including all forks)](https://docs.ziit.app/extensions/vscode)
- [JetBrains](https://plugins.jetbrains.com/plugin/27391-ziit)

For more details on how to setup the IDE extensions checkout the [docs](https://docs.ziit.app/extensions).

### GitHub Copilot Coding Agent Integration

Track your AI-assisted coding sessions by enabling hooks support. See [`.github/hooks/README.md`](.github/hooks/README.md) for detailed setup instructions.

Quick setup:
1. Set your Ziit API key: `export ZIIT_API_KEY="your-api-key"`
2. Hooks automatically activate when using GitHub Copilot Coding Agent
3. View AI coding activity in your Ziit dashboard

## Development

### Prerequisites

- [Bun](https://bun.sh/)
- [TimescaleDB](https://docs.timescale.com/self-hosted/latest/install/installation-docker/)

### Setup

1. **Install dependencies:**

   ```bash
   bun i
   ```

2. **Database Migrations:**
   Apply database schema changes.

   ```bash
   bunx prisma migrate dev
   ```

3. **Set the environment variables:**
   It is imporatnt that you make a `.env` using the [.env.example](https://github.com/0PandaDEV/Ziit/blob/main/.env.example) as a template and set the correct values. All the instructions needed are in the example file.

4. **Run the development server:**
   The server will start on `http://localhost:3000`.

   ```bash
   bun dev
   ```

## Upstream & Contributing

Ziit-Agent is a fork of [Ziit](https://github.com/0PandaDEV/Ziit) by [0PandaDEV](https://github.com/0PandaDEV). 

### Relationship with Upstream

- **Core features** are maintained in sync with upstream Ziit
- **Agent-specific features** are unique to this fork
- Bug fixes and improvements to core functionality may be contributed back to upstream

### Contributing

- For **Copilot/Agent integration issues**: Open an issue in this repository
- For **core Ziit features**: Consider contributing to [upstream Ziit](https://github.com/0PandaDEV/Ziit)
- See upstream's [CONTRIBUTING.md](https://github.com/0PandaDEV/Ziit/blob/main/CONTRIBUTING.md) for core contribution guidelines

## License

This project maintains the same license as the original Ziit project. See [LICENSE](LICENSE) for details.

## Credits

- **Original Ziit project**: [0PandaDEV/Ziit](https://github.com/0PandaDEV/Ziit)
- **GitHub Copilot Coding Agent integration**: Enhanced by this fork
- All contributors to the original Ziit project
