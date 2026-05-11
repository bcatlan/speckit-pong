# Data Model: Match-End Leaderboard

**Feature**: Match-End Leaderboard  
**Date**: 2026-05-08  
**Status**: Design Phase

## Overview

This document defines the data structures and state management for the match-end leaderboard feature. Since this is an enhancement to an existing feature, most entities already exist in the game state.

## Entities

### 1. Match Result (Existing - No Changes Required)

**Description**: Represents the outcome of a completed match.

**Location**: Stored in `gameState` object (lines 180-238 in index.html)

**Attributes**:
| Attribute | Type | Description | Source |
|-----------|------|-------------|--------|
| `playerScore` | number | Player's final score | `gameState.playerScore` |
| `aiScore` | number | AI's final score | `gameState.aiScore` |
| `winner` | string \| null | Winner identifier: 'player' or 'ai' | `gameState.winner` |
| `difficulty` | string \| null | AI difficulty level used | `gameState.difficulty` |
| `currentScreen` | string | Screen state: 'MATCH_END' when showing leaderboard | `gameState.currentScreen` |

**Validation Rules**:
- `playerScore` >= 0
- `aiScore` >= 0
- At match end: exactly one of {`playerScore`, `aiScore`} must equal `GAME_CONFIG.RULES.WIN_SCORE` (currently 11)
- `winner` must be 'player' if `playerScore` >= WIN_SCORE, 'ai' if `aiScore` >= WIN_SCORE
- `currentScreen` must be 'MATCH_END' when leaderboard is displayed

**State Transitions**:
```
PLAYING → MATCH_END (when playerScore >= 11 or aiScore >= 11)
  ├─ Set winner = 'player' or 'ai'
  └─ Trigger renderMatchEndOverlay()

MATCH_END → PLAYING (on SPACE key)
  ├─ Reset playerScore = 0, aiScore = 0
  ├─ Reset winner = null
  └─ Call startMatch(difficulty)

MATCH_END → MENU (on ESC key)
  ├─ Reset playerScore = 0, aiScore = 0
  ├─ Reset winner = null
  └─ Set currentScreen = 'MENU'
```

**Related Code**:
- Set in `handleScore()` function (lines 439-472)
- Read by `renderMatchEndOverlay()` function (lines 866-910)
- Transitions handled in keyboard event listeners (lines 300-342)

---

### 2. Leaderboard Display Configuration (New - Extension of GAME_CONFIG)

**Description**: Visual formatting parameters for the leaderboard overlay.

**Location**: To be added to `GAME_CONFIG` object (Section 1, after line 142)

**Proposed Structure**:
```javascript
GAME_CONFIG.LEADERBOARD = {
    HEADER_FONT: 'bold 32px "Courier New"',
    RESULT_FONT: 'bold 56px "Courier New"',
    SCORE_LABEL_FONT: '28px "Courier New"',
    SCORE_VALUE_FONT: 'bold 48px "Courier New"',
    INSTRUCTION_FONT: '20px "Courier New"',
    
    WINNER_COLOR: '#7ED321',      // Green for winner
    LOSER_COLOR: '#AAA',          // Gray for loser
    NEUTRAL_COLOR: '#FFF',        // White for general text
    INSTRUCTION_COLOR: '#666',    // Dim gray for instructions
    
    HEADER_Y: 100,                // Y position for "FINAL SCORE" header
    RESULT_Y: 160,                // Y position for WIN/LOSE text
    SCORES_START_Y: 240,          // Y position for first score line
    SCORE_LINE_SPACING: 60,       // Vertical space between score lines
    INSTRUCTIONS_Y: 500           // Y position for navigation instructions
};
```

**Rationale**: Centralizing configuration follows existing pattern (see GAME_CONFIG.AUDIO, GAME_CONFIG.VFX). Makes values easily tunable without code changes.

---

### 3. Accessibility Announcement State (New)

**Description**: Manages screen reader announcements for match end state.

**Location**: New property in `gameState` object

**Proposed Addition**:
```javascript
gameState.lastAnnouncedScreen = null  // Track last announced screen to avoid duplicates
```

**Behavior**:
- When `currentScreen` transitions to 'MATCH_END' AND `lastAnnouncedScreen !== 'MATCH_END'`:
  - Generate announcement: "Match ended. [You win|You lose] [playerScore] to [aiScore]. Press space to play again or escape for menu."
  - Update hidden ARIA live region with announcement
  - Set `lastAnnouncedScreen = 'MATCH_END'`

---

## Relationships

```
gameState (root object)
├── playerScore ────┐
├── aiScore ────────┼──→ Used by renderMatchEndOverlay()
├── winner ─────────┤     to display leaderboard
├── difficulty ─────┘
├── currentScreen ──────→ Controls which render function called
└── lastAnnouncedScreen → Prevents duplicate announcements

GAME_CONFIG.LEADERBOARD
└── Display constants ──→ Used by renderMatchEndOverlay()
                          for consistent formatting
```

---

## Data Flow: Match End Sequence

```
1. Score event occurs in updateBall()
   ↓
2. handleScore('player' | 'ai') called
   ↓ Increments score
   ↓ Checks if score >= WIN_SCORE
   ↓
3. If match end:
   - Set gameState.winner = 'player' | 'ai'
   - Set gameState.currentScreen = 'MATCH_END'
   - Play audio sting (victory/defeat)
   ↓
4. Game loop calls renderMatchEndOverlay()
   ↓ Reads: playerScore, aiScore, winner, difficulty
   ↓ Uses: GAME_CONFIG.LEADERBOARD constants
   ↓
5. Canvas renders leaderboard UI
   ↓
6. If lastAnnouncedScreen !== 'MATCH_END':
   - Generate announcement text
   - Update ARIA live region
   - Set lastAnnouncedScreen = 'MATCH_END'
   ↓
7. Wait for user input (SPACE or ESC)
   ↓
8. On input → transition to PLAYING or MENU
   - Reset scores and winner
   - Reset lastAnnouncedScreen = null
```

---

## Validation Requirements (From Spec)

From **FR-002**: "Leaderboard MUST show both players' final scores clearly and prominently"
- **Test**: Verify both `playerScore` and `aiScore` rendered via `ctx.fillText()` calls

From **FR-003**: "Leaderboard MUST indicate which player won the match"
- **Test**: Verify winner text ("YOU WIN!" or "YOU LOSE") based on `gameState.winner` value
- **Test**: Verify winner's score uses distinct color (green) vs. loser's score (gray)

From **FR-007**: "Leaderboard MUST display player identifiers"
- **Test**: Verify labels "YOU:" and "AI:" rendered before scores

From **SC-002**: "100% of completed matches display the leaderboard with accurate final scores"
- **Test**: Verify `playerScore` and `aiScore` values in rendered output match `gameState` values

---

## Edge Cases

### Tie Game (Currently Impossible)
- **Current Behavior**: First to WIN_SCORE (11) wins, ties cannot occur
- **Data Impact**: None - `winner` is always 'player' or 'ai', never 'tie'
- **Future Consideration**: If tiebreaker rules added, would need `winner = 'tie'` state

### Very Long Player Names (Future Feature)
- **Current State**: Players labeled as "YOU" and "AI" (fixed strings)
- **Data Impact**: None currently
- **Future Consideration**: If custom names added, would need `maxNameLength` validation and text truncation

### Mid-Match Quit
- **Current Behavior**: No quit handler implemented; user can only pause (ESC)
- **Data Impact**: Match state persists during pause; no partial results shown
- **Spec Edge Case**: "What happens if player quits mid-match" - currently not applicable

---

## Persistence Requirements

**None** - All match data is ephemeral (in-memory only). When user navigates away from MATCH_END screen:
- Scores reset to 0
- Winner reset to null
- No historical match data stored

This aligns with specification assumption: "Leaderboard displays results for the current match only (no historical match tracking in v1)"

---

## Summary

### New Data Structures
1. `GAME_CONFIG.LEADERBOARD` - Display configuration constants
2. `gameState.lastAnnouncedScreen` - Accessibility state tracker

### Existing Data (No Changes)
- `gameState.playerScore` - Already correct
- `gameState.aiScore` - Already correct
- `gameState.winner` - Already correct
- `gameState.currentScreen` - Already correct

### Key Invariants
- `playerScore` + `aiScore` >= WIN_SCORE when `currentScreen === 'MATCH_END'`
- `winner !== null` when `currentScreen === 'MATCH_END'`
- Exactly one score equals WIN_SCORE at match end
