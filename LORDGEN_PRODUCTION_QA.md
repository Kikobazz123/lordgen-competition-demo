# LordGen AI — Production QA Checklist

## Pre-Change

- [ ] Inspect current codebase
- [ ] Identify framework and package manager
- [ ] Identify existing routes
- [ ] Identify existing design tokens
- [ ] Identify diagnostic workflow
- [ ] Identify n8n/Vercel integration boundaries
- [ ] Create a safe git checkpoint before major edits

## Messaging

- [ ] Visitor understands LordGen quickly
- [ ] Hero explains the business outcome
- [ ] Primary CTA is "Run My Business Diagnostic"
- [ ] Secondary CTA can show a live system
- [ ] Technical language is secondary to business language

## Diagnostic

- [ ] Business input works
- [ ] Problem selection works
- [ ] Analysis state is clear
- [ ] Recommendation is understandable
- [ ] Workflow visualization is understandable to nontechnical visitors
- [ ] Prototype/demos are labeled honestly
- [ ] Next action is obvious

## UI

- [ ] Desktop polish
- [ ] Tablet layout
- [ ] Mobile layout
- [ ] No horizontal overflow
- [ ] Focus states
- [ ] Accessible labels
- [ ] Reasonable contrast
- [ ] Reduced-motion behavior
- [ ] Consistent spacing
- [ ] Consistent buttons
- [ ] Consistent cards
- [ ] No unnecessary visual effects

## Conversion

- [ ] Diagnostic CTA appears in hero
- [ ] CTA repeated naturally through page
- [ ] Contact/WhatsApp path is obvious
- [ ] Strategy call path exists if applicable
- [ ] No vague CTA dominates the page

## Trust

- [ ] No fabricated testimonials
- [ ] No fabricated client count
- [ ] No fabricated ROI
- [ ] No fabricated revenue claims
- [ ] Demo/prototype labels are clear
- [ ] Real case studies can be added later without redesigning the page

## Technical

- [ ] lint passes
- [ ] typecheck passes if available
- [ ] tests pass if present
- [ ] production build passes
- [ ] important routes load
- [ ] no console errors
- [ ] no leaked secrets
- [ ] no broken environment-variable references

## Integration Safety

- [ ] n8n credentials untouched during UI work
- [ ] Vercel secrets untouched during UI work
- [ ] server-side secret handling preserved
- [ ] webhook endpoints verified separately
- [ ] error states do not expose sensitive data

## Final Question

Would a business owner with no knowledge of n8n understand:
- what LordGen does?
- what it can automate?
- why they should care?
- what to click next?

If not, the page is not finished.
