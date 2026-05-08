<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Rationale: Initial constitution creation for Speckit-Pong project
Modified principles: None (initial creation)
Added sections: All sections (new constitution)
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md (✅ updated - added Constitution Check gates)
  - .specify/templates/spec-template.md (✅ updated - added constitution compliance requirements)
  - .specify/templates/tasks-template.md (✅ updated - made tests mandatory per TDD principle)
Follow-up TODOs: None
-->

# Speckit-Pong Constitution

## Core Principles

### I. Simplicity First
Web-based games must remain lightweight and accessible. All features should work in-browser without installation or dependencies. Single-file implementation preferred where feasible. No build steps or transpilation unless absolutely necessary. Performance over abstraction.

**Rationale**: Pong is a learning project and demonstration. Overengineering defeats the educational purpose and creates maintenance burden.

**How to apply**: Before adding libraries, frameworks, or build tools, justify why vanilla JavaScript/HTML/CSS cannot accomplish the goal. Prefer canvas API and native browser features.

### II. Test-Driven Development (NON-NEGOTIABLE)
Tests must be written before implementation. Every game mechanic, collision detection algorithm, and scoring logic requires unit tests. Integration tests required for input handling and rendering cycles.

**Rationale**: Game physics and collision detection are error-prone. TDD ensures correctness and prevents regressions when refactoring game loops or physics calculations.

**How to apply**: Follow Red-Green-Refactor cycle strictly. Write failing test → Get user approval → Implement minimal code to pass → Refactor. No exceptions for "simple" features.

### III. Progressive Enhancement
Core gameplay must function without optional features. Gamepad support, sound effects, visual enhancements, and multiplayer modes are layered on top of working single-player keyboard/mouse controls.

**Rationale**: Allows incremental development and ensures the game remains playable even if advanced features fail or are disabled.

**How to apply**: Implement features in dependency order: physics → rendering → basic input → scoring → enhanced input → effects → multiplayer. Each layer must be independently testable.

### IV. Performance Budget
Maintain 60 FPS on mid-range devices (3-year-old hardware). Game loop must complete within 16ms per frame. No memory leaks in long-running game sessions (1+ hour continuous play).

**Rationale**: Pong is a fast-paced game where frame drops directly impact playability. Poor performance ruins the experience.

**How to apply**: Profile every feature addition. Use requestAnimationFrame for rendering. Avoid allocations in the game loop. Test on constrained devices (mobile, older laptops).

### V. Accessibility Baseline
Keyboard controls required (arrow keys + space). Screen reader announcements for score changes and game state. High contrast mode support. Configurable difficulty levels.

**Rationale**: Game should be playable by as many users as possible, including those with disabilities or using assistive technologies.

**How to apply**: Include ARIA labels for game state. Provide visual + audio feedback. Support keyboard-only play. Test with screen readers and accessibility tools.

## Development Workflow

### Code Review Requirements
All changes require self-review against constitution principles before commit. Run full test suite and verify 60 FPS in browser DevTools performance profiler.

### Quality Gates
- All tests passing (100% required)
- No console errors or warnings
- Performance budget met (16ms frame time)
- Accessibility checks pass (keyboard navigation, ARIA labels)
- Cross-browser testing (Chrome, Firefox, Safari minimum)

### Documentation Standards
Each game feature requires inline comments explaining physics formulas and collision algorithms. README must include controls, browser compatibility, and how to run tests.

## Technology Constraints

### Approved Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas API, CSS3
- **Testing**: Jest or Vitest for unit tests, Playwright for integration tests
- **Tooling**: ESLint for linting, Prettier for formatting (optional)
- **Version Control**: Git with conventional commit messages

### Restricted/Prohibited
- ❌ No frontend frameworks (React, Vue, Angular) unless justified for specific advanced features
- ❌ No backend required for core gameplay (multiplayer may need WebSocket server)
- ⚠️ Build tools (Webpack, Vite) only if multiple modules or TypeScript adopted
- ⚠️ External game engines (Phaser, PixiJS) only if canvas API insufficient

## Governance

This constitution supersedes all other practices and serves as the single source of truth for development decisions. When practices conflict, constitution takes precedence.

### Amendment Process
1. Propose change with rationale and impact analysis
2. Update constitution with semantic version bump:
   - **MAJOR**: Principle removal or breaking governance change
   - **MINOR**: New principle or section added
   - **PATCH**: Clarifications, typo fixes, wording improvements
3. Validate dependent templates for consistency
4. Document amendment in Sync Impact Report
5. Commit with message: `docs: amend constitution to vX.Y.Z (summary)`

### Compliance Review
All pull requests must verify compliance with Core Principles. Complexity and technical debt require explicit justification. Refer to CLAUDE.md for agent-specific development guidance.

### Versioning Policy
Constitution version follows SEMVER. Breaking changes require migration guide. Non-breaking additions documented in amendment history.

**Version**: 1.0.0 | **Ratified**: 2026-05-08 | **Last Amended**: 2026-05-08
