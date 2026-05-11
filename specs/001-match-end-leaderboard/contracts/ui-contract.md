# UI Contract: Match-End Leaderboard

**Feature**: Match-End Leaderboard  
**Contract Type**: User Interface  
**Version**: 1.0.0  
**Date**: 2026-05-08

## Overview

This contract defines the user-facing interface for the match-end leaderboard screen. It specifies what users will see, what actions they can take, and how the system responds. This serves as the "public API" for players interacting with the end-of-match experience.

## Screen State: MATCH_END

### Trigger Conditions

The leaderboard screen appears when:
- **Condition 1**: Player reaches winning score (`playerScore >= RULES.WIN_SCORE`)
- **Condition 2**: AI reaches winning score (`aiScore >= RULES.WIN_SCORE`)

**Timing**: Appears within 1 second of match-ending condition (SC-001 requirement)

---

## Visual Layout (Canvas Rendering)

### Screen Elements

#### 1. Background Overlay
- **Type**: Semi-transparent overlay
- **Color**: `rgba(0, 0, 0, 0.8)` (80% black)
- **Position**: Fullscreen (800×600px)
- **Purpose**: Dims game court behind leaderboard for focus

#### 2. Header
- **Text**: "FINAL SCORE"
- **Font**: `bold 32px "Courier New"`
- **Color**: `#FFF` (white)
- **Position**: Centered horizontally, Y = 100px
- **Alignment**: Center

#### 3. Match Result
- **Text**: 
  - `"YOU WIN!"` if `gameState.winner === 'player'`
  - `"YOU LOSE"` if `gameState.winner === 'ai'`
- **Font**: `bold 56px "Courier New"`
- **Color**: `#FFF` (white)
- **Position**: Centered horizontally, Y = 160px
- **Alignment**: Center

#### 4. Score Display

**Layout**:
```
YOU:    11
AI:      7
```

**Player Score Line**:
- Label: "YOU:"
  - Font: `28px "Courier New"`
  - Color: `#7ED321` (green) if winner, `#AAA` (gray) if loser
  - Position: X = 280px, Y = 240px
  - Alignment: Right
- Value: `{playerScore}`
  - Font: `bold 48px "Courier New"`
  - Color: `#7ED321` (green) if winner, `#AAA` (gray) if loser
  - Position: X = 520px, Y = 240px
  - Alignment: Right

**AI Score Line**:
- Label: "AI:"
  - Font: `28px "Courier New"`
  - Color: `#7ED321` (green) if winner, `#AAA` (gray) if loser
  - Position: X = 280px, Y = 300px
  - Alignment: Right
- Value: `{aiScore}`
  - Font: `bold 48px "Courier New"`
  - Color: `#7ED321` (green) if winner, `#AAA` (gray) if loser
  - Position: X = 520px, Y = 300px
  - Alignment: Right

**Spacing**: 60px vertical spacing between score lines

#### 5. Feedback Mechanism (Existing - Preserved)
- **Thumbs Up Button**: Position X = 320px, Y = 390px
- **Thumbs Down Button**: Position X = 420px, Y = 390px
- **Purpose**: User satisfaction feedback (existing feature, not modified)

#### 6. Navigation Instructions
- **Text 1**: "SPACE to rematch"
  - Font: `20px "Courier New"`
  - Color: `#666` (dim gray)
  - Position: Centered horizontally, Y = 500px
- **Text 2**: "ESC for menu"
  - Font: `20px "Courier New"`
  - Color: `#666` (dim gray)
  - Position: Centered horizontally, Y = 530px

---

## User Actions (Keyboard Input)

### Action 1: Rematch
- **Trigger**: User presses `SPACE` key
- **Condition**: `gameState.currentScreen === 'MATCH_END'`
- **System Response**:
  1. Call `startMatch(gameState.difficulty)`
  2. Reset `playerScore = 0`, `aiScore = 0`
  3. Set `currentScreen = 'PLAYING'`
  4. Reset ball and paddles to starting positions
  5. Begin new match with same difficulty
- **Timing**: Transition completes within 100ms (instantaneous to user)

### Action 2: Return to Menu
- **Trigger**: User presses `ESC` key
- **Condition**: `gameState.currentScreen === 'MATCH_END'`
- **System Response**:
  1. Set `currentScreen = 'MENU'`
  2. Reset `playerScore = 0`, `aiScore = 0`, `winner = null`
  3. Stop any playing audio
  4. Render main menu
- **Timing**: Transition completes within 100ms

### Action 3: Provide Feedback (Existing)
- **Trigger**: User clicks thumbs up/down buttons
- **System Response**: Update `gameState.matchFeedback` (logged to console)
- **Note**: This is existing functionality, preserved but not enhanced in this feature

---

## Accessibility Contract (Screen Readers)

### ARIA Live Region

**Element**:
```html
<div id="screenReaderAnnouncement" 
     role="status" 
     aria-live="polite" 
     aria-atomic="true"
     style="position: absolute; left: -10000px; width: 1px; height: 1px;">
</div>
```

**Announcement Content**:
When `currentScreen` transitions to `'MATCH_END'`:
```
"Match ended. [You win|You lose] [playerScore] to [aiScore]. Press space to play again or escape for menu."
```

**Examples**:
- Victory: "Match ended. You win 11 to 7. Press space to play again or escape for menu."
- Defeat: "Match ended. You lose 5 to 11. Press space to play again or escape for menu."

**Timing**: Announced within 500ms of screen transition

**Prevention of Duplicates**: 
- Track `gameState.lastAnnouncedScreen`
- Only announce if `lastAnnouncedScreen !== 'MATCH_END'`
- Reset `lastAnnouncedScreen = null` when leaving MATCH_END screen

---

## Performance Contract

### Rendering Performance
- **Target**: Maintain 60 FPS (16ms frame budget)
- **Measured**: Leaderboard rendering time < 2ms
- **No Animation**: Static display (no continuous canvas redraws beyond game loop)

### Memory
- **No Allocations**: Leaderboard uses existing game state, no new object creation
- **No Leaks**: All references cleared when leaving MATCH_END screen

---

## Edge Cases & Error Handling

### Case 1: Invalid Winner State
- **Scenario**: `gameState.winner` is `null` when `currentScreen === 'MATCH_END'`
- **System Response**: Fallback to "MATCH ENDED" header text, display scores without winner emphasis
- **Likelihood**: Should never occur (defensive programming only)

### Case 2: Score Values Out of Bounds
- **Scenario**: Negative scores or scores > 999
- **System Response**: Display as-is (no clamping), but log warning to console
- **Likelihood**: Should never occur (scores only increment in `handleScore()`)

### Case 3: Rapid Key Presses
- **Scenario**: User presses SPACE repeatedly during transition
- **System Response**: Ignore duplicate inputs until `currentScreen` fully transitions
- **Implementation**: State change is synchronous, subsequent inputs apply to new screen state

---

## Contract Versioning

### Version 1.0.0 (This Document)
- Initial leaderboard UI contract
- Defines visual layout, keyboard actions, accessibility features
- Compatible with game state as of 2026-05-08

### Future Compatibility Notes
If any of the following change, this contract must be updated:
- `GAME_CONFIG.RULES.WIN_SCORE` value
- Screen resolution (currently 800×600px)
- Player identifier labels (currently "YOU" and "AI")
- Keyboard control scheme

---

## Testing Contract Compliance

### Visual Verification
1. Trigger match end (player wins at 11-7)
2. Verify "YOU WIN!" displayed
3. Verify "YOU: 11" in green, "AI: 7" in gray
4. Verify navigation instructions visible

### Keyboard Verification
1. From MATCH_END screen, press SPACE → Confirm match restarts
2. From MATCH_END screen, press ESC → Confirm menu appears

### Accessibility Verification
1. Trigger match end with screen reader active (NVDA/JAWS)
2. Verify announcement reads: "Match ended. You win [score] to [score]. Press space to play again or escape for menu."
3. Verify no duplicate announcements on subsequent frames

### Performance Verification
1. Open browser DevTools Performance profiler
2. Trigger match end
3. Measure `renderMatchEndOverlay()` execution time
4. Confirm < 2ms per frame
5. Confirm 60 FPS maintained (no frame drops)

---

## Summary

This contract defines:
- ✅ **Visual Elements**: Header, result text, score display, instructions
- ✅ **User Actions**: SPACE (rematch), ESC (menu)
- ✅ **Accessibility**: ARIA announcements for screen readers
- ✅ **Performance**: <2ms render time, 60 FPS maintained
- ✅ **Edge Cases**: Invalid state handling, rapid inputs

**Compliance**: All elements align with functional requirements (FR-001 through FR-007) and success criteria (SC-001 through SC-004) from the feature specification.
