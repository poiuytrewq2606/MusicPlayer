# 🎵 Mume — React Native Music Player

A music streaming app built with React Native (Expo) and TypeScript, powered by the JioSaavn API. Features background playback, queue management, search with pagination, and a polished dark UI.

## 📱 Screenshots

| Home Screen | Player Screen | Search Screen | Queue Screen |
|:-----------:|:-------------:|:-------------:|:------------:|
| Trending, Recommended, Artists | Vinyl animation, seek bar, controls | Tabbed search with pagination | Drag-to-reorder queue |

## 🏗️ Architecture

### Tech Stack

| Technology | Purpose |
|---|---|
| **React Native (Expo)** | Cross-platform mobile framework |
| **TypeScript** | Type safety across the codebase |
| **React Navigation v6** | Stack + Bottom Tab navigation |
| **Zustand** | Lightweight state management |
| **react-native-track-player** | Background audio playback |
| **react-native-mmkv** | High-performance local storage |
| **JioSaavn API** | Music streaming data & audio URLs |

### Folder Structure

```
src/
├── api/                    # API service layer
│   └── saavnApi.ts         # JioSaavn API calls (search, songs, artists)
├── components/             # Reusable UI components
│   ├── AlbumCard.tsx       # Square album art + title
│   ├── ArtistCard.tsx      # Circular artist avatar
│   ├── MiniPlayer.tsx      # Persistent bottom player bar
│   ├── PlayerControls.tsx  # Play/pause, skip, shuffle, repeat
│   ├── ProgressBar.tsx     # Draggable seek bar
│   ├── SearchBar.tsx       # Search input with debounce
│   └── SongCard.tsx        # Song list item
├── hooks/
│   └── useDebounce.ts      # Input debounce hook
├── navigation/
│   └── AppNavigator.tsx    # Stack + BottomTab navigator
├── screens/
│   ├── HomeScreen.tsx      # Trending, recommended, artists
│   ├── PlayerScreen.tsx    # Full player with vinyl rotation
│   ├── QueueScreen.tsx     # Queue management
│   └── SearchScreen.tsx    # Tabbed search results
├── services/
│   └── trackPlayerService.ts  # Audio player setup + background service
├── stores/                 # Zustand state management
│   ├── usePlayerStore.ts   # Playback state, queue, shuffle/repeat
│   └── useSearchStore.ts   # Search results + pagination
├── theme/
│   └── index.ts            # Colors, typography, spacing tokens
├── types/
│   └── index.ts            # TypeScript interfaces
└── utils/
    ├── formatters.ts       # Duration, image URL, artist name helpers
    └── storage.ts          # MMKV wrapper with typed accessors
```

### State Management

**Zustand** was chosen over Redux Toolkit for this project because:

1. **Zero boilerplate** — No action creators, reducers, or dispatch. Direct state updates with `set()`.
2. **Selective re-renders** — Components subscribe to specific state slices, avoiding unnecessary re-renders.
3. **Native TypeScript** — Full inference without extra type definitions.
4. **Tiny bundle** — ~1KB vs Redux Toolkit's ~10KB.

#### Store Design

```
usePlayerStore
├── Playback: currentTrack, isPlaying, position, duration
├── Queue: queue[], currentIndex, originalQueue (for shuffle)
├── Modes: shuffleMode, repeatMode
├── History: recentlyPlayed[]
└── Persistence: auto-saves to MMKV on every change

useSearchStore
├── Query: search term, active tab
├── Results: songs[], artists[], albums[]
├── Pagination: page numbers, hasMore flags
└── Loading: isLoading, isLoadingMore, error
```

### Audio Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│ UI Controls │ ──▶ │ trackPlayerService│ ──▶ │ TrackPlayer   │
│ (React)     │     │ (Bridge Layer)   │     │ (Native Audio)│
└─────────────┘     └──────────────────┘     └───────────────┘
      ▲                      │                        │
      │                      │                        │
      │              ┌───────▼──────┐                 │
      └──────────────│ PlayerStore  │◀────────────────┘
                     │ (Zustand)    │  Events: play/pause/
                     └──────────────┘  track change/seek
```

- **Background playback** via `react-native-track-player` native module
- **Event-driven sync**: TrackPlayer events → Zustand store → React UI
- **Mini Player & Full Player** share the same Zustand store = always in sync

### Persistence Strategy

**MMKV** stores:
- Queue state (songs + current index)
- Recently played history
- Shuffle / repeat mode preferences
- Downloaded song file mappings

MMKV was chosen over AsyncStorage for its ~30x faster synchronous reads.

## 🚀 Setup & Running

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) — for building APK

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd MusicPlayer

# Install dependencies
npm install
```

### Building the APK (Cloud Build)

Since `react-native-track-player` requires native code, you need a **development build** (not Expo Go):

```bash
# Login to Expo
npx eas login

# Build APK in the cloud (no local SDK needed!)
npx eas build --platform android --profile preview

# The APK download link will be printed when the build completes
```

### Running Locally (with Android SDK)

```bash
# Generate native project files
npx expo prebuild

# Run on connected device/emulator
npx expo run:android
```

## 🎯 Features

### Core Features
- ✅ **Home Screen** — Trending songs, recommended tracks, popular artists
- ✅ **Search** — Debounced search with tabbed results (Songs/Artists/Albums) + pagination
- ✅ **Full Player** — Large artwork with vinyl rotation, seek bar, elapsed/remaining time
- ✅ **Mini Player** — Persistent bar synced with full player, play/pause + next controls
- ✅ **Queue Management** — Add, remove, reorder songs; persisted locally via MMKV
- ✅ **Background Playback** — Audio continues when app is minimized or screen is off

### Bonus Features
- ✅ **Shuffle Mode** — Randomizes queue, preserves original order for un-shuffle
- ✅ **Repeat Modes** — Off → Repeat All → Repeat One (cycling)
- ✅ **Offline Downloads** — Download songs for offline playback (UI ready)

### Extra Features
- ✅ **Recently Played** — History persisted across sessions
- ✅ **Pull-to-Refresh** — Refresh home screen content
- ✅ **Song Suggestions** — API-powered recommendations
- ✅ **Dark Theme** — Premium dark UI matching Figma design
- ✅ **Smooth Animations** — Vinyl rotation, progress bar, transitions

## ⚖️ Trade-offs & Decisions

| Decision | Rationale |
|---|---|
| **Zustand over Redux** | Minimal boilerplate for this app size; direct store access from services |
| **MMKV over AsyncStorage** | Synchronous, 30x faster; critical for real-time playback state |
| **PanResponder for seek bar** | Fine-grained control over touch gestures vs. Slider component |
| **API search for "trending"** | JioSaavn API lacks a dedicated trending endpoint; searching popular terms is a reasonable workaround |
| **Circular vinyl art** | Adds visual polish beyond the Figma; makes the player feel premium and dynamic |
| **No Expo Router** | Assignment explicitly required React Navigation v6 |

## 📝 API Reference

**Base URL:** `https://saavn.sumit.co`

| Endpoint | Used For |
|---|---|
| `GET /api/search/songs` | Song search with pagination |
| `GET /api/search/artists` | Artist search |
| `GET /api/search/albums` | Album search |
| `GET /api/songs/{id}` | Song details + download URLs |
| `GET /api/songs/{id}/suggestions` | Song recommendations |
| `GET /api/artists/{id}` | Artist details + top songs |

## 📄 License

MIT
