<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Coinminer // CORE Interface v2

This release delivers a fully interactive upgrade to the retro-futuristic CORE terminal. Track your credits, run refinery jobs, shop for gear, and even toggle illicit cheat codes while chatting with the AI overseer.

## Feature Highlights

- **Rich terminal gameplay loop** – Built-in commands for status checks, inventory management, shopping, refinery control, and cheat execution.
- **Interactive modules** – Dedicated views for the market, refinery, and cheat console with button-driven shortcuts for every action.
- **Refinery automation** – Timed contracts reward credits and log completions even while you explore other modules.
- **Offline-friendly AI** – A local simulation keeps CORE responsive when no Gemini API key is provided; plug in the key for live responses.
- **Command history & timestamps** – Navigate past commands with the arrow keys and review every exchange with precise timestamps.

## Quick Start

### Prerequisites
- Node.js 18+

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Create a `.env.local` file and provide your Gemini API key so CORE can use live intelligence:
   ```bash
   VITE_API_KEY=your_api_key_here
   ```
   Without a key, the interface automatically falls back to the local simulation.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided URL in your browser to access CORE.

## Built-in Terminal Commands

| Command | Description |
| --- | --- |
| `help` | Display the command manual. |
| `status` | Show your current rank, credits, heat, and refinery summary. |
| `inventory` | List all purchased gear and their benefits. |
| `shop list` | Review every item available in the market. |
| `buy <item id>` | Purchase an item if you have enough credits. |
| `refinery status` | Inspect the refinery, including active and completed jobs. |
| `refinery start <job id>` | Queue a refinery contract. |
| `cheat <code>` | Trigger an unlocked cheat routine. |
| `view <terminal|shop|refinery|cheats>` | Change the active panel. |
| `clear` | Wipe the terminal history. |

Enjoy the upgraded CORE experience, operative.
