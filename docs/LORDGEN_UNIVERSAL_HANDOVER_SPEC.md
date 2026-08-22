# LordGen AI — Universal Client Handover Specification

## Purpose

Create a client-friendly handover document that can be generated dynamically for any approved business inquiry.

The handover must **not** be hard-coded for logistics, e-commerce, healthcare, professional services, or any other single industry. The business category, workflow, pain points, automation opportunities, examples, and recommended next steps must be generated from the client's submitted business information and the automation that was actually designed.

The document should explain the opportunity in plain English first, then explain what was built, what was tested, how the client approves it, and what happens before production launch.

The existing GIG Logistics handover establishes the important foundation: the automation can validate incoming records, write validated information to a record store, send a customer confirmation, and log runs for audit. It also establishes that a starter build may be tested but not yet production-live, with real business systems still requiring connection before go-live.

---

## 1. Client-Friendly Automation Opportunity

### Dynamic heading

**How Automation Can Help [BUSINESS NAME]**

### Content

The AI should analyse the client's submitted business information and explain, in simple non-technical language:

- What type of business this is.
- What the business appears to do.
- Which important workflow or workflows could benefit from automation.
- What is currently manual, repetitive, slow, inconsistent, or difficult to track.
- What could be improved.
- The expected practical business benefit.

Do not use technical language in the client-facing section.

Avoid terms such as:
- API
- webhook
- n8n
- node
- JSON
- credentials
- database
- OAuth
- endpoint

unless they are genuinely necessary and explained in plain English.

---

## 2. Standard Automation Procedure for This Business Category

### Dynamic heading

**Standard Automation Opportunities for [BUSINESS CATEGORY]**

This section must be generated specifically for the approved business category.

It should not simply describe the automation that was built. It should first educate the client about the kinds of processes that can normally be improved in businesses like theirs.

### Required table

| Current business activity | How automation can help | Business benefit |
|---|---|---|
| [Manual activity] | [Simple explanation] | [Practical outcome] |
| [Manual activity] | [Simple explanation] | [Practical outcome] |
| [Manual activity] | [Simple explanation] | [Practical outcome] |

Keep this short and easy to understand.

---

## 3. Simple Workflow Illustration

Show one clear example of how automation could work in this particular business.

Use a simple visual flow or clean text-based diagram.

Example structure:

**Customer / Staff → Request Received → Information Checked → Correct Person or Team Notified → Action Taken → Customer Updated → Activity Recorded**

The exact stages must be dynamically generated from the business workflow.

The purpose is to let a non-technical client understand what the automation actually does.

Do not make the diagram overly sophisticated.

If an AI-agent style workflow is relevant, explain the agent's role in ordinary language, for example:

**AI receives the request → checks the information → decides where it should go → helps the next person take action → sends the appropriate update.**

Do not imply that an AI agent can perform actions that the actual automation has not been designed or tested to perform.

---

## 4. Business Problem / Review Research

### Dynamic heading

**What We Found**

Where sufficient public or client-provided information is available, research the business's recurring customer complaints, operational problems, or negative reviews.

The research should identify patterns rather than simply dump a list of complaints.

Show:

1. **Issue detected**
2. **Evidence / recurring complaint**
3. **Likely business impact**
4. **Automation opportunity**

Example:

| Issue detected | What customers are experiencing | Possible business impact | Automation opportunity |
|---|---|---|---|
| Slow updates | Customers wait for status information | More follow-up calls/messages | Automatic status notifications |

Only present research findings that can actually be supported by the available information.

If review research was not performed or reliable evidence is unavailable, say so rather than inventing findings.

---

## 5. Recommended Automation

### Dynamic heading

**The Automation We Recommend**

Explain the proposed automation in plain English.

Include:

- What triggers the process.
- What information is received.
- What checks happen.
- What action is taken.
- Who or what receives the result.
- What the customer or staff member receives.
- What gets recorded for tracking or audit.

This should describe the actual proposed automation, not a generic promise.

---

## 6. What Was Built

### Dynamic heading

**What We Built for You**

State exactly what was created.

Include the current implementation status.

Possible status labels:

- Starter Build
- Demo / Test Build
- Ready for Connection
- Production Ready

Do not call an automation production-live unless the real business systems have actually been connected and the production workflow has been confirmed.

The existing GIG handover demonstrates the distinction that should be preserved: the starter workflow was tested, while the real order form and dispatch record still required connection before going live.

---

## 7. What We Tested

### Dynamic heading

**What We Tested**

List the actual test scenarios performed.

Where relevant, include:

- Normal successful request.
- Missing information.
- Duplicate submission.
- Failed delivery or notification.
- Other business-specific failure cases.

For each test, show a simple result such as:

**Passed — [plain-English explanation]**

Do not claim that a scenario was tested unless it actually was.

---

## 8. Client Approval

### Dynamic heading

**Your Approval**

The client should receive one very clear instruction.

Example:

> If you are happy with the automation described in this document, reply directly to the email that sent you this handover and write:
>
> **I APPROVE THIS AUTOMATION**
>
> This approval tells us that you are happy for us to proceed to the secure connection and implementation stage.

The exact approval wording should be consistent so the automation can detect and process the response reliably.

The approval email itself should become the trigger for the next internal stage.

---

## 9. What Happens After Approval

### Dynamic heading

**What Happens Next**

Explain the process in simple steps:

1. **You approve the automation.**
2. **Your approval is recorded.**
3. **You receive a secure connection/onboarding form.**
4. **We collect only the information required to connect the approved services.**
5. **The developer receives a clear wiring checklist.**
6. **The automation is connected to the client's real systems.**
7. **The connected workflow is tested again.**
8. **A final go-live check is completed.**
9. **The automation is activated.**

The client-facing explanation must make clear that approval does not automatically mean the automation immediately goes live.

---

## 10. Secure Connection Process

### Dynamic heading

**Secure Connection**

Never instruct clients to send passwords or sensitive credentials by ordinary email.

The document should explain:

> We will never ask you to send passwords through ordinary email. If a service needs to be connected, we will provide a secure connection method or secure form appropriate to that service.

Where supported, use secure account-authorisation methods rather than collecting a username and password.

The system should determine what connection information is required based on the services involved.

The client should not need to understand APIs or automation platforms.

---

## 11. Developer Wiring Stage

### Internal / Developer Section

This section can contain technical language because it is intended for the developer, not the client.

It should provide a concise checklist showing:

- Automation approved: Yes / No
- Client connection information received: Yes / No
- Required services
- Required connections
- Required credentials or authorisations
- Test data available
- Production data connection
- Workflow imported/configured
- Error handling checked
- Duplicate handling checked where applicable
- Notifications checked
- Final test completed
- Go-live approved

The goal is to make the developer's job straightforward and minimise unnecessary back-and-forth with the client.

---

## 12. AI-Assisted Developer Wiring

The system should provide an AI-assisted setup guide after client approval.

The AI should:

1. Read the approved automation specification.
2. Identify the services that need connecting.
3. Identify the information/authorisation required from the client.
4. Produce a step-by-step developer wiring checklist.
5. Explain each required connection.
6. Identify missing information.
7. Flag anything that requires human confirmation.
8. Confirm when the workflow is ready for final testing.

The AI should assist the developer rather than silently taking unrestricted control of production credentials or systems.

A human approval point should remain before production activation.

---

## 13. Final Go-Live Status

### Dynamic heading

**Ready for Launch**

Use a simple status summary:

| Item | Status |
|---|---|
| Automation design | Complete / Pending |
| Client approval | Complete / Pending |
| Secure connections | Complete / Pending |
| Developer wiring | Complete / Pending |
| Final testing | Complete / Pending |
| Production launch | Complete / Pending |

Only mark an item complete when the underlying action has actually happened.

---

## 14. Support and Handover

Include the applicable support arrangement for the specific project.

For the existing LordGen starter-build model, the GIG handover states that LordGen covers the starter build for 14 days from handover for defect fixes at no charge, while production connection work is separate.

This wording should be dynamically populated from the project's actual support terms rather than copied into every client document.

---

## 15. Core Design Rules

The generated handover must always be:

- Client-friendly.
- Easy to understand.
- Visually clean.
- Specific to the client's business.
- Dynamic rather than industry-hard-coded.
- Honest about what has and has not been built.
- Clear about what has and has not been tested.
- Clear about what approval means.
- Clear about what happens after approval.
- Secure about credentials and account access.
- Separate in presentation between client information and developer instructions.

### Most important principle

**The client should understand the value and approve the automation without needing to understand the technology behind it.**

The developer should receive enough technical information to connect and launch the approved automation without repeatedly asking the client to explain technical concepts.

---

## Recommended document flow

**1. How automation can help your business**  
↓  
**2. Standard automation opportunities for your business category**  
↓  
**3. Simple example workflow**  
↓  
**4. What we found / review research**  
↓  
**5. The automation we recommend**  
↓  
**6. What we built**  
↓  
**7. What we tested**  
↓  
**8. Your approval**  
↓  
**9. Secure connection stage**  
↓  
**10. Developer wiring checklist**  
↓  
**11. Final testing and go-live status**  
↓  
**12. Support / handover**

This is the universal specification. The content inside the sections should change according to the client's business, submitted information, research findings, approved automation, actual tests, and project support terms.
