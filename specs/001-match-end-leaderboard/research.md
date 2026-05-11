# Research: Match-End Leaderboard

**Feature**: Match-End Leaderboard  
**Date**: 2026-05-08  
**Researcher**: Implementation Planning Agent

## Overview

This document consolidates research findings for implementing the match-end leaderboard feature in the Padel Pong game. Since the technical context is fully specified (vanilla JS, HTML5 Canvas, single-file architecture), minimal research was required. All decisions align with the existing codebase patterns.

## Research Questions & Findings

### 1. Current Leaderboard Implementation Status

**Question**: What leaderboard functionality already exists?

**Finding**: The game already has a `renderMatchEndOverlay()` function (lines 866-910 in index.html) that displays:
- Match result ("YOU WIN!" or "YOU LOSE")
- Final score in format `playerScore - aiScore`
- Feedback mechanism (thumbs up/down buttons with click handling)
- Navigation instructions (SPACE to rematch, ESC for menu)

**Decision**: Enhancement required, not creation from scratch. The existing overlay meets most FR requirements but needs refinement for clarity and accessibility.

**Rationale**: Leveraging existing implementation reduces risk and maintains consistency with current visual style.

---

### 2. Canvas Rendering Best Practices for Static UI

**Question**: What are best practices for rendering static leaderboard UI on HTML5 Canvas without performance impact?

**Finding**: 
- Static text and shapes have minimal performance cost (<1ms for typical leaderboard)
- The game already uses this pattern successfully in `renderMenu()` (lines 743-781)
- Text rendering with `fillText()` is efficient for score displays
- Current implementation uses LED-style score rendering during gameplay

**Decision**: Follow existing rendering patterns:
- Use `ctx.fillText()` for text labels and scores
- Use `ctx.fillRect()` for backgrounds and dividers
- Apply existing color scheme (white text on black background)
- Maintain courier font family for retro aesthetic

**Rationale**: Consistency with existing UI patterns ensures visual coherence and proven performance.

**Alternatives considered**:
- DOM overlay with HTML/CSS: Rejected because it breaks single-file architecture and mixes rendering paradigms
- Canvas 2D library (Konva, Fabric.js): Rejected per constitution (Simplicity First principle)

---

### 3. Screen Reader Accessibility for Canvas Games

**Question**: How to make canvas-based leaderboard accessible to screen readers?

**Finding**:
- Canvas content is invisible to screen readers by default
- ARIA live regions can announce dynamic state changes
- Hidden `<div>` elements with ARIA attributes provide accessible content
- Pattern: Add `aria-live="polite"` region that updates when match ends

**Decision**: Implement accessibility via hidden ARIA live region:
```html
<div id="screenReaderAnnouncement" 
     role="status" 
     aria-live="polite" 
     aria-atomic="true"
     style="position: absolute; left: -10000px; width: 1px; height: 1px;">
</div>
```
Update content when transitioning to MATCH_END screen with announcement like:
"Match ended. You win 11 to 7. Press space to play again or escape for menu."

**Rationale**: Standard pattern for canvas game accessibility, minimal code addition, complies with FR-CONST-3.

**Alternatives considered**:
- Canvas fallback content: Rejected because it's not dynamically updated
- `canvas.ariaLabel`: Rejected because it doesn't announce state changes

---

### 4. Testing Canvas Rendering with Jest/Vitest

**Question**: How to test canvas rendering output in unit tests?

**Finding**:
- Jest with `jest-canvas-mock` provides mock canvas context
- `canvas` npm package provides Node.js Canvas implementation
- Can verify `fillText()` and `fillRect()` call sequences
- Snapshot testing can capture rendering call patterns

**Decision**: Use Jest with `jest-canvas-mock`:
```javascript
// Example test structure
import 'jest-canvas-mock';

test('renders winner text correctly', () => {
  const ctx = canvas.getContext('2d');
  renderMatchEndOverlay();
  
  const calls = ctx.__getDrawCalls();
  expect(calls).toContainEqual(
    expect.objectContaining({
      type: 'fillText',
      text: 'YOU WIN!'
    })
  );
});
```

**Rationale**: Lightweight, aligns with constitution testing requirements, no additional build tools needed.

**Alternatives considered**:
- Puppeteer E2E tests: Rejected for unit tests (too slow, but valid for integration tests)
- Manual canvas inspection: Rejected (not automatable for TDD)

---

### 5. Score Display Formatting Patterns

**Question**: What's the best format for displaying match results in a leaderboard?

**Finding**:
- Current implementation shows: `playerScore - aiScore` (e.g., "11 - 7")
- Sports leaderboards typically show: Winner → Loser order
- Table format with labels provides clarity:
  ```
  Player 1:  11
  AI:         7
  ```

**Decision**: Enhance display with labeled format:
```
YOU:    11
AI:      7
```
Center-aligned, with winner row highlighted (brighter color or subtle background).

**Rationale**: Clearer than hyphenated format, maintains retro aesthetic, improves scannability.

**Alternatives considered**:
- Table with columns: Rejected (over-engineered for 1v1 match)
- Graphical bars: Rejected (adds visual complexity, slower to render)

---

## Implementation Approach Summary

### What to Modify
- **Primary**: `renderMatchEndOverlay()` function (Section 7, lines 866-910)
  - Enhance score display formatting
  - Add explicit "LEADERBOARD" or "FINAL SCORE" header
  - Improve visual hierarchy (winner emphasis)

- **Secondary**: Add ARIA live region to HTML (outside `<script>` tag)
  - Initialize in `init()` function
  - Update content on screen state transition to MATCH_END

- **Tertiary**: No changes to navigation logic (already compliant)

### What NOT to Change
- State management (`gameState.currentScreen`, score tracking) - already correct
- Navigation controls (SPACE/ESC handling) - already implemented
- Physics/collision systems - unrelated to this feature
- Visual effects (particles, trails) - out of scope

### Dependencies
- None (all required APIs already in use)

### Testing Strategy
1. **Unit tests** (TDD, write first):
   - State transition to MATCH_END
   - Canvas rendering call verification
   - Keyboard input handling
   - ARIA announcement content

2. **Integration tests**:
   - Full match flow → leaderboard display
   - Score accuracy verification
   - Navigation away from leaderboard

3. **Manual accessibility testing**:
   - NVDA/JAWS screen reader verification
   - Keyboard-only navigation confirmation

---

## Open Questions

None - all technical details resolved through codebase analysis and standard web practices.

---

## References

- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN: ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [jest-canvas-mock GitHub](https://github.com/hustcc/jest-canvas-mock)
- [W3C: Making Canvas Accessible](https://www.w3.org/WAI/tutorials/canvas/)
- Existing codebase: `index.html` (primary reference)
