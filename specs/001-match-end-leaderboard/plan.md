# Implementation Plan: Match-End Leaderboard

**Branch**: `001-match-end-leaderboard` | **Date**: 2026-05-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-match-end-leaderboard/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Display a leaderboard screen at match end showing final scores, winner, and navigation options. The leaderboard already partially exists in the `renderMatchEndOverlay()` function but needs enhancement to meet all specification requirements. Implementation will extend the existing MATCH_END screen state with improved layout, clearer winner indication, and explicit score display formatting.

## Technical Context

**Language/Version**: JavaScript ES6+ (vanilla, no transpilation)
**Primary Dependencies**: None (HTML5 Canvas API, Web Audio API)
**Storage**: N/A (in-memory game state only)
**Testing**: Jest or Vitest (per constitution)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari)
**Project Type**: Web-based game (single HTML file)
**Performance Goals**: 60 FPS (16ms frame time)
**Constraints**: No frame drops during leaderboard rendering, keyboard-accessible, <100KB total file size
**Scale/Scope**: Single-player vs AI, one match at a time, 4 screens (MENU, PLAYING, PAUSED, MATCH_END)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify compliance with Speckit-Pong Constitution (v1.0.0):

### Initial Check (Pre-Research)
- ✅ **Simplicity First**: Yes - purely canvas rendering updates within existing `renderMatchEndOverlay()` function, no new dependencies
- ⏳ **Test-Driven Development**: Tests pending - will write before implementation (FR-CONST-1 requirement)
- ✅ **Progressive Enhancement**: Yes - leaderboard is end-of-match overlay, core gameplay unaffected
- ✅ **Performance Budget**: Yes - static rendering (no animations), estimated <1ms render time, well within 16ms budget
- ✅ **Accessibility Baseline**: Yes - keyboard navigation already implemented (SPACE/ESC), will add ARIA announcements for screen readers

### Post-Design Check (After Phase 1)
- ✅ **Simplicity First**: CONFIRMED - Design uses only Canvas API + ARIA (both already in use), no new libraries. Single IIFE module pattern preserved. Config constants added to existing GAME_CONFIG object.
- ✅ **Test-Driven Development**: READY - Test structure defined in quickstart.md with Jest + jest-canvas-mock. 4 test files planned (unit: state, rendering, navigation; integration: full flow). All tests must pass before implementation.
- ✅ **Progressive Enhancement**: CONFIRMED - Leaderboard is overlay on MATCH_END screen state. Game physics/input/rendering continue independently. Feature can be disabled by reverting renderMatchEndOverlay() with no cascading failures.
- ✅ **Performance Budget**: CONFIRMED - Static text/rect rendering only. No animations, no allocations in render loop. Estimated <2ms per frame (measured in research). ARIA updates happen once on state transition (not per frame).
- ✅ **Accessibility Baseline**: CONFIRMED - Keyboard controls preserved (SPACE/ESC). ARIA live region added for screen reader announcements. Complies with WCAG 2.1 Level A (text alternatives, keyboard accessible).

**Violations requiring justification**: None

**Design Decisions Aligned with Constitution**:
1. Centralized config in GAME_CONFIG.LEADERBOARD (Simplicity First - easy to tune)
2. TDD workflow mandated in quickstart.md (Test-Driven Development)
3. Minimal state additions (lastAnnouncedScreen only) (Simplicity First)
4. No external render loop changes (Progressive Enhancement)
5. ARIA via standard DOM, no framework (Simplicity First)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
index.html              # Single-file game (all code inline)
├── Section 1: Configuration & Constants
│   └── GAME_CONFIG (includes RULES.WIN_SCORE)
├── Section 2: State Management
│   └── gameState.currentScreen (MATCH_END state)
├── Section 7: Rendering
│   └── renderMatchEndOverlay() ← PRIMARY MODIFICATION TARGET
└── Section 10: Initialization
    └── Event handlers (keyboard navigation)

tests/                  # Tests to be created
├── unit/
│   ├── leaderboard-state.test.js      # Match end state transitions
│   ├── leaderboard-rendering.test.js   # Canvas rendering output
│   └── leaderboard-navigation.test.js  # Keyboard input handling
└── integration/
    └── match-end-flow.test.js          # Full match → leaderboard flow
```

**Structure Decision**: Single-file architecture (index.html contains all game logic as IIFE module). The leaderboard feature modifies the existing `renderMatchEndOverlay()` function within Section 7 (Rendering) and potentially adds accessibility announcements. Tests will be created in a separate `tests/` directory using Jest/Vitest with jsdom for canvas mocking.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - this section intentionally left empty.
