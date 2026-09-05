# 🚨 SentinelX

### Email Threat Investigation & Campaign Intelligence Platform

> **SentinelX doesn't just detect a malicious email. It reconstructs the attack behind the email.**

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/SIH-SIH26106-red)](https://www.sih.gov.in/)
[![Next.js](https://img.shields.io/badge/Next.js-TypeScript-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🎯 Overview

**SentinelX** is an AI-assisted email threat investigation and forensic intelligence platform designed for **SIH 2026 Problem Statement SIH26106**.

Traditional email security tools primarily answer:

> **"Is this email malicious?"**

SentinelX goes further and asks:

> **"Why is this email suspicious, what infrastructure is behind it, is it connected to other incidents, and what does the complete attack story look like?"**

The platform transforms a suspicious `.eml` file into an evidence-backed investigation:

```text
Suspicious Email
       ↓
Email Forensics
       ↓
Threat Analysis
       ↓
Header & Authentication Analysis
       ↓
IOC Extraction
       ↓
Infrastructure Intelligence
       ↓
Campaign DNA
       ↓
Evidence Graph
       ↓
Attack Story
       ↓
Response Pack
```

---

# 🧩 Problem

Email-based attacks have evolved beyond simple phishing.

Attackers increasingly use:

* Sender impersonation
* Business Email Compromise (BEC)
* Spoofed domains
* Lookalike domains
* Malicious URLs
* Suspicious attachments
* Social engineering
* Forged or manipulated headers
* Disposable/cloud infrastructure
* Reused attack infrastructure
* Multi-stage campaigns

Investigators often need to manually examine email headers, URLs, domains, IP addresses and previous incidents before understanding the broader attack.

This makes investigations:

* Slow
* Fragmented
* Difficult to correlate
* Evidence-intensive
* Dependent on technical expertise

**SentinelX brings these investigation steps into a single workflow.**

---

# 💡 Our Solution

SentinelX accepts a suspicious email, preferably in `.eml` format, and converts it into a structured investigation.

The platform combines:

### 🔍 Email Forensics

Analyzes the raw email and extracts important metadata and headers.

### 🧠 Threat Analysis

Evaluates phishing, impersonation, urgency, social engineering and other suspicious signals.

### 📨 Header Forensics

Examines:

* From
* Reply-To
* Return-Path
* Message-ID
* Received headers
* SPF
* DKIM
* DMARC
* Authentication-Results

and identifies suspicious inconsistencies.

### 🌐 Infrastructure Analysis

Reconstructs the available SMTP relay path and extracts infrastructure indicators such as IP addresses and hostnames.

### 🧬 Campaign DNA

Connects related incidents using observable indicators such as:

* Domains
* IP addresses
* URLs
* Sender identities
* Attachments
* Subject patterns
* Infrastructure overlap

### 🕸️ Evidence Graph

Visualizes relationships between:

```text
Email
 ├── Sender
 ├── Domain
 ├── IP
 ├── URL
 ├── Attachment
 └── Related Incidents
```

### 📖 Attack Story

Converts technical findings into a human-readable investigation narrative explaining how the suspicious email fits into a potential campaign.

### 📦 Response Pack

Provides a structured collection of evidence, indicators, findings and recommended actions for investigators.

---

# ⭐ Key Features

| Feature                        | Description                                                |
| ------------------------------ | ---------------------------------------------------------- |
| 📧 `.eml` Analysis             | Upload and analyze suspicious raw email files              |
| 🔎 Header Forensics            | Examine critical email headers and inconsistencies         |
| 🛡️ SPF/DKIM/DMARC             | Analyze available email authentication evidence            |
| 🛰️ Relay Path                 | Reconstruct available `Received` header chain              |
| 🌐 Infrastructure Intelligence | Identify observable IP/domain infrastructure               |
| 🧩 IOC Extraction              | Extract URLs, IPs, domains, emails and other indicators    |
| 🧬 Campaign DNA                | Correlate related suspicious incidents                     |
| 🕸️ Evidence Graph             | Visualize relationships between attack indicators          |
| 📊 Threat Score                | Evidence-based risk scoring                                |
| 📖 Attack Story                | Convert technical evidence into an investigation narrative |
| 🔐 Evidence Integrity          | SHA-256 evidence hashing and case identification           |
| 📋 Forensic Report             | Consolidate investigation findings                         |
| 📦 Response Pack               | Prepare structured investigation/response information      |

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │   Suspicious .EML   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Email Parser     │
                    │   & Normalization   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌────────────┐   ┌────────────┐   ┌────────────┐
       │   Header   │   │    IOC     │   │  Content   │
       │  Forensics │   │ Extraction │   │  Analysis  │
       └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │   Threat Engine     │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼────────────────┐
               ▼               ▼                ▼
        ┌────────────┐  ┌────────────┐   ┌────────────┐
        │ Campaign   │  │  Evidence  │   │Infrastructure│
        │    DNA     │  │   Graph    │   │ Intelligence│
        └─────┬──────┘  └─────┬──────┘   └─────┬──────┘
              └───────────────┼────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │    Attack Story     │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │   Response Pack     │
                    └─────────────────────┘
```

---

# 🔬 Investigation Workflow

## 1. Submit Evidence

The investigator uploads a suspicious `.eml` file.

SentinelX preserves the evidence context and generates an evidence identifier and integrity hash where supported.

---

## 2. Analyze Email Headers

The platform examines sender and routing information.

Examples of investigated relationships:

```text
From
  ↕
Reply-To

From
  ↕
Return-Path

Message-ID
  ↕
Sender Domain

Received Headers
  ↓
Relay Infrastructure
```

Potential inconsistencies are surfaced as investigation signals.

---

## 3. Extract Indicators

SentinelX identifies observable indicators including:

```text
Email Addresses
Domains
URLs
IP Addresses
Attachment Names
File Hashes
```

These indicators become building blocks for the investigation.

---

## 4. Build Infrastructure View

Available `Received` headers are analyzed to reconstruct the email's relay path.

```text
Sender
   ↓
Mail Server
   ↓
Relay
   ↓
Observed Infrastructure
```

The system treats header evidence carefully because individual `Received` entries may not always be trustworthy.

---

## 5. Detect Campaign Relationships

SentinelX compares observable indicators across incidents.

For example:

```text
Email A ──┐
          ├── suspicious-domain.com
Email B ──┤
          ├── 185.x.x.x
Email C ──┘
```

This can reveal infrastructure reuse and possible campaign-level relationships.

---

## 6. Reconstruct the Attack Story

Instead of presenting investigators with disconnected technical values, SentinelX summarizes the evidence into a chronological investigation narrative.

```text
Initial Contact
      ↓
Social Engineering
      ↓
Identity Anomaly
      ↓
Infrastructure Evidence
      ↓
Campaign Relationship
      ↓
Potential Objective
      ↓
Recommended Response
```

---

# 🧬 Campaign DNA

One of SentinelX's key differentiators is **Campaign DNA**.

Instead of investigating every suspicious email independently, SentinelX looks for reusable attack characteristics.

Potential correlation signals include:

* Sender domain
* Reply-To domain
* IP address
* URL
* Attachment name
* Subject similarity
* Message-ID patterns
* Infrastructure overlap

This helps investigators move from:

> **"This email looks suspicious."**

to:

> **"This email appears to share infrastructure and indicators with a larger campaign."**

---

# 🕸️ Evidence Graph

SentinelX represents investigation evidence as a relationship graph.

Example:

```text
                 ┌──────────────┐
                 │ Suspicious   │
                 │    Email     │
                 └──────┬───────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     ┌─────────┐   ┌─────────┐   ┌─────────┐
     │ Domain  │   │   URL   │   │   IP    │
     └────┬────┘   └─────────┘   └────┬────┘
          │                            │
          ▼                            ▼
     ┌─────────┐                 ┌──────────┐
     │Campaign │                 │Incident  │
     │   DNA   │                 │ History  │
     └─────────┘                 └──────────┘
```

This gives investigators a visual representation of how individual indicators are connected.

---

# 📊 Threat Scoring

SentinelX combines multiple observable signals to produce a threat score.

Potential signals include:

* Header anomalies
* Authentication anomalies
* Sender identity mismatch
* Suspicious URLs
* Suspicious domains
* Attachments
* Social engineering indicators
* Infrastructure anomalies
* Campaign overlap

The score is accompanied by an explanation of **why** the email received its risk rating.

> A threat score is an investigation aid, not definitive proof of malicious intent.

---

# 🔐 Evidence Integrity

Forensic investigations require evidence integrity.

SentinelX can generate:

* Evidence ID
* SHA-256 hash
* Investigation timestamp
* Integrity status

The objective is to help investigators verify that the analyzed evidence corresponds to the submitted email content.

---

# 🛡️ Security & Privacy

SentinelX is designed with forensic and privacy considerations in mind.

Important principles:

* Preserve original evidence where possible
* Avoid modifying submitted evidence
* Generate cryptographic hashes for integrity verification
* Minimize unnecessary personal information exposure
* Clearly distinguish evidence from inference
* Avoid definitive attribution from infrastructure alone
* Treat IP geolocation as infrastructure intelligence rather than attacker identification
* Clearly indicate unavailable external intelligence
* Support evidence-based investigation rather than automated accusation

---

# ⚠️ Attribution Disclaimer

SentinelX does **not** claim to identify the real-world person behind an email solely from an IP address, domain or email header.

Infrastructure may involve:

* VPNs
* Proxies
* TOR
* Cloud providers
* Compromised systems
* Open relays
* Shared hosting

Therefore, SentinelX focuses on:

> **probable infrastructure origin and evidence-backed relationships**

rather than definitive individual attribution.

---

# 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Application Logic

* Email parsing
* Threat analysis engine
* Campaign correlation engine
* Graph generation
* IOC extraction
* Evidence integrity processing

### Development

* Git
* GitHub
* VS Code
* Lovable

---

# 📁 Project Structure

```text
SentinelX/
│
├── app/
│   └── Application pages and layouts
│
├── components/
│   ├── AiAnalysisCard.tsx
│   ├── AttackStory.tsx
│   ├── CampaignDnaCard.tsx
│   ├── CampaignGraph.tsx
│   ├── EmailOverview.tsx
│   ├── EvidenceCards.tsx
│   ├── ForensicsTab.tsx
│   ├── Header.tsx
│   ├── ResponsePack.tsx
│   ├── ThreatScoreWidget.tsx
│   └── UploadZone.tsx
│
├── data/
│   ├── demo-attack.eml
│   └── incidents.json
│
├── lib/
│   ├── ai.ts
│   ├── campaign-engine.ts
│   ├── email-parser.ts
│   ├── graph-builder.ts
│   ├── threat-engine.ts
│   └── utils.ts
│
├── types/
│
├── package.json
├── next.config.*
├── tailwind.config.*
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Gurarsh2912/SentinelX.git
```

Navigate into the project:

```bash
cd SentinelX
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Demo

SentinelX includes a demonstration email in:

```text
data/demo-attack.eml
```

The demo can be used to showcase the complete investigation pipeline.

### Recommended SIH Demo

```text
1. Upload suspicious .eml
        ↓
2. Show Threat Score
        ↓
3. Open Header Forensics
        ↓
4. Show SPF/DKIM/DMARC evidence
        ↓
5. Show Received/Relay Path
        ↓
6. Show extracted IOCs
        ↓
7. Open Campaign DNA
        ↓
8. Demonstrate Evidence Graph
        ↓
9. Reveal Attack Story
        ↓
10. Generate Response Pack
```

The key moment of the demonstration should be:

> **"We started with one suspicious email. SentinelX reconstructed the attack relationships behind it."**

---

# 🎯 SIH 2026 Alignment

**Problem Statement:** SIH26106

SentinelX addresses the major investigation requirements of the problem through:

| Requirement            | SentinelX Approach           |
| ---------------------- | ---------------------------- |
| Raw email analysis     | `.eml` ingestion and parsing |
| Phishing/BEC detection | Threat analysis engine       |
| Header analysis        | Header Forensics             |
| SPF/DKIM/DMARC         | Authentication analysis      |
| Relay reconstruction   | `Received` header analysis   |
| IP infrastructure      | Infrastructure intelligence  |
| Domain intelligence    | Domain/IOC analysis          |
| Threat indicators      | IOC extraction               |
| Incident correlation   | Campaign DNA                 |
| Relationship analysis  | Evidence Graph               |
| Investigation output   | Attack Story                 |
| Evidence preservation  | SHA-256 integrity            |
| Investigator workflow  | Response Pack                |

---

# 🔮 Future Roadmap

Potential future integrations include:

* Real-time IP geolocation
* WHOIS/RDAP intelligence
* DNS/MX intelligence
* VirusTotal integration
* AbuseIPDB integration
* URL reputation services
* Open threat-intelligence feeds
* Gmail/Outlook ingestion
* Browser/email security extension
* Institutional incident-management integration
* Automated evidence report generation
* Advanced ML-based email classification
* Multi-case investigation management

These integrations should be added only where reliable external data sources and appropriate privacy/legal controls are available.

---

# 🏆 What Makes SentinelX Different?

Most solutions stop at:

```text
Email → Phishing / Safe
```

SentinelX aims for:

```text
Email
  ↓
Evidence
  ↓
Threat Signals
  ↓
Infrastructure
  ↓
IOCs
  ↓
Related Incidents
  ↓
Campaign DNA
  ↓
Evidence Graph
  ↓
Attack Story
  ↓
Response
```

### The core idea:

> **Don't just detect the email. Investigate the attack behind it.**

---

# 👥 Team

**SentinelX — SIH 2026**

Built for **Smart India Hackathon 2026 — SIH26106**

---

# 📜 Disclaimer

SentinelX is an investigation and decision-support platform.

Its outputs should be treated as **evidence-backed indicators and investigative leads**, not definitive legal conclusions or attribution.

External intelligence may be incomplete, unavailable, outdated or inaccurate. Investigators should validate critical findings using authoritative sources before taking enforcement or legal action.

---

## ⭐ Support

If you find SentinelX useful, consider giving the repository a ⭐ on GitHub.

**SentinelX — From suspicious email to attack story.**

