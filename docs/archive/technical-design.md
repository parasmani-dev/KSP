# TECHNICAL DESIGN DOCUMENT (TDD)

# Crime Intelligence Operating System (CIOS)

Version: 1.0

Type: Hackathon MVP + Deployable Prototype

Team Size: 4 Developers

---

# 1. SYSTEM OVERVIEW

Crime Intelligence Operating System (CIOS) is an AI-powered crime intelligence platform designed to transform fragmented crime records into actionable intelligence.

The platform combines:

- Multi-Agent Investigation System

- Neural Network Crime Prediction

- Crime Chain Discovery

- Citizen Risk Intelligence

- Evidence Analysis

- Kannada AI Copilot

- Explainable AI

- Real-Time Intelligence Streaming


The system enables law enforcement agencies to move from reactive investigations to proactive crime prevention.

---

# 2. PRIMARY OBJECTIVE

Convert:

Raw FIRs
+
Crime Records
+
Citizen Information
+
Location Data

Into:

Risk Intelligence
+
Crime Networks
+
Predictions
+
Autonomous Investigation Reports

---

# 3. HIGH LEVEL ARCHITECTURE

Frontend
↓
Spring Boot API Gateway
↓
Business Services Layer
↓
PostgreSQL

AND

Business Services Layer
↓
AI Services (Python)

AND

Business Services Layer
↓
NetworkX Graph Engine

AND

Business Services Layer
↓
Kafka

AND

Kafka
↓
WebSocket Push Events

AND

Neo4j Visualization Layer
↓
Graph Dashboard

---

# 4. TECH STACK

Frontend

- Next.js

- TypeScript

- Tailwind CSS

- ShadCN UI

- React Query


Backend

- Spring Boot

- Java 21

- JWT Authentication


Database

- PostgreSQL


AI Layer

- Python

- FastAPI

- Scikit-learn

- PyTorch


Graph Analytics

- NetworkX


Graph Visualization

- Neo4j


Streaming

- Kafka

- WebSockets


Deployment

Frontend:

- Vercel


Backend:

- Render


Database:

- Neon PostgreSQL


Neo4j:

- Neo4j Aura Free


---

# 5. CORE MODULES

MODULE 1

Crime Prediction Engine

MODULE 2

Crime Chain Discovery

MODULE 3

Citizen Risk Intelligence

MODULE 4

Evidence Analyzer

MODULE 5

Multi-Agent Investigation

MODULE 6

Kannada AI Copilot

MODULE 7

Explainable AI

MODULE 8

Real-Time Intelligence

MODULE 9

Investigation Dashboard

---

# 6. USER ROLES

ADMIN

Permissions

- Full Access

- User Management

- Model Management

- Dashboard Access


INVESTIGATOR

Permissions

- View Cases

- Run Investigation

- View Graphs

- Generate Reports


ANALYST

Permissions

- View Analytics

- Risk Assessment

- Prediction Results


DEMO USER

Permissions

- Read Only


---

# 7. DATABASE DESIGN

TABLE: users

id
name
email
password_hash
role
created_at

TABLE: crime_records

id
crime_type
location
latitude
longitude
date
time
description
status

TABLE: citizens

id
name
age
address
risk_score

TABLE: evidence

id
case_id
document_path
analysis_result
created_at

TABLE: predictions

id
location
crime_type
risk_score
prediction_date

TABLE: investigations

id
case_id
agent_output
generated_report

TABLE: alerts

id
alert_type
message
severity
timestamp

---

# 8. GRAPH MODEL

NODE TYPES

Citizen

Crime

Location

Vehicle

Organization

Investigator

Case

Evidence

AGENT

RELATIONSHIPS

INVOLVED_IN

CONNECTED_TO

VISITED

OWNS

PART_OF

ASSOCIATED_WITH

INVESTIGATED_BY

REPORTED_IN

---

# 9. CRIME CHAIN DISCOVERY ENGINE

INPUT

Crime Records

OUTPUT

Criminal Network Graph

PROCESS

Step 1

Create nodes

Citizen
Vehicle
Case
Location

Step 2

Create relationships

Citizen → Crime

Crime → Location

Citizen → Vehicle

Citizen → Citizen

Step 3

Run graph analysis

Centrality

Community Detection

Path Analysis

Connected Components

Step 4

Generate intelligence

Output:

Possible Gang

Frequent Collaborators

Key Suspects

Crime Routes

---

# 10. EVIDENCE ANALYZER

INPUT

FIR

Complaint

Witness Statement

PDF

TEXT

OUTPUT

Structured Entities

PROCESS

NER Extraction

Extract

Names

Dates

Locations

Vehicles

Organizations

Crime Type

Store in PostgreSQL

Create graph nodes

Send event to Kafka

---

# 11. MULTI AGENT INVESTIGATION SYSTEM

Agent 1

Evidence Agent

Responsibilities

Read FIR

Extract Entities

Store Intelligence

---

Agent 2

Pattern Agent

Responsibilities

Find Similar Crimes

Identify Patterns

Generate Similarity Score

---

Agent 3

Network Agent

Responsibilities

Build Criminal Graph

Find Hidden Connections

Run Network Analysis

---

Agent 4

Risk Agent

Responsibilities

Run Neural Model

Generate Risk Forecast

---

Agent 5

Report Agent

Responsibilities

Create Final Report

Generate Executive Summary

---

AGENT WORKFLOW

Evidence Agent

↓

Pattern Agent

↓

Network Agent

↓

Risk Agent

↓

Report Agent

---

# 12. NEURAL NETWORK PREDICTION ENGINE

MODEL

Multi Layer Perceptron

INPUT FEATURES

Crime Type

Location

Month

Day

Hour

Historical Count

OUTPUT

Risk Score

Architecture

Input Layer

↓

Dense Layer

↓

ReLU

↓

Dense Layer

↓

Output Layer

Prediction Range

0-100

---

# 13. CITIZEN RISK INTELLIGENCE

INPUT

Crime History

Associations

Location Risk

Evidence Mentions

OUTPUT

Citizen Risk Score

FORMULA

Risk Score =

Crime History Weight

Network Influence Weight

Location Weight

Evidence Weight

OUTPUT

0-100

Risk Categories

0-30 Low

31-60 Medium

61-80 High

81-100 Critical

---

# 14. EXPLAINABLE AI LAYER

Purpose

Explain every prediction.

Example

Risk Score

84

Reason

Connected to 4 suspects

Mentioned in 3 investigations

Located near hotspot

High frequency activity

No black-box decisions.

---

# 15. KANNADA AI COPILOT

INPUT

Natural Language

Examples

Why is this area risky?

Show connected suspects.

Explain this FIR.

OUTPUT

Kannada

English

Capabilities

Graph Queries

Case Queries

Prediction Explanation

Investigation Summary

Dashboard Navigation

---

# 16. REAL-TIME INTELLIGENCE PIPELINE

Kafka Topics

crime-events

evidence-events

prediction-events

investigation-events

alert-events

FLOW

New FIR

↓

Kafka Event

↓

Evidence Analyzer

↓

Prediction Engine

↓

Graph Update

↓

Alert Generation

↓

WebSocket Push

↓

Dashboard Update

---

# 17. WEBSOCKET EVENTS

EVENT

NEW_CRIME

EVENT

NEW_ALERT

EVENT

GRAPH_UPDATED

EVENT

PREDICTION_UPDATED

EVENT

INVESTIGATION_COMPLETED

---

# 18. REST APIs

AUTH

POST /auth/login

POST /auth/register

USER

GET /users

GET /users/{id}

CRIMES

GET /crimes

POST /crimes

GET /crimes/{id}

PREDICTIONS

GET /predictions

POST /predictions/run

GRAPH

GET /graph/network

GET /graph/case/{id}

INVESTIGATION

POST /investigation/start

GET /investigation/{id}

EVIDENCE

POST /evidence/upload

GET /evidence/{id}

COPILOT

POST /copilot/chat

---

# 19. DASHBOARD SECTIONS

PAGE 1

Command Center

Live Crime Feed

Alerts

Statistics

---

PAGE 2

Prediction Dashboard

Heatmap

Hotspots

Forecasts

---

PAGE 3

Crime Network Dashboard

Neo4j Visualization

Suspect Connections

Crime Chains

---

PAGE 4

Evidence Analyzer

Upload FIR

Entity Extraction

Generated Intelligence

---

PAGE 5

Citizen Risk Dashboard

Risk Scores

Risk Breakdown

Explanations

---

PAGE 6

AI Investigation Dashboard

Agent Outputs

Generated Reports

---

PAGE 7

Kannada Copilot

Chat Interface

Investigation Queries

---

# 20. PRESENTATION FLOW

STEP 1

Upload FIR

STEP 2

Evidence Analyzer Extracts Entities

STEP 3

Graph Updates Automatically

STEP 4

Crime Chain Appears

STEP 5

Multi-Agent Investigation Starts

STEP 6

Neural Model Generates Risk

STEP 7

Citizen Risk Scores Generated

STEP 8

Explainable AI Justification Displayed

STEP 9

Kannada Copilot Explains Findings

STEP 10

Officer Receives Alert

This demonstrates the complete intelligence lifecycle.

---

# 21. SUCCESS METRICS

Prediction Generated < 3 Seconds

Evidence Analysis < 5 Seconds

Graph Update < 2 Seconds

Copilot Response < 3 Seconds

Dashboard Load < 2 Seconds

System Uptime > 95%

---

# 22. HACKATHON MVP SCOPE

MANDATORY

Crime Prediction

Crime Chain Discovery

Evidence Analyzer

Multi-Agent Investigation

Citizen Risk Intelligence

Explainable AI

Kannada Copilot

Neo4j Graph

Dashboard

OPTIONAL

Kafka

WebSockets

RBAC

Audit Logs

---

# 23. JUDGE WINNING DIFFERENTIATORS

1. Autonomous Multi-Agent Investigation

2. Crime Chain Discovery

3. Explainable AI

4. Citizen Risk Intelligence Layer

5. Kannada Copilot

6. Neural Crime Prediction

7. Real-Time Intelligence Pipeline

8. End-to-End Investigation Workflow

9. Interactive Crime Network Visualization

10. Crime Intelligence Operating System Concept


END OF DOCUMENT