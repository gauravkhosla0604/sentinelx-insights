# SentinelX Insights

You are continuing development of an existing project called SentinelX.

PROJECT CONTEXT

SentinelX is being developed for Smart India Hackathon 2026 – Problem Statement SIH26106.

Core concept:

Traditional tools analyze emails. SentinelX reconstructs campaigns.

SentinelX is an AI-assisted email threat investigation platform. It should NOT behave like a simple phishing detector. Its purpose is to take a suspicious email and help an investigator understand:

Why the email is suspicious

What forensic evidence supports the conclusion

Which IPs/domains/URLs are involved

Whether the email is connected to previous incidents

Whether multiple emails belong to the same campaign

How the attack may have evolved

What actions an investigator should take

How evidence can be preserved and reported

The repository already contains a working SentinelX application.

GitHub repository:
https://github.com/Gurarsh2912/SentinelX

The existing website was primarily built using Antigravity, so assume that substantial functionality and UI already exist.

VERY IMPORTANT DEVELOPMENT CONSTRAINT

I have limited Cursor credits and very little time before the SIH presentation.

Therefore:

DO NOT rebuild the project.

DO NOT rewrite existing working components.

DO NOT introduce unnecessary frameworks.

DO NOT create a new architecture.

DO NOT add random AI features.

DO NOT spend time on cosmetic redesigns unless absolutely necessary.

First inspect the repository and understand the existing architecture, components, API routes, data flow, and styling.

Reuse as much existing code as possible.

Before modifying anything, identify what already exists for:

.eml parsing

threat analysis

SPF/DKIM/DMARC analysis

URL/domain analysis

lookalike-domain detection

campaign correlation

evidence graph

attack story

AI analysis

response pack

existing dashboard/UI

If an existing feature already does something similar to what is requested below, extend it instead of creating a duplicate implementation.

PRIMARY GOAL

Implement only these 4 high-impact improvements.

Priority:

Evidence-Based Threat Score

Campaign DNA / Related Attacks

Investigation Evidence Graph improvements

One-click Investigation Report

These features should make the existing SentinelX feel like a professional email forensic investigation and campaign intelligence platform.

FEATURE 1 — EVIDENCE-BASED THREAT SCORE

The existing threat score should become much more explainable.

Instead of only showing something like:

"Threat Score: 87"

create an investigation-friendly breakdown.

Example:

THREAT SCORE
91 / 100
CRITICAL

WHY?

+20 DMARC Failure
+15 SPF Failure
+15 Lookalike Domain
+10 Reply-To Mismatch
+10 Suspicious URL
+10 Urgency/Social Engineering
+11 Campaign Correlation

The exact factors must come from the existing analysis engine.

Do NOT hardcode fake findings.

If the existing threat engine already calculates these values, reuse them.

Add a visually clear "Why this score?" section.

Each finding should ideally have:

Finding name

Severity

Score contribution

Short explanation

Evidence source

For example:

DMARC Failure
Score: +20
Evidence: Authentication results from email headers

Make the UI allow the investigator to understand where the verdict came from.

IMPORTANT:

The final security score must remain primarily evidence/rule driven.

AI should explain or interpret evidence, not invent security findings.

FEATURE 2 — CAMPAIGN DNA / RELATED ATTACKS

The existing campaign correlation functionality is already an important part of SentinelX.

Do NOT create another campaign engine.

Improve the existing campaign result and presentation.

After analyzing an email, show something like:

CAMPAIGN DNA

Campaign Match: 92%

Potentially related to:

Campaign: Fake Microsoft Credential Harvesting

12 previous incidents
4 domains
3 IPs
8 URLs

Shared Indicators:

✓ Same sending infrastructure
✓ Same URL/domain infrastructure
✓ Similar sender pattern
✓ Similar attack language
✓ Related historical incidents

Use the existing campaign correlation data wherever possible.

If the current backend already calculates similarity/matching factors, expose those factors clearly in the UI.

If appropriate, show:

Infrastructure similarity
Domain similarity
URL similarity
Sender similarity
Language/intent similarity

Do not fabricate percentages.

If the current system doesn't have enough data for a percentage, use a qualitative result such as:

HIGH / MEDIUM / LOW

The main goal is to demonstrate:

One suspicious email can reveal a larger coordinated campaign.

FEATURE 3 — IMPROVE THE EXISTING EVIDENCE GRAPH

The repository already has an evidence/relationship graph.

Do NOT replace it with a completely new graph system.

Improve the existing graph so that the investigation relationship is visually obvious.

Desired relationship:

Email
↓
Sender
↓
Domain
↓
URL
↓
IP / Infrastructure
↓
Historical Incident
↓
Campaign

Use the existing graph data.

Nodes should be understandable and visually distinct by type.

For example:

EMAIL
DOMAIN
URL
IP
INCIDENT
CAMPAIGN

Clicking a node should show useful information if the current architecture supports it.

For example, clicking an IP can show:

IP address
Related domains
Related incidents

Clicking a domain can show:

Domain
Related URLs
Related emails/incidents

Clicking a campaign can show:

Campaign name
Number of related incidents
Shared infrastructure

Keep this implementation lightweight.

The graph does NOT need advanced graph algorithms.

The goal is a strong visual explanation of:

"Follow the evidence."

FEATURE 4 — ONE-CLICK INVESTIGATION REPORT

Add a prominent action:

"Generate Investigation Report"

or

"Generate Evidence Report"

This should convert the current investigation into a professional investigator-friendly report.

Reuse the existing analysis data.

The report should contain:

SENTINELX INCIDENT REPORT

Incident ID

Threat Level

Threat Score

1. Email Information

Sender
Recipient if available
Subject
Timestamp

2. Forensic Findings

SPF
DKIM
DMARC
Reply-To
Return-Path
Header anomalies

3. Indicators of Compromise

IPs
Domains
URLs
Other extracted indicators

4. Threat Assessment

Threat score
Severity
Reasons for the score

5. Campaign Intelligence

Campaign match
Related incidents
Shared indicators

6. Attack Timeline

Use the existing attack story/timeline data if available.

7. Evidence Integrity

Generate a SHA-256 hash for the original uploaded .eml if this is not already implemented.

Display:

Evidence ID
SHA-256
Analysis timestamp

The original evidence should never be modified.

8. Recommended Actions

Use the existing response-pack recommendations.

Examples:

Quarantine email

Block malicious domain

Block malicious URL/IP

Search for related emails

Investigate affected users

Preserve evidence

The report should be downloadable.

Prefer a simple reliable implementation such as:

print-friendly HTML

downloadable HTML

or PDF if the existing stack already supports it easily

Do NOT introduce a complicated PDF system if it will consume significant development time.

DESIGN REQUIREMENTS

Do not redesign the entire SentinelX UI.

Maintain the existing visual language.

Only improve the areas necessary for the four features.

The interface should feel:

Professional

Cybersecurity/SOC oriented

Evidence-driven

Clean

Fast

Easy to understand during a live demonstration

Prioritize:

clear severity indicators

evidence cards

campaign information

graph visualization

strong action buttons

Avoid unnecessary animations.

DATA INTEGRITY REQUIREMENT

This is critical.

Do NOT create fake threat intelligence or fake analysis results just to make the UI look impressive.

All displayed values should come from:

parsed email data

existing threat engine

existing campaign engine

existing graph data

existing AI analysis

historical incident dataset already present in the repository

If something cannot be determined, explicitly display:

"Not available"

or

"Insufficient evidence"

rather than inventing a value.

AI REQUIREMENT

Keep the existing AI implementation.

Do not replace it with another AI provider unless the current implementation is broken.

AI should primarily provide:

explanation

summarization

attack narrative

interpretation of forensic evidence

investigator recommendations

The AI must not invent IP addresses, domains, incidents, or forensic findings.

Where possible, connect AI explanations to actual extracted evidence.

DEMO-FIRST OPTIMIZATION

The application will be demonstrated to SIH judges.

The complete demo flow should work smoothly:

Upload suspicious .eml

Parse email

Analyze threat

Display threat score

Show "Why this email is suspicious?"

Show Campaign DNA / related incidents

Show evidence graph

Show attack story/timeline

Generate investigation report

The entire flow should feel like:

SUSPICIOUS EMAIL
↓
FORENSIC ANALYSIS
↓
THREAT SCORE
↓
EVIDENCE
↓
CAMPAIGN CONNECTION
↓
ATTACK STORY
↓
INVESTIGATION REPORT

IMPLEMENTATION PROCESS

Before coding:

Inspect the existing repository.

Identify the relevant files.

Identify which of the four requested features already partially exist.

Reuse those implementations.

Make the smallest reasonable changes.

Then implement the features one at a time.

After each feature:

Check TypeScript/JavaScript errors

Check imports

Check API routes

Check that existing functionality still works

Avoid breaking the current UI

Do NOT modify unrelated files.

Do NOT refactor working code unless required.

PRIORITY IF TIME/CREDITS RUN LOW

If implementation time or Cursor credits become limited, stop after these priorities:

P0 — MUST WORK

Evidence-Based Threat Score

P0 — MUST WORK

Campaign DNA / Related Attacks

P0 — MUST WORK

Investigation Report

P1 — NICE TO HAVE

Enhanced Evidence Graph

Do not spend remaining credits on unrelated improvements.

FINAL QUALITY CHECK

Before finishing, verify:

Existing .eml analysis still works

Existing dashboard still works

Existing AI analysis still works

Existing campaign correlation still works

Existing evidence graph still works

No existing feature was unnecessarily removed

No fake intelligence was introduced

No hardcoded suspicious results are used for the real analysis flow

Investigation report contains actual analysis data

SHA-256 evidence hash is generated from the original file

The application can be demonstrated from upload → investigation → report

Keep the implementation simple, robust and demo-ready.

The objective is NOT to make SentinelX huge.

The objective is to make the existing SentinelX feel like a serious forensic investigation and campaign intelligence product with the smallest possible amount of new code.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9d4ad8cd-6d09-40d1-9228-5cbc25b4499e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
