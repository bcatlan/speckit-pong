# Quickstart: Match-End Leaderboard Implementation

**Feature**: Match-End Leaderboard  
**Target Audience**: Developers implementing this feature  
**Time to Complete**: ~2 hours (following TDD)  
**Date**: 2026-05-08

## Overview

This guide walks you through implementing the enhanced match-end leaderboard feature. You'll modify an existing overlay to improve clarity, add accessibility features, and ensure constitution compliance.

---

## Prerequisites

### Knowledge Requirements
- JavaScript ES6+ basics
- HTML5 Canvas API (`fillText`, `fillRect`)
- Basic ARIA accessibility concepts
- Test-driven development (TDD) workflow

### Tools Needed
- Modern web browser (Chrome/Firefox with DevTools)
- Text editor
- Jest or Vitest (for testing)
- Screen reader for accessibility testing (NVDA/JAWS/VoiceOver)

### Files You'll Modify
- `index.html` - Main game file (all code inline)
  - Section 1: Configuration (add LEADERBOARD config)
  - Section 2: State Management (add lastAnnouncedScreen)
  - Section 7: Rendering (modify renderMatchEndOverlay)
  - Section 10: Initialization (add ARIA setup)

### Files You'll Create
- `tests/unit/leaderboard-state.test.js`
- `tests/unit/leaderboard-rendering.test.js`
- `tests/unit/leaderboard-navigation.test.js`
- `tests/integration/match-end-flow.test.js`

---

## Implementation Steps (TDD)

### Phase 1: Setup Testing Environment (~15 min)

#### 1.1. Install Dependencies
```bash
npm init -y  # If package.json doesn't exist
npm install --save-dev jest jest-canvas-mock @types/jest
```

#### 1.2. Configure Jest
Create `jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['jest-canvas-mock'],
  testMatch: ['**/tests/**/*.test.js']
};
```

#### 1.3. Add Test Script to package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

#### 1.4. Extract Game Code (For Testing)
Since the game is in a single HTML file, you'll need to either:
- **Option A**: Extract the PadelPong IIFE to a separate `game.js` file and import in both HTML and tests
- **Option B**: Use jsdom to load and parse the HTML file in tests

**Recommended**: Option A for easier testing. Refactor during implementation.

---

### Phase 2: Write Tests (Red Phase) (~30 min)

#### 2.1. State Management Tests
`tests/unit/leaderboard-state.test.js`:
```javascript
describe('Match End State Transitions', () => {
  test('sets winner to player when playerScore reaches WIN_SCORE', () => {
    // Arrange: gameState with playerScore = 10, aiScore = 5
    // Act: handleScore('player') 
    // Assert: gameState.winner === 'player', currentScreen === 'MATCH_END'
  });

  test('sets winner to ai when aiScore reaches WIN_SCORE', () => {
    // Similar to above
  });

  test('resets scores when starting new match from MATCH_END', () => {
    // Arrange: gameState in MATCH_END with scores 11-7
    // Act: startMatch('AWAKE')
    // Assert: playerScore === 0, aiScore === 0, winner === null
  });
});
```

#### 2.2. Rendering Tests
`tests/unit/leaderboard-rendering.test.js`:
```javascript
import 'jest-canvas-mock';

describe('Leaderboard Rendering', () => {
  let canvas, ctx;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
  });

  test('renders FINAL SCORE header', () => {
    // Act: renderMatchEndOverlay()
    // Assert: ctx.__getDrawCalls() contains fillText with "FINAL SCORE"
  });

  test('renders YOU WIN when player wins', () => {
    // Arrange: gameState.winner = 'player'
    // Act: renderMatchEndOverlay()
    // Assert: ctx contains fillText with "YOU WIN!"
  });

  test('renders both player and AI scores with labels', () => {
    // Arrange: playerScore = 11, aiScore = 7
    // Act: renderMatchEndOverlay()
    // Assert: 
    //   - fillText "YOU:" exists
    //   - fillText "11" exists after "YOU:"
    //   - fillText "AI:" exists
    //   - fillText "7" exists after "AI:"
  });

  test('winner score displayed in green, loser in gray', () => {
    // Arrange: player wins (11-7)
    // Act: renderMatchEndOverlay()
    // Assert: 
    //   - fillStyle before player score === '#7ED321'
    //   - fillStyle before ai score === '#AAA'
  });

  test('renders navigation instructions', () => {
    // Assert: "SPACE to rematch" and "ESC for menu" rendered
  });
});
```

#### 2.3. Navigation Tests
`tests/unit/leaderboard-navigation.test.js`:
```javascript
describe('Leaderboard Navigation', () => {
  test('SPACE key starts new match', () => {
    // Arrange: currentScreen = 'MATCH_END'
    // Act: dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    // Assert: currentScreen === 'PLAYING', startMatch called
  });

  test('ESC key returns to menu', () => {
    // Arrange: currentScreen = 'MATCH_END'
    // Act: dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    // Assert: currentScreen === 'MENU'
  });
});
```

#### 2.4. Accessibility Tests
Add to `leaderboard-rendering.test.js`:
```javascript
describe('Screen Reader Accessibility', () => {
  test('announces match result when transitioning to MATCH_END', () => {
    // Arrange: ARIA live region exists, currentScreen = 'PLAYING'
    // Act: Transition to MATCH_END (player wins 11-7)
    // Assert: ARIA region textContent includes "You win 11 to 7"
  });

  test('does not duplicate announcements on re-render', () => {
    // Arrange: Already announced MATCH_END once
    // Act: Re-render same screen
    // Assert: ARIA region not updated again
  });
});
```

**Run tests**: `npm test` → All should FAIL (Red phase complete)

---

### Phase 3: Implementation (Green Phase) (~45 min)

#### 3.1. Add Configuration Constants
In `index.html`, after line 142 (end of GAME_CONFIG), add:

```javascript
// Leaderboard configuration
LEADERBOARD: {
    HEADER_FONT: 'bold 32px "Courier New"',
    RESULT_FONT: 'bold 56px "Courier New"',
    SCORE_LABEL_FONT: '28px "Courier New"',
    SCORE_VALUE_FONT: 'bold 48px "Courier New"',
    INSTRUCTION_FONT: '20px "Courier New"',
    
    WINNER_COLOR: '#7ED321',
    LOSER_COLOR: '#AAA',
    NEUTRAL_COLOR: '#FFF',
    INSTRUCTION_COLOR: '#666',
    
    HEADER_Y: 100,
    RESULT_Y: 160,
    SCORES_START_Y: 240,
    SCORE_LINE_SPACING: 60,
    INSTRUCTIONS_START_Y: 500
}
```

#### 3.2. Add State for Accessibility
In `gameState` object (after line 233), add:
```javascript
lastAnnouncedScreen: null
```

#### 3.3. Add ARIA Live Region to HTML
In `index.html`, before `<script>` tag (~line 54), add:
```html
<div id="screenReaderAnnouncement" 
     role="status" 
     aria-live="polite" 
     aria-atomic="true"
     style="position: absolute; left: -10000px; width: 1px; height: 1px;">
</div>
```

#### 3.4. Rewrite renderMatchEndOverlay()
Replace the function (lines 866-910) with:

```javascript
function renderMatchEndOverlay() {
    // Background overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    const config = GAME_CONFIG.LEADERBOARD;
    ctx.textAlign = 'center';

    // Header
    ctx.font = config.HEADER_FONT;
    ctx.fillStyle = config.NEUTRAL_COLOR;
    ctx.fillText('FINAL SCORE', GAME_CONFIG.CANVAS_WIDTH / 2, config.HEADER_Y);

    // Match result
    ctx.font = config.RESULT_FONT;
    const resultText = gameState.winner === 'player' ? 'YOU WIN!' : 'YOU LOSE';
    ctx.fillText(resultText, GAME_CONFIG.CANVAS_WIDTH / 2, config.RESULT_Y);

    // Determine winner colors
    const playerColor = gameState.winner === 'player' ? config.WINNER_COLOR : config.LOSER_COLOR;
    const aiColor = gameState.winner === 'ai' ? config.WINNER_COLOR : config.LOSER_COLOR;

    // Player score line
    ctx.textAlign = 'right';
    ctx.font = config.SCORE_LABEL_FONT;
    ctx.fillStyle = playerColor;
    ctx.fillText('YOU:', 280, config.SCORES_START_Y);
    
    ctx.font = config.SCORE_VALUE_FONT;
    ctx.fillText(gameState.playerScore.toString(), 520, config.SCORES_START_Y);

    // AI score line
    ctx.font = config.SCORE_LABEL_FONT;
    ctx.fillStyle = aiColor;
    ctx.fillText('AI:', 280, config.SCORES_START_Y + config.SCORE_LINE_SPACING);
    
    ctx.font = config.SCORE_VALUE_FONT;
    ctx.fillText(gameState.aiScore.toString(), 520, config.SCORES_START_Y + config.SCORE_LINE_SPACING);

    // Feedback buttons (existing code - preserve lines 889-903)
    const buttonY = GAME_CONFIG.CANVAS_HEIGHT / 2 + 90;
    const thumbsUpX = GAME_CONFIG.CANVAS_WIDTH / 2 - 80;
    const thumbsDownX = GAME_CONFIG.CANVAS_WIDTH / 2 + 20;

    ctx.fillStyle = gameState.matchFeedback === 'thumbs_up' ? '#7ED321' : '#333';
    ctx.fillRect(thumbsUpX - 30, buttonY - 30, 60, 50);
    ctx.fillStyle = '#FFF';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('👍', thumbsUpX, buttonY);

    ctx.fillStyle = gameState.matchFeedback === 'thumbs_down' ? '#D0021B' : '#333';
    ctx.fillRect(thumbsDownX - 30, buttonY - 30, 60, 50);
    ctx.fillStyle = '#FFF';
    ctx.fillText('👎', thumbsDownX, buttonY);

    // Navigation instructions
    ctx.font = config.INSTRUCTION_FONT;
    ctx.fillStyle = config.INSTRUCTION_COLOR;
    ctx.fillText('SPACE to rematch', GAME_CONFIG.CANVAS_WIDTH / 2, config.INSTRUCTIONS_START_Y);
    ctx.fillText('ESC for menu', GAME_CONFIG.CANVAS_WIDTH / 2, config.INSTRUCTIONS_START_Y + 30);

    // Accessibility announcement
    announceMatchEnd();
}
```

#### 3.5. Add Accessibility Announcement Function
Add after `renderMatchEndOverlay()`:

```javascript
function announceMatchEnd() {
    if (gameState.currentScreen !== 'MATCH_END' || gameState.lastAnnouncedScreen === 'MATCH_END') {
        return;
    }

    const announcement = document.getElementById('screenReaderAnnouncement');
    if (!announcement) return;

    const resultText = gameState.winner === 'player' ? 'You win' : 'You lose';
    const message = `Match ended. ${resultText} ${gameState.playerScore} to ${gameState.aiScore}. Press space to play again or escape for menu.`;
    
    announcement.textContent = message;
    gameState.lastAnnouncedScreen = 'MATCH_END';
}
```

#### 3.6. Reset Announcement State on Screen Transitions
In `startMatch()` function (line 1001), add:
```javascript
gameState.lastAnnouncedScreen = null;
```

In keyboard event handler for ESC from MATCH_END (around line 317), add:
```javascript
gameState.lastAnnouncedScreen = null;
```

**Run tests**: `npm test` → All should PASS (Green phase complete)

---

### Phase 4: Refactor (~15 min)

#### 4.1. Extract Magic Numbers
Review code for hardcoded values that should be in `GAME_CONFIG.LEADERBOARD`:
- Button positions (already calculated, OK)
- Color values (already extracted, OK)
- Font sizes (already extracted, OK)

#### 4.2. Add JSDoc Comments
Add function documentation:
```javascript
/**
 * Renders the match-end leaderboard overlay with final scores and navigation options.
 * Displays winner/loser status, both players' scores, feedback buttons, and instructions.
 * Also triggers screen reader announcement for accessibility.
 * @requires gameState.currentScreen === 'MATCH_END'
 * @requires gameState.winner !== null
 */
function renderMatchEndOverlay() { ... }

/**
 * Announces match result to screen readers via ARIA live region.
 * Prevents duplicate announcements by checking lastAnnouncedScreen state.
 */
function announceMatchEnd() { ... }
```

#### 4.3. Verify Constitution Compliance
- ✅ Simplicity: No new dependencies
- ✅ TDD: Tests written first, all passing
- ✅ Performance: Static rendering, no performance impact
- ✅ Accessibility: ARIA announcements added
- ✅ Progressive Enhancement: Leaderboard is optional overlay

**Run tests again**: `npm test` → All should still pass

---

## Testing Your Implementation

### Manual Testing Checklist

#### Visual Testing
1. Open `index.html` in browser
2. Start a match (press 1-4 for difficulty)
3. Play until match end (or cheat: set WIN_SCORE to 1 in GAME_CONFIG)
4. **Verify**:
   - [ ] "FINAL SCORE" header visible
   - [ ] "YOU WIN!" or "YOU LOSE" displayed
   - [ ] Both scores shown with labels ("YOU: 11", "AI: 7")
   - [ ] Winner's score in green, loser's in gray
   - [ ] Navigation instructions visible
   - [ ] Screen renders without flicker/lag

#### Keyboard Navigation Testing
5. From leaderboard, press SPACE
   - [ ] New match starts immediately
   - [ ] Scores reset to 0-0
6. Play to leaderboard again
7. Press ESC
   - [ ] Returns to main menu
   - [ ] Scores reset

#### Accessibility Testing (Requires Screen Reader)
8. Enable screen reader (NVDA/JAWS/VoiceOver)
9. Play match to end
10. **Verify**:
    - [ ] Announcement heard: "Match ended. You [win|lose] [score] to [score]..."
    - [ ] Announcement includes navigation instructions
11. Stay on leaderboard for 5 seconds
    - [ ] No duplicate announcements (should announce only once)

#### Performance Testing
12. Open DevTools → Performance tab
13. Start recording
14. Play match to end
15. Stop recording
16. **Verify**:
    - [ ] Frame rate stays at 60 FPS
    - [ ] `renderMatchEndOverlay()` execution time < 2ms
    - [ ] No memory leaks (check Memory tab)

#### Cross-Browser Testing
17. Test in Chrome, Firefox, Safari (if available)
18. **Verify**: All features work identically

---

## Troubleshooting

### Tests Failing

**Problem**: "Cannot find module jest-canvas-mock"
- **Solution**: Run `npm install --save-dev jest-canvas-mock`

**Problem**: Tests can't access PadelPong module
- **Solution**: Extract IIFE to separate file or use jsdom to parse HTML

**Problem**: Mock canvas doesn't record fillText calls
- **Solution**: Ensure `jest-canvas-mock` is in `setupFiles` in jest.config.js

### Rendering Issues

**Problem**: Scores not aligned correctly
- **Solution**: Check `ctx.textAlign` settings (should be 'right' for scores, 'center' for header)

**Problem**: Colors not showing as expected
- **Solution**: Verify `gameState.winner` is set correctly, check color hex codes

**Problem**: Instructions cut off on small screens
- **Solution**: Canvas is fixed 800×600, instructions should fit. Check Y positions.

### Accessibility Issues

**Problem**: Screen reader not announcing
- **Solution**: 
  1. Verify ARIA div exists in DOM
  2. Check `aria-live="polite"` attribute present
  3. Confirm `announceMatchEnd()` is called
  4. Test with actual screen reader (console logs won't work)

**Problem**: Duplicate announcements
- **Solution**: Ensure `lastAnnouncedScreen` is reset when leaving MATCH_END screen

---

## Next Steps

After completing this feature:

1. **Run full test suite**: `npm test` (all tests should pass)
2. **Commit your changes**: Follow conventional commit format
   ```bash
   git add .
   git commit -m "feat: enhance match-end leaderboard with improved layout and accessibility"
   ```
3. **Performance profile**: Verify 60 FPS maintained
4. **Accessibility audit**: Run Lighthouse or axe DevTools
5. **Update documentation**: If you made any deviations from this plan

---

## Resources

- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [ARIA Live Regions - MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Jest Canvas Mock - GitHub](https://github.com/hustcc/jest-canvas-mock)
- [Testing Library - jsdom](https://testing-library.com/docs/dom-testing-library/intro)
- Project Constitution: `.specify/memory/constitution.md`
- Feature Spec: `specs/001-match-end-leaderboard/spec.md`
- Data Model: `specs/001-match-end-leaderboard/data-model.md`

---

## Time Estimates

| Phase | Estimated Time | Tasks |
|-------|----------------|-------|
| Setup | 15 min | Install Jest, configure, extract code for testing |
| Write Tests | 30 min | Create 4 test files, write ~15 test cases |
| Implementation | 45 min | Add config, modify rendering, add accessibility |
| Refactor | 15 min | Extract constants, add comments, verify compliance |
| Manual Testing | 15 min | Visual, keyboard, accessibility checks |
| **Total** | **2 hours** | End-to-end completion |

---

## Success Criteria

You're done when:
- ✅ All unit and integration tests pass
- ✅ Leaderboard displays clearly with winner indication
- ✅ Screen reader announces match results
- ✅ Keyboard navigation works (SPACE/ESC)
- ✅ 60 FPS maintained (no performance degradation)
- ✅ Constitution compliance verified (no violations)
- ✅ Code committed with tests

**Good luck! 🎉**
