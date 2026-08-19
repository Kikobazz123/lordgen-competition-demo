---
description: Upgrade an existing LordGen AI website into a premium
  futuristic web experience with tasteful 3D visuals, cinematic motion,
  interactive depth, animated backgrounds, scroll effects, and strong
  performance/accessibility safeguards. Use when the user asks to make
  the LordGen website less plain, more creative, more animated, more
  futuristic, or more dimensional.
name: lordgen-3d-web-experience
---

# LordGen AI 3D Web Experience Skill

## Objective

Transform an existing LordGen AI website from a flat/static presentation
into a polished, dimensional, futuristic experience without destroying
the existing architecture, content, functionality, or brand identity.

The desired result is a premium AI consulting/product-studio aesthetic:
intelligent, cinematic, interactive, restrained, and credible.

## Operating Principles

-   Inspect before editing.
-   Preserve existing functionality.
-   Reuse existing architecture and dependencies.
-   Do not rebuild unnecessarily.
-   Do not introduce dependencies without justification.
-   Motion must serve hierarchy and storytelling.
-   3D must add genuine visual depth.
-   Avoid generic AI-template aesthetics.
-   Avoid excessive neon, blur, particles, and motion.
-   Keep LordGen's dark identity, but never leave the background as flat
    black.
-   Design mobile and reduced-motion behavior from the start.
-   Validate the result before declaring completion.

## Technology Selection

First inspect the existing stack.

### If React is present

For real 3D, prefer:

-   three
-   @react-three/fiber
-   @react-three/drei when useful

React Three Fiber is a React renderer for three.js and supports reusable
interactive scene components. Use it only where the project architecture
makes it appropriate.

For UI animation:

-   Prefer an existing animation library if the project already has one.
-   Otherwise evaluate Motion for React or GSAP.
-   Use Motion for component-level interaction, springs, hover/tap
    gestures, layout and scroll-linked UI motion.
-   Use GSAP/ScrollTrigger when complex timelines, pinned sections,
    scrubbed scroll sequences, or advanced orchestration genuinely
    require it.

### If the project is not React

Do not force React Three Fiber into it.

Use the project's native architecture and evaluate:

-   three.js directly for 3D
-   Motion/GSAP where compatible
-   CSS transforms/transitions for simple effects

## Visual System

### Background

Replace flat black with a layered dark environment:

1.  deep near-black base
2.  subtle radial lighting
3.  restrained brand accent glow
4.  faint grid/mesh or spatial field
5.  sparse atmospheric particles when useful
6.  optional fine grain/noise
7.  depth layers that respond subtly to pointer or scroll

The background must support text readability.

### Hero

Make the hero the primary visual anchor.

Preferred concept:

A floating abstract AI intelligence core or geometric network that:

-   slowly rotates/morphs
-   has depth and lighting
-   responds subtly to pointer movement
-   uses restrained particles or connected nodes
-   sits behind or beside the hero copy
-   never blocks the CTA
-   degrades gracefully on mobile or unsupported WebGL

### Services

Use dimensional cards:

-   perspective tilt
-   subtle depth
-   animated border/highlight
-   restrained hover elevation
-   icon micro-motion

Never make cards jump excessively.

### Workflow / Automation

Communicate:

Workflow → Agent → Tool

using animated nodes, connectors, signals, or data flow.

The motion should communicate system behavior, not simply decorate the
page.

### Demo Areas

Make existing demos feel like product modules.

Use:

-   depth
-   hover previews
-   animated status indicators
-   subtle transitions
-   interactive states

Do not break existing demo functionality.

### CTA

Create a controlled atmospheric focus:

-   moving light field
-   subtle depth
-   strong typography
-   refined button interaction

## Motion System

Use multiple motion layers.

### Ambient

Slow, continuous movement:

-   floating objects
-   particles
-   background light
-   subtle rotation
-   low-amplitude parallax

### Interaction

Use:

-   hover
-   tap
-   pointer movement
-   magnetic-style button movement where appropriate
-   card tilt
-   depth shifts

### Scroll

Use:

-   section reveals
-   parallax
-   progressive scaling
-   timeline-driven sequences
-   selected pinned/scrubbed sequences only where they improve
    storytelling

### Entrance

Use:

-   opacity
-   transform
-   stagger
-   clip-path or mask effects when appropriate

Avoid animating everything at once.

## 3D Rules

-   Keep geometry lightweight.
-   Reuse geometries/materials.
-   Avoid excessive particle counts.
-   Avoid unnecessary post-processing.
-   Keep canvas dimensions controlled.
-   Consider device pixel ratio limits.
-   Do not create new heavy objects every animation frame.
-   Clean up WebGL resources.
-   Use lazy loading where practical.
-   Provide a non-WebGL visual fallback.
-   Reduce or disable expensive effects on weaker/mobile devices when
    necessary.

## Accessibility

Always support:

-   `prefers-reduced-motion`
-   keyboard navigation
-   visible focus states
-   adequate contrast
-   touch interaction
-   non-hover alternatives

Reduced motion should remove or substantially reduce continuous
animation while retaining a polished visual design.

## Workflow

### Step 1 --- Inspect

Inspect:

-   package.json
-   source tree
-   routes
-   main layout
-   global CSS
-   hero
-   sections
-   assets
-   existing animation libraries
-   build scripts

Run the site if possible.

### Step 2 --- Plan

Before implementation, produce a concise plan containing:

-   files to modify
-   files to create
-   dependencies
-   3D architecture
-   animation architecture
-   fallback
-   performance strategy

### Step 3 --- Foundation

Create reusable primitives where appropriate:

-   AnimatedBackground
-   Hero3DScene
-   MotionSection
-   MagneticButton
-   DepthCard
-   WorkflowVisualization
-   reduced-motion utilities

Do not create these names blindly; adapt to the project's architecture
and naming conventions.

### Step 4 --- Implement

Upgrade the hero first.

Then progressively upgrade:

-   services
-   workflow
-   demos
-   trust/about
-   CTA
-   footer where appropriate

### Step 5 --- Responsive Pass

Explicitly test:

-   desktop
-   tablet
-   mobile
-   touch interactions

### Step 6 --- Accessibility Pass

Test:

-   reduced motion
-   keyboard
-   focus
-   contrast
-   WebGL fallback

### Step 7 --- QA

Run available:

-   build
-   typecheck
-   lint
-   tests

Resolve errors before finishing.

## Stop Conditions

Do not finish if:

-   the build is broken
-   imports are broken
-   console errors remain from the implementation
-   existing functionality was accidentally removed
-   mobile layout is broken
-   animation causes obvious jank
-   3D obscures content
-   the background is still just flat black
-   the result looks like a generic template

## Completion Report

Return:

-   architecture inspected
-   files changed
-   files created
-   dependencies added
-   3D implementation
-   motion implementation
-   background implementation
-   responsive changes
-   accessibility changes
-   performance safeguards
-   validation performed
-   remaining issues

## Reference Principles

Use the official documentation for implementation details when needed:

-   React Three Fiber for React-based 3D scenes.
-   Three.js for WebGL/3D capabilities and animation.
-   Motion for React for component and gesture animation.
-   GSAP ScrollTrigger for advanced scroll timelines.

Do not copy large sections of third-party documentation into the
project. Use the APIs appropriately and keep the implementation original
to LordGen AI.
