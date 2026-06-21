# ☀️ Turing's Solstice

![Turing's Solstice](public/icons.svg)

**An action-packed runner game blending logic, survival, and the legacy of Alan Turing, inspired by the June Solstice.**

---

## 🎮 About the Game

You control **SOL-42**, an artificial intelligence created to maintain balance between Light and Darkness. The **SOL-ENIGMA** machine, responsible for Day and Night transitions, began generating unstable codes. To restore order, you must traverse an ever-changing world, dodging obstacles, collecting energy, and deciphering codes.

---

## 🎮 Play the Game

> **[🌐 Play Turing's Solstice](https://turing-solstice.vercel.app)**

---

## ✨ Features

- 🏃 **Fast-paced runner** with obstacles, energy orbs, and platforms
- 🌅 **Dynamic Day/Night transitions**
- 🧠 **Procedural puzzle system** (local + Gemini API)
- 🤖 **AI interactions** with SOL-ENIGMA during gameplay
- 💀 **Hard Mode** - More obstacles, less energy
- 👁️ **Turing Vision** - Matrix-style visual effects
- 🎨 **Spectrum Mode** - Psychedelic color effects
- 🔐 **The Last Code** - Phase 1: Enigma Machine + Phase 2: Turing Test
- 🌐 **Portuguese and English support** (auto-detection)
- 📊 **Personal ranking** (localStorage)
- 🌍 **Global ranking** (JSONBin.io)
- 📱 **Responsive** (desktop + mobile)
- 🎨 **7 obstacle types** with animations
- ⏸️ **Pause button** (visible during gameplay)

---

## 🚀 Technologies

- **TypeScript** - Main language
- **Vite** - Build tool
- **Canvas API** - Game rendering
- **Gemini API** - Puzzle generation and interactions
- **JSONBin.io** - Global ranking storage

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/justino-code/turing-solstice.git

# Enter the directory
cd turing-solstice

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Start development server
yarn dev
```

---

## ⚙️ Configuration (.env)

```env
# Gemini API
VITE_GEMINI_API_KEY=your_api_key
VITE_GEMINI_MODEL=gemini-2.5-flash-lite
VITE_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models

# JSONBin.io (Global Ranking)
VITE_JSONBIN_API_KEY=your_api_key
VITE_JSONBIN_BIN_ID=your_bin_id
VITE_JSONBIN_API_URL=https://api.jsonbin.io/v3/b
```

---

## 🎯 Controls

| Key | Action |
|-----|--------|
| `SPACE` / `↑` / `W` | Jump (double jump available) |
| `ESC` / `⏸️ Button` | Pause/Resume |
| `H` | Toggle Hard Mode |
| `V` | Toggle Turing Vision |
| `S` | Toggle Spectrum Mode |
| `M` | Open Ranking screen |
| `R` | Restart game |

---

## 🏗️ Project Structure

```
src/
├── constants/        # Configuration and constants
├── controllers/      # Controllers (UI, Input)
├── core/             # Game core (Game, Managers, Handlers)
├── data/             # Static data (interactions)
├── entities/         # Entities (Player, Obstacle, Platform, EnergyOrb)
├── registries/       # Obstacle registry system
├── services/         # Services (Gemini, Ranking, Turing Test)
├── systems/          # Systems (Render, Enigma, Interaction)
├── types/            # TypeScript types
├── utils/            # Utilities (helpers, i18n)
└── views/            # UI views (separated from controllers)
```

---

## 🏆 Ranking System

- **Personal**: Top 10 scores saved in browser localStorage
- **Global**: Top 20 scores synced via JSONBin.io
- Each player is identified by a unique fingerprint
- Customizable player name (optional)

---

## 🧪 Build

```bash
# Production build
yarn build

# Preview the build
yarn preview
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT

---

## 👤 Author

**Justino Code**

- GitHub: [@justino-code](https://github.com/justino-code)
- Project Link: [https://github.com/justino-code/turing-solstice](https://github.com/justino-code/turing-solstice)

---

## 🙏 Credits

- **Alan Turing** - Inspiration for puzzles and the Turing Test
- **June Solstice** - Visual and narrative theme
- **Google Gemini** - Procedural content generation
- **JSONBin.io** - Global ranking storage

---

## 📸 Screenshots

> [View all screenshots](docs/SCREENSHOTS.md)

---

> *"Can machines think?"* - Alan Turing, 1950