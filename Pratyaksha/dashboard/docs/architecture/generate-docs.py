#!/usr/bin/env python3
"""
Pratyaksha Architecture Documentation Generator
Creates multi-page SVG documentation for product wireframes, AI architecture, DB schema, and RAG pipeline
"""

import os
import re

# Configuration
OUTPUT_DIR = "output"
PAGE_WIDTH = 1080
PAGE_HEIGHT = 1520  # A4 ratio
THEME = "dark"

# Color schemes
COLORS = {
    'dark': {
        'bg': '#0A0A0B',
        'surface': '#1A1A1D',
        'card': '#252528',
        'primary': '#F59E0B',
        'secondary': '#06B6D4',
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'text': '#E5E5E5',
        'text_secondary': '#999999',
        'border': '#333333',
        'accent1': '#8B5CF6',
        'accent2': '#EC4899'
    }
}

def escape_xml(text):
    """Escape XML special characters"""
    return (text
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&apos;'))

def create_cover_page(colors):
    """Generate cover page with index"""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{PAGE_WIDTH}" height="{PAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="{PAGE_WIDTH}" height="{PAGE_HEIGHT}" fill="{colors['bg']}"/>

  <!-- Header Section -->
  <text x="540" y="200" font-family="Arial, sans-serif" font-size="64" font-weight="bold"
        fill="{colors['primary']}" text-anchor="middle">
    PRATYAKSHA
  </text>

  <text x="540" y="250" font-family="Arial, sans-serif" font-size="24"
        fill="{colors['text_secondary']}" text-anchor="middle">
    Cognitive Journaling Platform - Technical Documentation
  </text>

  <text x="540" y="290" font-family="Arial, sans-serif" font-size="16"
        fill="{colors['text_secondary']}" text-anchor="middle">
    Architecture • Database • AI Pipeline • RAG System
  </text>

  <!-- Product Overview -->
  <text x="100" y="380" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
        fill="{colors['text']}">
    Product Overview
  </text>

  <text x="100" y="430" font-family="Arial, sans-serif" font-size="16"
        fill="{colors['text']}">
    AI-powered journaling platform that analyzes emotional patterns, provides personalized insights,
  </text>
  <text x="100" y="455" font-family="Arial, sans-serif" font-size="16"
        fill="{colors['text']}">
    and helps users understand their cognitive and emotional landscape through data-driven reflection.
  </text>

  <!-- Core Features -->
  <rect x="100" y="490" width="880" height="200" fill="{colors['card']}" rx="8"/>

  <text x="120" y="525" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        fill="{colors['primary']}">
    Core Features
  </text>

  <text x="140" y="560" font-family="Arial, sans-serif" font-size="14" fill="{colors['text']}">
    • 4-Agent AI Pipeline (Intent, Emotion, Theme, Insight)
  </text>
  <text x="140" y="585" font-family="Arial, sans-serif" font-size="14" fill="{colors['text']}">
    • RAG-powered personalized chat with semantic search
  </text>
  <text x="140" y="610" font-family="Arial, sans-serif" font-size="14" fill="{colors['text']}">
    • Life Blueprint & Soul Mapping for deep personalization
  </text>
  <text x="140" y="635" font-family="Arial, sans-serif" font-size="14" fill="{colors['text']}">
    • PostgreSQL + pgvector for vector embeddings
  </text>
  <text x="140" y="660" font-family="Arial, sans-serif" font-size="14" fill="{colors['text']}">
    • Real-time emotional analysis and pattern recognition
  </text>

  <!-- Tech Stack -->
  <text x="100" y="740" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
        fill="{colors['text']}">
    Tech Stack
  </text>

  <rect x="100" y="770" width="420" height="180" fill="{colors['card']}" rx="8"/>
  <text x="120" y="805" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['secondary']}">Frontend</text>
  <text x="140" y="835" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    React + Vite + TanStack Query
  </text>
  <text x="140" y="860" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Tailwind CSS + shadcn/ui
  </text>
  <text x="140" y="885" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Recharts for visualizations
  </text>
  <text x="140" y="910" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Firebase Authentication
  </text>
  <text x="140" y="935" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Port: 5173 (Vite dev server)
  </text>

  <rect x="560" y="770" width="420" height="180" fill="{colors['card']}" rx="8"/>
  <text x="580" y="805" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['secondary']}">Backend</text>
  <text x="600" y="835" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Express + TypeScript
  </text>
  <text x="600" y="860" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    PostgreSQL 16 + Drizzle ORM
  </text>
  <text x="600" y="885" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    LangChain + OpenRouter
  </text>
  <text x="600" y="910" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    pgvector for embeddings
  </text>
  <text x="600" y="935" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Port: 3001 (Express API)
  </text>

  <!-- Page Index -->
  <text x="100" y="1020" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
        fill="{colors['text']}">
    Documentation Index
  </text>

  <rect x="100" y="1050" width="880" height="370" fill="{colors['card']}" rx="8"/>

  <!-- Architecture Section -->
  <text x="120" y="1085" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['primary']}">
    ARCHITECTURE (Pages 01-03)
  </text>
  <text x="140" y="1115" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 01 - System Architecture Overview
  </text>
  <text x="140" y="1140" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 02 - 4-Agent AI Pipeline (Intent, Emotion, Theme, Insight)
  </text>
  <text x="140" y="1165" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 03 - RAG Pipeline & Embedding Flow
  </text>

  <!-- Database Section -->
  <text x="120" y="1210" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['primary']}">
    DATABASE (Pages 04-06)
  </text>
  <text x="140" y="1240" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 04 - Database Schema & Tables
  </text>
  <text x="140" y="1265" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 05 - User Profile & Gamification Schema
  </text>
  <text x="140" y="1290" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 06 - Entry Processing & Storage Flow
  </text>

  <!-- Product Section -->
  <text x="120" y="1335" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['primary']}">
    PRODUCT (Pages 07-10)
  </text>
  <text x="140" y="1365" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 07 - User Journey & Core Flows
  </text>
  <text x="140" y="1390" font-family="Arial, sans-serif" font-size="13" fill="{colors['text']}">
    Page 08 - Dashboard & Analytics
  </text>

  <!-- Footer -->
  <text x="540" y="{PAGE_HEIGHT - 40}" font-family="Arial, sans-serif" font-size="12"
        fill="{colors['text_secondary']}" text-anchor="middle">
    Generated: February 2026 • Version 1.0 • Page 00 of 10
  </text>
</svg>'''

def create_system_architecture_page(colors):
    """Page 01 - System Architecture Overview"""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{PAGE_WIDTH}" height="{PAGE_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="{PAGE_WIDTH}" height="{PAGE_HEIGHT}" fill="{colors['bg']}"/>

  <!-- Header -->
  <rect x="0" y="0" width="{PAGE_WIDTH}" height="80" fill="{colors['surface']}"/>
  <text x="40" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold"
        fill="{colors['primary']}">
    01 • System Architecture Overview
  </text>

  <!-- Client Layer -->
  <text x="40" y="130" font-family="Arial, sans-serif" font-size="20" font-weight="bold"
        fill="{colors['text']}">
    CLIENT LAYER
  </text>

  <rect x="40" y="150" width="1000" height="200" fill="{colors['card']}" stroke="{colors['secondary']}"
        stroke-width="2" rx="8"/>

  <!-- React Frontend Box -->
  <rect x="80" y="190" width="400" height="120" fill="{colors['surface']}" stroke="{colors['primary']}"
        stroke-width="2" rx="6"/>
  <text x="280" y="225" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['primary']}" text-anchor="middle">
    React Frontend
  </text>
  <text x="100" y="255" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • Vite (Port 5173)
  </text>
  <text x="100" y="275" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • TanStack Query (State Management)
  </text>
  <text x="100" y="295" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • Tailwind + shadcn/ui
  </text>

  <!-- Firebase Auth Box -->
  <rect x="560" y="190" width="400" height="120" fill="{colors['surface']}" stroke="{colors['accent1']}"
        stroke-width="2" rx="6"/>
  <text x="760" y="225" font-family="Arial, sans-serif" font-size="16" font-weight="bold"
        fill="{colors['accent1']}" text-anchor="middle">
    Firebase Authentication
  </text>
  <text x="580" y="255" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • User sign-up/login
  </text>
  <text x="580" y="275" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • JWT tokens
  </text>
  <text x="580" y="295" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    • Session management
  </text>

  <!-- API Layer -->
  <text x="40" y="420" font-family="Arial, sans-serif" font-size="20" font-weight="bold"
        fill="{colors['text']}">
    API LAYER
  </text>

  <rect x="40" y="440" width="1000" height="300" fill="{colors['card']}" stroke="{colors['secondary']}"
        stroke-width="2" rx="8"/>

  <!-- Express API Box -->
  <rect x="80" y="480" width="920" height="230" fill="{colors['surface']}" stroke="{colors['primary']}"
        stroke-width="2" rx="6"/>
  <text x="540" y="515" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        fill="{colors['primary']}" text-anchor="middle">
    Express + TypeScript API Server (Port 3001)
  </text>

  <!-- API Endpoints -->
  <text x="120" y="555" font-family="Arial, sans-serif" font-size="14" font-weight="bold"
        fill="{colors['secondary']}">
    Core Routes:
  </text>
  <text x="140" y="580" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/process-entry - 4-agent pipeline processing
  </text>
  <text x="140" y="600" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/chat - RAG-powered personalized chat
  </text>
  <text x="140" y="620" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/user-profile - Soul Mapping & Life Blueprint
  </text>
  <text x="140" y="640" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/embeddings - Vector generation & RAG
  </text>
  <text x="140" y="660" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/speech - Groq Whisper transcription
  </text>
  <text x="140" y="680" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    /api/explain - Chart explanation
  </text>

  <text x="560" y="555" font-family="Arial, sans-serif" font-size="14" font-weight="bold"
        fill="{colors['secondary']}">
    Middleware:
  </text>
  <text x="580" y="580" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • CORS handling
  </text>
  <text x="580" y="600" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Firebase UID extraction
  </text>
  <text x="580" y="620" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Error handling
  </text>
  <text x="580" y="640" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Request validation
  </text>

  <!-- Database & AI Layer -->
  <text x="40" y="800" font-family="Arial, sans-serif" font-size="20" font-weight="bold"
        fill="{colors['text']}">
    DATA & AI LAYER
  </text>

  <rect x="40" y="820" width="480" height="300" fill="{colors['card']}" stroke="{colors['success']}"
        stroke-width="2" rx="8"/>
  <text x="280" y="855" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        fill="{colors['success']}" text-anchor="middle">
    PostgreSQL + pgvector
  </text>
  <text x="80" y="890" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    13 Tables:
  </text>
  <text x="100" y="915" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • users, gamification
  </text>
  <text x="100" y="935" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • entries, entry_embeddings
  </text>
  <text x="100" y="955" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • vision_items, goals, levers
  </text>
  <text x="100" y="975" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • blueprint_sections, responses
  </text>
  <text x="100" y="995" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • prompt_cache, explainer_cache
  </text>
  <text x="80" y="1040" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    Drizzle ORM (postgres driver)
  </text>
  <text x="80" y="1060" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    Host: 34.55.195.199 | DB: becoming
  </text>
  <text x="80" y="1080" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    pgvector v0.8.1 (1536d embeddings)
  </text>

  <rect x="560" y="820" width="480" height="300" fill="{colors['card']}" stroke="{colors['warning']}"
        stroke-width="2" rx="8"/>
  <text x="800" y="855" font-family="Arial, sans-serif" font-size="18" font-weight="bold"
        fill="{colors['warning']}" text-anchor="middle">
    LangChain + OpenRouter
  </text>
  <text x="600" y="890" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    AI Models:
  </text>
  <text x="620" y="915" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • gpt-4o (quality, expensive)
  </text>
  <text x="620" y="935" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • gpt-4o-mini (cheap, fast)
  </text>
  <text x="620" y="955" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • text-embedding-3-small (1536d)
  </text>
  <text x="600" y="990" font-family="Arial, sans-serif" font-size="12" fill="{colors['text']}">
    Features:
  </text>
  <text x="620" y="1015" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Response caching (1 hour TTL)
  </text>
  <text x="620" y="1035" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • RAG semantic search
  </text>
  <text x="620" y="1055" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Two-pass generation
  </text>
  <text x="620" y="1075" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    • Structured JSON output
  </text>

  <!-- Data Flow Arrows -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill="{colors['primary']}" />
    </marker>
  </defs>

  <line x1="280" y1="350" x2="280" y2="440" stroke="{colors['primary']}" stroke-width="3"
        marker-end="url(#arrowhead)"/>
  <text x="290" y="400" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    HTTP/REST
  </text>

  <line x1="540" y1="740" x2="280" y2="820" stroke="{colors['success']}" stroke-width="3"
        marker-end="url(#arrowhead)"/>
  <text x="380" y="780" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    Drizzle ORM
  </text>

  <line x1="540" y1="740" x2="800" y2="820" stroke="{colors['warning']}" stroke-width="3"
        marker-end="url(#arrowhead)"/>
  <text x="640" y="780" font-family="Arial, sans-serif" font-size="11" fill="{colors['text']}">
    LangChain
  </text>

  <!-- Footer -->
  <text x="540" y="{PAGE_HEIGHT - 40}" font-family="Arial, sans-serif" font-size="12"
        fill="{colors['text_secondary']}" text-anchor="middle">
    System Architecture • Page 01 of 10
  </text>
</svg>'''

def generate_all_pages():
    """Generate all documentation pages"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    colors = COLORS[THEME]

    pages = [
        ('00-cover', create_cover_page(colors)),
        ('01-system-architecture', create_system_architecture_page(colors)),
    ]

    for page_id, content in pages:
        filename = f"{OUTPUT_DIR}/{page_id}.svg"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Created {filename}")

    print(f"\n✅ Generated {len(pages)} pages in {OUTPUT_DIR}/")

if __name__ == '__main__':
    print("\n🎨 Pratyaksha Architecture Documentation Generator")
    print("=" * 60)
    generate_all_pages()
