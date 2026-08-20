# LordGen AI --- 3D/Futuristic Website Upgrade Instruction for Claude Code

You are working inside the existing LordGen AI website repository.

Your job is to upgrade the current website from a visually plain/static
presentation into a premium, futuristic AI-consulting website with
tasteful 3D depth, motion, interaction, and visual energy.

## NON-NEGOTIABLE RULES

1.  Inspect the existing project before changing anything.
2.  Identify the framework, entry points, routing, styling system,
    components, assets, package manager, and current design system.
3.  Do NOT rebuild the project from scratch unless the existing
    architecture is genuinely unusable.
4.  Preserve existing working functionality, content, forms, routes,
    integrations, and business logic.
5.  Do not replace LordGen branding. The brand remains LordGen AI.
6.  Do not turn the site into a generic "AI template".
7.  Do not make every element move. Motion must have hierarchy and
    purpose.
8.  Do not use a plain black background. Keep the dark LordGen identity,
    but introduce depth through layered gradients, atmospheric lighting,
    subtle glow, grid/mesh textures, particles, glass surfaces, and
    controlled contrast.
9.  The result must feel premium, futuristic, intelligent, and credible
    --- not like a gaming website.
10. Prefer GPU-friendly transforms, opacity, canvas/WebGL where
    appropriate, and efficient animation techniques.
11. Respect prefers-reduced-motion and provide a usable reduced-motion
    experience.
12. Keep mobile performance and touch interaction in mind.
13. Do not install unnecessary dependencies. Reuse existing libraries
    where possible.
14. Before adding a major library, check whether the project already has
    an equivalent.
15. Never leave broken imports, unused packages, console errors,
    TypeScript errors, or placeholder components.

## FIRST: AUDIT THE CURRENT SITE

Before editing:

-   Inspect the repository structure.
-   Identify the framework and version.
-   Identify whether the site uses React, Next.js, Vite, Vue, plain
    HTML, etc.
-   Inspect package.json and existing dependencies.
-   Inspect the main layout, homepage, navigation, hero section,
    services, demos, CTA, footer, and global styles.
-   Run the site locally if possible.
-   Establish a baseline by checking the existing UI and functionality.
-   Determine exactly where the new 3D/motion system should be
    introduced.

Do not make assumptions about the architecture.

## CREATIVE DIRECTION

Create the feeling of:

"An AI automation/consulting intelligence system operating in a living
digital environment."

The visual language should combine:

-   deep dark surfaces rather than flat black
-   subtle atmospheric gradients
-   soft luminous accents
-   glass/transparent layers used sparingly
-   dimensional cards
-   depth/parallax
-   floating 3D forms
-   particles or neural-network-like connections
-   subtle grid or spatial-field elements
-   animated light/shadow
-   scroll-linked transitions
-   magnetic/interactive buttons where appropriate
-   sophisticated hover states
-   cinematic section entrances
-   restrained glow
-   smooth easing and spring motion

Avoid:

-   excessive neon
-   excessive blur
-   random floating blobs everywhere
-   cartoonish 3D
-   overused spinning cubes
-   distracting particle storms
-   animation that hurts readability
-   effects that make the site look like a crypto casino
-   fake "AI" visual clichés

## 3D SYSTEM

Choose the implementation based on the actual project.

If the site is React-based and 3D is appropriate, prefer:

-   Three.js
-   React Three Fiber
-   @react-three/drei where useful

For UI motion, prefer the project's existing animation system. If none
exists, evaluate Motion for React or GSAP before installing.

Use 3D where it adds real visual value.

Possible hero concept:

-   A floating abstract "AI intelligence core" / geometric network
-   Slowly rotating or morphing 3D geometry
-   Subtle particles orbiting or flowing around it
-   Camera movement responding slightly to pointer movement
-   Soft lighting and depth
-   The object should never overpower the hero copy or CTA

Possible section concepts:

1.  HERO
    -   atmospheric 3D intelligence object
    -   subtle pointer-reactive camera/parallax
    -   text enters with cinematic stagger
    -   CTA has a refined magnetic/hover effect
2.  SERVICES
    -   dimensional cards
    -   slight perspective tilt on pointer movement
    -   animated border/light sweep
    -   icons or visual markers with micro-motion
3.  AUTOMATION / WORKFLOW
    -   visually communicate Workflow → Agent → Tool
    -   animated nodes/lines/data flow
    -   use motion to make the architecture feel alive
4.  DEMOS
    -   cards should feel like interactive product modules
    -   hover can reveal depth, glow, or preview motion
    -   preserve all existing demo functionality
5.  ABOUT / TRUST
    -   restrained scroll reveal
    -   subtle depth transition
    -   avoid excessive effects
6.  FINAL CTA
    -   atmospheric background
    -   subtle moving light field
    -   strong but clean CTA focus

## MOTION DESIGN

Use several motion layers rather than one giant animation.

Required motion categories:

-   page-load entrance
-   section reveal
-   scroll-linked movement
-   hover interaction
-   pointer/parallax interaction
-   micro-interactions
-   subtle ambient background movement
-   optional 3D object animation

Motion should have different speeds and amplitudes to create depth.

Use:

-   spring-based motion for interactive elements
-   smooth easing for cinematic entrances
-   slow continuous animation for ambient objects
-   scroll progress for selected storytelling sections
-   staggered entrances for grouped content

Do not animate expensive properties unnecessarily.

## BACKGROUND UPGRADE

The current black background must become a layered visual environment.

Build a reusable background system with some combination of:

-   near-black base
-   radial gradients
-   subtle animated light sources
-   faint grid/mesh
-   sparse particles
-   soft noise/grain if appropriate
-   depth layers
-   subtle color accents consistent with LordGen branding

The background must remain readable behind text.

Do NOT simply change the background to a bright gradient.

## ACCESSIBILITY

Implement:

-   prefers-reduced-motion support
-   keyboard-accessible interactive elements
-   visible focus states
-   readable text contrast
-   no interaction that depends exclusively on hover
-   touch-safe behavior
-   WebGL fallback where practical

If WebGL/3D is unavailable, the site should still look polished using
the 2D fallback layer.

## PERFORMANCE

Treat performance as a design requirement.

Check:

-   initial page load
-   bundle size
-   animation smoothness
-   GPU usage
-   mobile performance
-   excessive re-renders
-   unnecessary canvas size
-   device pixel ratio
-   asset sizes
-   animation cleanup

For 3D:

-   avoid unnecessarily high-poly geometry
-   limit particle counts
-   reuse geometries/materials where practical
-   avoid creating objects every frame
-   clean up resources when components unmount
-   consider limiting DPR on weaker devices
-   pause/reduce expensive animation when the page/tab is not visible
    when appropriate

## IMPLEMENTATION PROCESS

Work in this order:

PHASE 1 --- AUDIT - inspect - run - understand architecture

PHASE 2 --- DESIGN PLAN Create a short implementation plan listing: -
files to change - files to create - packages required - animation
approach - 3D approach - fallback approach - performance considerations

PHASE 3 --- FOUNDATION Implement: - visual background system - motion
primitives - reusable animation utilities - 3D scene component if
appropriate

PHASE 4 --- HERO Upgrade the hero first and make it the visual anchor.

PHASE 5 --- SECTIONS Upgrade the rest of the page progressively without
destroying existing content/functionality.

PHASE 6 --- RESPONSIVE Tune desktop, tablet, and mobile independently.

PHASE 7 --- ACCESSIBILITY Verify reduced motion, keyboard use, contrast,
and fallback behavior.

PHASE 8 --- QA Run: - build - type checking if available - linting if
available - tests if available

Fix all errors.

## IMPORTANT: DO NOT STOP AFTER INSTALLING PACKAGES

You are responsible for implementing the actual visual experience.

Do not respond with:

"I installed Three.js." "I added Motion." "I created a canvas."

Instead, actually integrate the system into the website and make the
visible website substantially better.

## QUALITY BAR

The final result should feel like a premium modern AI
consultancy/product studio.

Think:

-   cinematic
-   dimensional
-   intelligent
-   restrained
-   futuristic
-   interactive
-   high-end
-   trustworthy

NOT:

-   basic SaaS template
-   flat landing page
-   generic AI landing page
-   gaming site
-   crypto site
-   neon overload

## FINAL REPORT

When finished, report:

1.  What you inspected.
2.  What you changed.
3.  What new files/components were created.
4.  What dependencies were added, if any.
5.  What 3D effects were implemented.
6.  What animation systems were implemented.
7.  How the black background was transformed.
8.  Mobile/responsive changes.
9.  Accessibility/reduced-motion handling.
10. Performance measures.
11. Tests/build checks performed.
12. Any remaining issues.

Most importantly: preserve the working LordGen AI website while making
it feel dramatically more alive, dimensional, and premium.
