# Zoid Editor

A free, open-source code editor with native AI integration, MCP server support, VS Code extension compatibility, real Git workflows, snippet manager, and a glassmorphism interface — built with Electron, React, and Monaco Editor.

<img width="1742" height="1012" alt="Zoid Editor screenshot" src="https://github.com/user-attachments/assets/e461a09a-db34-41c3-80e8-cf62d0e56179" />

## Features

- **Monaco Editor** — Full IntelliSense, syntax highlighting, multi-cursor, and code folding for every language
- **44+ AI Models** — BYOK for OpenAI (GPT-4o, GPT-4.1, o4), Anthropic (Claude Sonnet 4, Opus 4), Google (Gemini 2.5 Pro/Flash), Groq (Llama 3.3, DeepSeek R1), and OpenRouter. Free models and local Ollama/LM Studio auto-detection
- **MCP Server Support** — Connect AI to external tools via the Model Context Protocol. Manage filesystem, database, or custom MCP servers directly from the editor
- **Snippet Manager** — Save and organize reusable code snippets. Insert them into your editor with one click
- **Real Terminal** — Integrated xterm.js terminal connected to your system shell (auto-detects pwsh, PowerShell, zsh, bash across all platforms)
- **VS Code Extensions** — Browse and install extensions from the Open VSX registry directly within the editor
- **Git Integration** — Full Git workflow: stage, commit, branch, checkout, push, pull, diff — all from the built-in source control panel
- **Glassmorphism UI** — Black & white glassmorphism design with dark/light mode toggle, custom title bar, and smooth animations
- **Keyboard-Centric** — Command Palette (Ctrl+Shift+P), Ctrl+Tab navigation, and keyboard shortcuts for every action
- **Cross-Platform** — Windows (exe), macOS (dmg), Linux (tar.gz, AppImage, deb)

## Download

| Platform | Download | Size |
|----------|----------|------|
| Windows 10/11 (64-bit) | [Download .exe](https://github.com/itriedcoding/ZoidEditor/releases/download/v1.0.0/Zoid.Editor-Setup-1.0.0.exe) | 141 MB |
| macOS (Intel + Apple Silicon) | [Download .dmg](https://github.com/itriedcoding/ZoidEditor/releases/latest) | via CI |
| Linux (all distros) | [Download tar.gz](https://github.com/itriedcoding/ZoidEditor/releases/download/v1.0.0/Zoid.Editor-1.0.0-linux.tar.gz) | 16 MB |
| Linux (AppImage / deb) | [Latest Release](https://github.com/itriedcoding/ZoidEditor/releases/latest) | via CI |

## Getting Started

### Prerequisites

- **Windows 10/11**, **macOS 12+**, or **Linux** (x64)
- For AI features: API keys from [OpenAI](https://platform.openai.com), [Anthropic](https://console.anthropic.com), [Google AI](https://makersuite.google.com), or [Groq](https://console.groq.com). Or install [Ollama](https://ollama.ai) / [LM Studio](https://lmstudio.ai) for local models

### Installation

1. Download the installer for your platform from the [Releases page](https://github.com/itriedcoding/ZoidEditor/releases)
2. Run the installer
3. Launch Zoid Editor

### Building from Source

```bash
git clone https://github.com/itriedcoding/ZoidEditor.git
cd ZoidEditor
npm install
npm run dev                     # Development mode with hot reload
npm run electron:build:win      # Build Windows .exe installer
npm run electron:build:mac      # Build macOS .dmg (requires macOS)
npm run electron:build:linux    # Build Linux .AppImage + .deb (requires Linux)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Editor | Monaco Editor |
| Frontend | React 18, TypeScript, Vite |
| Desktop | Electron 31 |
| Terminal | xterm.js + xterm-addon-fit |
| Styling | Glassmorphism CSS (custom) |
| AI SDK | OpenAI, Anthropic, Google, Groq APIs |
| Git | simple-git |
| Extensions | Open VSX API |
| State | Zustand |
| MCP | Model Context Protocol (stdio) |
| CI/CD | GitHub Actions (3-platform matrix) |

## Architecture

```
ZoidEditor/
├── electron/          # Electron main process
│   ├── main.cjs       # Window mgmt, IPC handlers, terminal, git, MCP
│   └── preload.cjs    # Context bridge (IPC exposure)
├── src/               # React renderer
│   ├── components/    # UI components (Editor, Terminal, Sidebar, AIPanel, etc.)
│   ├── services/      # AI, GitHub, extensions, local detection
│   ├── store/         # Zustand state management
│   └── styles/        # Theme CSS
├── scripts/           # Build & utility scripts
├── .github/workflows/ # CI/CD workflows
├── website/           # Marketing website (Vercel)
└── public/            # Static assets
```

## Screenshots

<img width="1742" height="1012" alt="Zoid Editor screenshot" src="https://github.com/user-attachments/assets/e461a09a-db34-41c3-80e8-cf62d0e56179" />

*Zoid Editor with the glassmorphism dark theme, file tree sidebar, and integrated terminal.*

## CI/CD

This project uses GitHub Actions to build installers for all platforms on every release tag:

- **Windows**: NSIS installer (.exe)
- **macOS**: DMG + ZIP (Intel + Apple Silicon)
- **Linux**: AppImage + deb

To trigger a release build, push a tag:

```bash
git tag v1.1.0
git push origin v1.1.0
```

## License

MIT — see [LICENSE](LICENSE) for details.

Not affiliated with Microsoft or VS Code.