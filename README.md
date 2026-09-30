<div align="center">

# Aven Moderation

**A modular Discord moderation application built with TypeScript and discord.js.**

Designed around maintainability, explicit validation and clear separation of responsibilities.

</div>

---

## Overview

Aven Moderation is an open-source moderation application for Discord communities.

The project keeps Discord interaction handling, moderation logic, validation and persistence separated so individual components can evolve without concentrating application logic in a single entry point.

## Features

- Ban and kick moderation actions
- Member timeouts and timeout removal
- Persistent warning history
- Warning removal
- Bulk message deletion
- Moderation case identifiers
- Role hierarchy validation
- Discord permission validation
- Structured application logging
- SQLite persistence
- Environment validation
- Automated quality checks through GitHub Actions

## Commands

| Command | Description |
| --- | --- |
| `/ban` | Ban a member |
| `/kick` | Kick a member |
| `/timeout` | Temporarily timeout a member |
| `/untimeout` | Remove a member timeout |
| `/warn` | Record a warning |
| `/warnings` | View a member's warnings |
| `/clearwarnings` | Clear a member's warnings |
| `/purge` | Delete recent messages |
| `/ping` | Display gateway latency |

## Requirements

- Node.js 24 or newer
- A Discord application and bot token

## Installation

```bash
git clone https://github.com/yxrqyt-art/aven-moderation.git
cd aven-moderation
npm install
```

Copy `.env.example` to `.env` and configure the required values.

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DATABASE_PATH=./data/aven-moderation.db
LOG_LEVEL=info
```

Never commit the `.env` file or credentials.

## Development

```bash
npm run dev
```

Quality commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The CI workflow uses the committed lockfile with `npm ci` for reproducible dependency installation.

## Architecture

The application separates its primary responsibilities into commands, services, validators, repositories, database infrastructure, configuration and event handling.

Commands are responsible for Discord interaction boundaries. Moderation services coordinate application behavior. Validators enforce permission and hierarchy rules. Repositories own persistence concerns.

## Security

Credentials are supplied through environment variables and are excluded from version control.

Security issues should be reported privately. See `SECURITY.md` for details.

## License

Released under the MIT License.

---

<div align="center">
<sub>Aven · Software Developer</sub>
</div>
