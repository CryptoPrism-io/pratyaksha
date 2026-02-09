#!/usr/bin/env python3
"""
Pratyaksha UI Wireframe Flow Documentation
Screen-by-screen user journey with navigation context
"""

import os

OUTPUT_DIR = "ui-wireframes"

CSS_STYLES = '''
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #000000;
  background: #ffffff;
  font-size: 11pt;
}

.page {
  max-width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 20mm;
  background: #ffffff;
  page-break-after: always;
}

.page:last-child {
  page-break-after: auto;
}

.header {
  border-bottom: 3px solid #000;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 18pt;
  font-weight: bold;
}

.screen-number {
  float: right;
  font-size: 10pt;
  color: #666;
}

/* Wireframe Container */
.wireframe {
  border: 3px solid #000;
  padding: 15px;
  margin: 20px 0;
  min-height: 400px;
  background: #fafafa;
  position: relative;
}

/* UI Components */
.ui-navbar {
  border: 2px solid #000;
  padding: 10px;
  margin-bottom: 10px;
  background: #fff;
  font-weight: bold;
}

.ui-hero {
  border: 2px solid #000;
  padding: 40px 20px;
  margin: 10px 0;
  background: #fff;
  text-align: center;
  min-height: 150px;
}

.ui-section {
  border: 2px solid #000;
  padding: 15px;
  margin: 10px 0;
  background: #fff;
}

.ui-card {
  border: 1px solid #000;
  padding: 10px;
  margin: 5px 0;
  background: #fff;
}

.ui-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0;
}

.ui-button {
  border: 2px solid #000;
  padding: 8px 15px;
  margin: 5px;
  background: #fff;
  display: inline-block;
  font-weight: bold;
  text-align: center;
}

.ui-input {
  border: 2px solid #000;
  padding: 8px;
  margin: 5px 0;
  background: #fff;
  width: 100%;
}

.ui-modal {
  border: 3px solid #000;
  padding: 20px;
  margin: 20px auto;
  background: #fff;
  max-width: 400px;
}

.ui-sidebar {
  border: 2px solid #000;
  padding: 10px;
  background: #fff;
  min-height: 200px;
}

.ui-tabs {
  border-bottom: 2px solid #000;
  padding: 10px 0;
  margin-bottom: 10px;
}

.ui-tab {
  border: 2px solid #000;
  border-bottom: none;
  padding: 8px 15px;
  margin-right: 5px;
  display: inline-block;
  background: #fff;
}

.ui-tab.active {
  background: #000;
  color: #fff;
}

/* Navigation Sections */
.nav-section {
  margin-top: 30px;
  page-break-inside: avoid;
}

.nav-section h3 {
  font-size: 13pt;
  font-weight: bold;
  margin-bottom: 10px;
  border-left: 4px solid #000;
  padding-left: 10px;
}

.nav-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.nav-table th {
  background: #000;
  color: #fff;
  font-weight: bold;
  padding: 8px;
  text-align: left;
  border: 1px solid #000;
}

.nav-table td {
  padding: 6px 8px;
  border: 1px solid #000;
  vertical-align: top;
}

.nav-table td:first-child {
  font-weight: bold;
  width: 30%;
}

.label {
  font-size: 9pt;
  color: #666;
  font-style: italic;
}

.component-label {
  font-size: 9pt;
  color: #666;
  margin-top: 5px;
}

.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.footer {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #000;
  text-align: center;
  font-size: 10pt;
}

@media print {
  .page {
    margin: 0;
    padding: 15mm;
  }

  @page {
    margin: 15mm;
    size: A4;
  }
}
</style>
'''

def create_screen_01_landing():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 01: Landing Page</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 01 of 12</span>
      <h1>Landing Page (/)</h1>
      <p class="label">Public marketing page - First touchpoint for new users</p>
    </div>

    <div class="wireframe">
      <!-- Navbar -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">Login</span>
          <span class="ui-button">Sign Up</span>
        </div>
      </div>
      <div class="component-label">Navigation: Logo + Login + Sign Up buttons</div>

      <!-- Hero Section -->
      <div class="ui-hero">
        <h2>Your Mind's Mirror</h2>
        <p>AI-powered journaling platform for emotional clarity</p>
        <br>
        <span class="ui-button">Get Started Free →</span>
      </div>
      <div class="component-label">Hero: Value proposition + CTA</div>

      <!-- Feature Sections -->
      <div class="ui-section">
        <strong>4-Agent AI Pipeline</strong>
        <p>Intent → Emotion → Theme → Insight analysis</p>
      </div>
      <div class="component-label">Feature 1: AI capabilities</div>

      <div class="ui-section">
        <strong>Personalized Insights</strong>
        <p>Soul Mapping + Life Blueprint for tailored advice</p>
      </div>
      <div class="component-label">Feature 2: Personalization</div>

      <div class="ui-section">
        <strong>Pattern Recognition</strong>
        <p>Identify emotional loops and behavioral themes</p>
      </div>
      <div class="component-label">Feature 3: Analytics</div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Direct URL</td>
          <td>User types pratyaksha.app or clicks marketing link</td>
        </tr>
        <tr>
          <td>Logout</td>
          <td>User logs out from Dashboard → redirected to Landing</td>
        </tr>
        <tr>
          <td>Browser default</td>
          <td>New user, no auth session</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Sign Up (Screen 02)</td>
          <td>Click "Sign Up" button or "Get Started Free" CTA</td>
        </tr>
        <tr>
          <td>Login (Screen 03)</td>
          <td>Click "Login" button</td>
        </tr>
        <tr>
          <td>Research/Science</td>
          <td>Click footer links (Science, Methodology, Agent Pipeline)</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 01 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_02_signup():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 02: Sign Up</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 02 of 12</span>
      <h1>Sign Up (/signup)</h1>
      <p class="label">New user registration with Firebase Auth</p>
    </div>

    <div class="wireframe">
      <!-- Navbar -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">← Back to Home</span>
        </div>
      </div>

      <!-- Sign Up Form -->
      <div class="ui-modal">
        <h2 style="margin-bottom: 15px;">Create Your Account</h2>

        <div class="ui-input">Email address</div>
        <div class="component-label">Input: Email</div>

        <div class="ui-input">Password (min 6 characters)</div>
        <div class="component-label">Input: Password</div>

        <div class="ui-input">Confirm Password</div>
        <div class="component-label">Input: Password confirmation</div>

        <br>
        <div class="ui-button" style="width: 100%;">Create Account</div>
        <div class="component-label">Submit button</div>

        <br><br>
        <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px;">
          <p>Already have an account? <strong>Login</strong></p>
        </div>
        <div class="component-label">Link to Login screen</div>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Landing Page (Screen 01)</td>
          <td>Click "Sign Up" or "Get Started Free" button</td>
        </tr>
        <tr>
          <td>Login Page (Screen 03)</td>
          <td>Click "Don't have an account? Sign up" link</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Onboarding Welcome (Screen 04)</td>
          <td>Successful account creation → Firebase auth → Onboarding flow starts</td>
        </tr>
        <tr>
          <td>Login (Screen 03)</td>
          <td>Click "Already have an account? Login" link</td>
        </tr>
        <tr>
          <td>Landing Page (Screen 01)</td>
          <td>Click "Back to Home" button</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 02 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_03_login():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 03: Login</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 03 of 12</span>
      <h1>Login (/login)</h1>
      <p class="label">Existing user authentication</p>
    </div>

    <div class="wireframe">
      <!-- Navbar -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">← Back to Home</span>
        </div>
      </div>

      <!-- Login Form -->
      <div class="ui-modal">
        <h2 style="margin-bottom: 15px;">Welcome Back</h2>

        <div class="ui-input">Email address</div>
        <div class="component-label">Input: Email</div>

        <div class="ui-input">Password</div>
        <div class="component-label">Input: Password</div>

        <br>
        <div class="ui-button" style="width: 100%;">Login</div>
        <div class="component-label">Submit button</div>

        <br><br>
        <div style="text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px;">
          <p>Don't have an account? <strong>Sign Up</strong></p>
        </div>
        <div class="component-label">Link to Sign Up screen</div>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Landing Page (Screen 01)</td>
          <td>Click "Login" button in navbar</td>
        </tr>
        <tr>
          <td>Sign Up Page (Screen 02)</td>
          <td>Click "Already have an account? Login" link</td>
        </tr>
        <tr>
          <td>Any protected route</td>
          <td>Unauthenticated user tries to access Dashboard/Logs → redirected to Login</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Successful login + profile already completed → Main app</td>
        </tr>
        <tr>
          <td>Onboarding Welcome (Screen 04)</td>
          <td>Successful login but profile incomplete → Resume onboarding</td>
        </tr>
        <tr>
          <td>Sign Up (Screen 02)</td>
          <td>Click "Don't have an account? Sign up" link</td>
        </tr>
        <tr>
          <td>Landing Page (Screen 01)</td>
          <td>Click "Back to Home" button</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 03 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_04_onboarding():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 04: Onboarding Welcome</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 04 of 12</span>
      <h1>Onboarding: Welcome</h1>
      <p class="label">First step - Basic profile info</p>
    </div>

    <div class="wireframe">
      <!-- Progress Bar -->
      <div style="border: 2px solid #000; padding: 5px; margin-bottom: 15px;">
        <div style="background: #000; width: 10%; height: 10px;"></div>
      </div>
      <div class="component-label">Progress: Step 1 of 8</div>

      <!-- Welcome Screen -->
      <div class="ui-section" style="text-align: center; padding: 30px;">
        <h2>Welcome to Pratyaksha! 👋</h2>
        <p>Let's personalize your journaling experience</p>
        <p style="margin-top: 15px; color: #666;">This will take about 5-10 minutes</p>
      </div>

      <div class="ui-section">
        <strong>Basic Information</strong>
        <div class="ui-input">What should we call you?</div>
        <div class="component-label">Input: Display name</div>

        <div class="ui-input">What do you do? (Optional)</div>
        <div class="component-label">Input: Profession</div>

        <div class="ui-input">Stress level (1-5)</div>
        <div class="component-label">Slider: Baseline stress</div>

        <div class="ui-input">Emotional openness (1-5)</div>
        <div class="component-label">Slider: How open to emotional language</div>
      </div>

      <div style="text-align: right; margin-top: 20px;">
        <span class="ui-button">Skip for now</span>
        <span class="ui-button">Continue →</span>
      </div>
      <div class="component-label">Actions: Skip entire onboarding OR proceed to Soul Mapping</div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Sign Up (Screen 02)</td>
          <td>New account created → Auto-redirect to onboarding</td>
        </tr>
        <tr>
          <td>Login (Screen 03)</td>
          <td>Existing user with incomplete profile → Resume onboarding</td>
        </tr>
        <tr>
          <td>Dashboard Settings</td>
          <td>User clicks "Complete Profile" → Re-enter onboarding flow</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Soul Mapping Intro (Screen 05)</td>
          <td>Click "Continue" → Proceed to deep exercises</td>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Skip for now" → Go to app with minimal profile (0% personalization)</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 04 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_05_soul_mapping():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 05: Soul Mapping</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 05 of 12</span>
      <h1>Onboarding: Soul Mapping</h1>
      <p class="label">Deep self-reflection exercises (5 optional topics)</p>
    </div>

    <div class="wireframe">
      <!-- Progress Bar -->
      <div style="border: 2px solid #000; padding: 5px; margin-bottom: 15px;">
        <div style="background: #000; width: 30%; height: 10px;"></div>
      </div>
      <div class="component-label">Progress: Steps 2-6 of 8</div>

      <!-- Exercise Card -->
      <div class="ui-section">
        <h3>Exercise 1: Childhood Beliefs</h3>
        <p style="margin: 10px 0; color: #666;">Explore the foundational beliefs formed in your early years</p>

        <div style="border: 2px solid #000; padding: 15px; margin: 15px 0; background: #fff;">
          <textarea style="width: 100%; height: 100px; border: 1px solid #000; padding: 8px; font-family: Arial;">What beliefs from childhood still influence you today?</textarea>
        </div>
        <div class="component-label">Text area: Free-form reflection</div>
      </div>

      <!-- Available Exercises List -->
      <div class="ui-section">
        <strong>Available Exercises (All Optional)</strong>
        <div class="ui-card">✓ 1. Childhood Beliefs (Current)</div>
        <div class="ui-card">○ 2. Relationship Patterns</div>
        <div class="ui-card">○ 3. Fear Analysis</div>
        <div class="ui-card">○ 4. Values Clarification</div>
        <div class="ui-card">○ 5. Identity Exploration</div>
        <div class="component-label">Progress tracker: 1 of 5 complete</div>
      </div>

      <div style="text-align: right; margin-top: 20px;">
        <span class="ui-button">Skip All Exercises</span>
        <span class="ui-button">Skip This One</span>
        <span class="ui-button">Save & Next →</span>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Onboarding Welcome (Screen 04)</td>
          <td>User clicked "Continue" → Enter Soul Mapping flow</td>
        </tr>
        <tr>
          <td>Previous/Next Exercise</td>
          <td>Multi-step flow through 5 exercises (or subset if skipping)</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Next Exercise (2-5)</td>
          <td>Click "Save & Next" → Proceed through remaining exercises</td>
        </tr>
        <tr>
          <td>Life Blueprint Intro</td>
          <td>Complete all 5 exercises (or skip all) → Move to Vision/Goals section</td>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Skip All Exercises" → Exit onboarding early</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 05 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_06_dashboard():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 06: Dashboard</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 06 of 12</span>
      <h1>Dashboard (/dashboard)</h1>
      <p class="label">Main application hub - Analytics and insights</p>
    </div>

    <div class="wireframe">
      <!-- Top Navigation -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">+ New Entry</span>
          <span class="ui-button">Chat</span>
          <span class="ui-button">Logs</span>
          <span class="ui-button">Profile ▾</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="ui-tabs">
        <span class="ui-tab active">Overview</span>
        <span class="ui-tab">Insights</span>
        <span class="ui-tab">Patterns</span>
      </div>
      <div class="component-label">Tabs: Overview (default), Insights, Patterns</div>

      <!-- Stats Cards -->
      <div class="ui-grid">
        <div class="ui-card"><strong>31 Day Streak</strong><br>🔥</div>
        <div class="ui-card"><strong>199 Total Entries</strong><br>📝</div>
        <div class="ui-card"><strong>Level 8</strong><br>⭐</div>
      </div>
      <div class="component-label">Quick stats: Streak, Total, Level</div>

      <!-- Main Chart Area -->
      <div class="ui-section" style="min-height: 150px;">
        <strong>Emotional Landscape (Last 30 Days)</strong>
        <div style="border: 1px solid #000; height: 120px; margin-top: 10px; padding: 10px;">
          [LINE CHART: Energy Level over time]
        </div>
      </div>
      <div class="component-label">Main chart: Energy/sentiment trends</div>

      <!-- Recent Entries -->
      <div class="ui-section">
        <strong>Recent Entries</strong>
        <div class="ui-card">
          <strong>Excited about new project</strong> • Feb 9 • Hopeful • 4/5 energy
        </div>
        <div class="ui-card">
          <strong>Feeling overwhelmed</strong> • Feb 8 • Anxious • 2/5 energy
        </div>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Login (Screen 03)</td>
          <td>Successful auth + completed profile → Default landing</td>
        </tr>
        <tr>
          <td>Onboarding (Screen 04-05)</td>
          <td>Complete or skip onboarding → Enter main app</td>
        </tr>
        <tr>
          <td>New Entry (Screen 07)</td>
          <td>After submitting entry → Return to Dashboard</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Dashboard" in navbar</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Dashboard" in navbar</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>New Entry (Screen 07)</td>
          <td>Click "+ New Entry" button in navbar</td>
        </tr>
        <tr>
          <td>Entry Details (Screen 08)</td>
          <td>Click on any entry card in "Recent Entries"</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Logs" in navbar</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Chat" in navbar</td>
        </tr>
        <tr>
          <td>Profile Settings (Screen 11)</td>
          <td>Click "Profile ▾" dropdown → Settings</td>
        </tr>
        <tr>
          <td>Insights Tab</td>
          <td>Click "Insights" tab → AI-generated insights view</td>
        </tr>
        <tr>
          <td>Patterns Tab</td>
          <td>Click "Patterns" tab → Theme/contradiction analysis</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 06 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_07_new_entry():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 07: New Entry</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 07 of 12</span>
      <h1>New Entry Modal</h1>
      <p class="label">Journal entry creation interface</p>
    </div>

    <div class="wireframe">
      <!-- Modal Overlay Indicator -->
      <div style="border: 3px dashed #666; padding: 10px; margin-bottom: 10px; color: #666;">
        [Background: Dashboard dimmed with overlay]
      </div>

      <!-- Entry Modal -->
      <div class="ui-modal" style="max-width: 600px;">
        <div style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <strong style="font-size: 14pt;">New Journal Entry</strong>
          <span style="float: right; cursor: pointer;">✕ Close</span>
        </div>

        <!-- Voice Input Option -->
        <div class="ui-section">
          <span class="ui-button">🎤 Voice Input</span>
          <span class="component-label" style="display: inline; margin-left: 10px;">Groq Whisper speech-to-text</span>
        </div>

        <!-- Text Input -->
        <div style="margin: 15px 0;">
          <textarea style="width: 100%; height: 200px; border: 2px solid #000; padding: 10px; font-family: Arial; font-size: 11pt;" placeholder="What's on your mind?"></textarea>
        </div>
        <div class="component-label">Main input: Free-form text (min 50 chars recommended)</div>

        <!-- Date/Time -->
        <div class="grid-2col" style="margin: 15px 0;">
          <div class="ui-input">Date: Feb 9, 2026</div>
          <div class="ui-input">Time: 14:23</div>
        </div>
        <div class="component-label">Timestamp: Auto-filled, editable</div>

        <!-- Action Buttons -->
        <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 1px solid #000;">
          <span class="ui-button">Cancel</span>
          <span class="ui-button">Save Entry</span>
        </div>
        <div class="component-label">Actions: Cancel (discard) or Save (process through 4-agent pipeline)</div>

        <!-- Processing Indicator (shown after Save) -->
        <div style="border: 2px dashed #000; padding: 10px; margin-top: 15px; text-align: center; display: none;">
          <p><strong>Processing...</strong></p>
          <p style="font-size: 9pt; color: #666;">Running 4-agent AI analysis (8-12 seconds)</p>
        </div>
        <div class="component-label">Loading state: Shown while Intent → Emotion → Theme → Insight</div>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "+ New Entry" button → Modal opens</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "+ New Entry" in navbar → Modal opens</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "+ New Entry" in navbar → Modal opens</td>
        </tr>
        <tr>
          <td>Anywhere in app</td>
          <td>Navbar always accessible with New Entry button</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Save Entry" → Processing complete → Modal closes → Return to Dashboard with new entry</td>
        </tr>
        <tr>
          <td>Previous Screen</td>
          <td>Click "Cancel" or "✕ Close" → Discard draft → Return to wherever user was</td>
        </tr>
        <tr>
          <td>Entry Details (Screen 08)</td>
          <td>After save → Option to "View Analysis" → Open newly created entry</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 07 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_08_entry_details():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 08: Entry Details</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 08 of 12</span>
      <h1>Entry Details View</h1>
      <p class="label">Full AI analysis results for single entry</p>
    </div>

    <div class="wireframe">
      <!-- Navigation -->
      <div class="ui-navbar">
        <strong>← Back to Dashboard</strong>
      </div>

      <!-- Entry Header -->
      <div class="ui-section">
        <h2>Excited about new project</h2>
        <p style="color: #666;">February 9, 2026 at 14:23</p>
        <div style="margin-top: 10px;">
          <span class="ui-button">Reflection</span>
          <span class="ui-button">Hopeful</span>
          <span class="ui-button">Energy: 4/5</span>
          <span class="ui-button">Rising ↗</span>
        </div>
      </div>
      <div class="component-label">Header: Name, date, type, mode, energy, shape</div>

      <!-- Original Text -->
      <div class="ui-section">
        <strong>Your Entry</strong>
        <p style="margin-top: 10px; line-height: 1.8;">
          I'm really excited about this new Pratyaksha project. The AI pipeline is coming together nicely and I can see it helping people understand themselves better...
        </p>
      </div>
      <div class="component-label">Original user input text</div>

      <!-- AI Analysis Sections -->
      <div class="ui-section">
        <strong>Snapshot</strong>
        <p style="margin-top: 10px;">
          Reflecting on progress with Pratyaksha project, feeling energized by the potential impact. Hopeful about AI's role in self-understanding.
        </p>
      </div>

      <div class="ui-section">
        <strong>Summary</strong>
        <p style="margin-top: 10px;">
          You're experiencing genuine excitement about creating something meaningful. The project represents both technical challenge and purpose-driven work.
        </p>
      </div>

      <div class="ui-section">
        <strong>Actionable Insights</strong>
        <ul style="margin-left: 20px; margin-top: 10px;">
          <li>Channel this energy into concrete next steps</li>
          <li>Document your vision to maintain momentum</li>
          <li>Share progress with stakeholders</li>
        </ul>
      </div>

      <div class="ui-section">
        <strong>Next Action</strong>
        <p style="margin-top: 10px; font-weight: bold;">
          Write down the top 3 features you want to ship this month
        </p>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click any entry card in "Recent Entries" section</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click any row in the logs table</td>
        </tr>
        <tr>
          <td>New Entry (Screen 07)</td>
          <td>After saving → Click "View Analysis" button</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "← Back to Dashboard" button</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Logs" in navbar (if navbar present)</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Chat" in navbar → Could ask follow-up about this entry</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 08 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_09_logs():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 09: Logs</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 09 of 12</span>
      <h1>Logs (/logs)</h1>
      <p class="label">Complete entry history in table format</p>
    </div>

    <div class="wireframe">
      <!-- Top Navigation -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">+ New Entry</span>
          <span class="ui-button">Chat</span>
          <span class="ui-button">Dashboard</span>
          <span class="ui-button">Profile ▾</span>
        </div>
      </div>

      <!-- Filters -->
      <div class="ui-section">
        <strong>Filters</strong>
        <div style="margin-top: 10px;">
          <span class="ui-button">All Types ▾</span>
          <span class="ui-button">All Modes ▾</span>
          <span class="ui-button">Date Range ▾</span>
          <span class="ui-button">Clear Filters</span>
        </div>
      </div>
      <div class="component-label">Filters: Entry type, mode, date range</div>

      <!-- Logs Table -->
      <div class="ui-section">
        <table class="nav-table">
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Type</th>
            <th>Mode</th>
            <th>Energy</th>
            <th>Sentiment</th>
          </tr>
          <tr>
            <td>Feb 9</td>
            <td>Excited about new project</td>
            <td>Reflection</td>
            <td>Hopeful</td>
            <td>4/5</td>
            <td>😊 Positive</td>
          </tr>
          <tr>
            <td>Feb 8</td>
            <td>Feeling overwhelmed</td>
            <td>Emotional</td>
            <td>Anxious</td>
            <td>2/5</td>
            <td>😟 Negative</td>
          </tr>
          <tr>
            <td>Feb 7</td>
            <td>Crypto exit decision</td>
            <td>Decision</td>
            <td>Resolved</td>
            <td>3/5</td>
            <td>😐 Neutral</td>
          </tr>
        </table>
      </div>
      <div class="component-label">Table: All entries with key metadata, sorted by date (newest first)</div>

      <!-- Pagination -->
      <div style="text-align: center; margin-top: 15px;">
        <span class="ui-button">← Previous</span>
        <span style="margin: 0 10px;">Page 1 of 7</span>
        <span class="ui-button">Next →</span>
      </div>
      <div class="component-label">Pagination: 30 entries per page</div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Logs" in navbar</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Logs" in navbar</td>
        </tr>
        <tr>
          <td>Entry Details (Screen 08)</td>
          <td>Click "Logs" in navbar (if present)</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Entry Details (Screen 08)</td>
          <td>Click any row in the table → Open full analysis for that entry</td>
        </tr>
        <tr>
          <td>New Entry (Screen 07)</td>
          <td>Click "+ New Entry" button in navbar</td>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Dashboard" in navbar</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Chat" in navbar</td>
        </tr>
        <tr>
          <td>Profile Settings (Screen 11)</td>
          <td>Click "Profile ▾" dropdown</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 09 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_10_chat():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 10: Chat</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 10 of 12</span>
      <h1>Chat Interface</h1>
      <p class="label">RAG-powered conversational AI with entry context</p>
    </div>

    <div class="wireframe">
      <!-- Top Navigation -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">+ New Entry</span>
          <span class="ui-button">Dashboard</span>
          <span class="ui-button">Logs</span>
          <span class="ui-button">Profile ▾</span>
        </div>
      </div>

      <!-- Chat Header -->
      <div class="ui-section" style="text-align: center;">
        <h3>Ask me anything about your journal</h3>
        <p style="color: #666; font-size: 9pt;">I can search through all your entries to answer questions</p>
      </div>

      <!-- Chat Messages -->
      <div class="ui-section" style="min-height: 250px; background: #fafafa;">
        <!-- User Message -->
        <div style="border: 2px solid #000; padding: 10px; margin: 10px 0; background: #fff; max-width: 70%; float: right; clear: both;">
          <p><strong>You:</strong> What patterns do you see in my stress levels?</p>
        </div>
        <div style="clear: both;"></div>

        <!-- AI Response -->
        <div style="border: 2px solid #000; padding: 10px; margin: 10px 0; background: #fff; max-width: 70%; float: left; clear: both;">
          <p><strong>AI:</strong> Based on your last 30 entries, I notice stress tends to spike on Mondays and when you have multiple deadlines. You manage it best when you journal in the morning.</p>
          <p style="margin-top: 8px; font-size: 9pt; color: #666;">📚 Referenced 12 entries from Jan-Feb 2026</p>
        </div>
        <div style="clear: both;"></div>
      </div>
      <div class="component-label">Chat history: User messages (right), AI responses (left)</div>

      <!-- Input Area -->
      <div style="border: 2px solid #000; padding: 10px; margin-top: 15px; background: #fff;">
        <textarea style="width: 100%; height: 60px; border: 1px solid #000; padding: 8px; font-family: Arial;" placeholder="Ask a question..."></textarea>
        <div style="text-align: right; margin-top: 8px;">
          <span class="ui-button">Send →</span>
        </div>
      </div>
      <div class="component-label">Input: Question box + Send button</div>

      <!-- Suggested Prompts -->
      <div class="ui-section">
        <strong>Suggested Questions</strong>
        <div class="ui-card">What themes appear most in my entries?</div>
        <div class="ui-card">How has my mood changed over time?</div>
        <div class="ui-card">What contradictions do you see in my thoughts?</div>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Chat" in navbar</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Chat" in navbar</td>
        </tr>
        <tr>
          <td>Entry Details (Screen 08)</td>
          <td>Click "Chat" in navbar → Can ask about specific entry</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Dashboard" in navbar</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Logs" in navbar</td>
        </tr>
        <tr>
          <td>New Entry (Screen 07)</td>
          <td>Click "+ New Entry" button in navbar</td>
        </tr>
        <tr>
          <td>Profile Settings (Screen 11)</td>
          <td>Click "Profile ▾" dropdown</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 10 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_11_profile():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 11: Profile Settings</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 11 of 12</span>
      <h1>Profile & Settings</h1>
      <p class="label">User profile management and preferences</p>
    </div>

    <div class="wireframe">
      <!-- Top Navigation -->
      <div class="ui-navbar">
        <strong>PRATYAKSHA</strong>
        <div style="float: right;">
          <span class="ui-button">← Back to Dashboard</span>
        </div>
      </div>

      <!-- Profile Completion Banner -->
      <div class="ui-section" style="background: #f0f0f0;">
        <strong>Profile Completion: 45%</strong>
        <div style="border: 2px solid #000; height: 15px; margin: 10px 0;">
          <div style="background: #000; width: 45%; height: 100%;"></div>
        </div>
        <p style="font-size: 9pt;">Complete Soul Mapping and Life Blueprint for 90% personalization</p>
        <span class="ui-button">Complete Profile →</span>
      </div>
      <div class="component-label">Progress: Personalization level indicator</div>

      <!-- Settings Sections -->
      <div class="ui-section">
        <h3>Account Information</h3>
        <div class="ui-input">Display Name: John Doe</div>
        <div class="ui-input">Email: john@example.com</div>
        <div class="ui-input">Profession: Product Manager</div>
      </div>

      <div class="ui-section">
        <h3>Personalization Settings</h3>
        <div class="ui-card">
          <strong>Stress Level:</strong> 4/5 (High)
          <div style="border: 2px solid #000; height: 10px; margin: 5px 0;">
            <div style="background: #000; width: 80%; height: 100%;"></div>
          </div>
        </div>
        <div class="ui-card">
          <strong>Emotional Openness:</strong> 5/5 (Very Open)
          <div style="border: 2px solid #000; height: 10px; margin: 5px 0;">
            <div style="background: #000; width: 100%; height: 100%;"></div>
          </div>
        </div>
      </div>

      <div class="ui-section">
        <h3>Life Blueprint Summary</h3>
        <div class="ui-card"><strong>Vision Items:</strong> 3 defined</div>
        <div class="ui-card"><strong>Goals:</strong> 5 active</div>
        <div class="ui-card"><strong>Levers:</strong> 2 strategies</div>
        <span class="ui-button">Edit Blueprint →</span>
      </div>

      <div class="ui-section">
        <h3>Danger Zone</h3>
        <span class="ui-button">Logout</span>
        <span class="ui-button">Delete Account</span>
      </div>
    </div>

    <div class="nav-section">
      <h3>🔽 Where can this screen be accessed from?</h3>
      <table class="nav-table">
        <tr>
          <th>Source</th>
          <th>Context</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "Profile ▾" dropdown → Settings</td>
        </tr>
        <tr>
          <td>Logs (Screen 09)</td>
          <td>Click "Profile ▾" dropdown → Settings</td>
        </tr>
        <tr>
          <td>Chat (Screen 10)</td>
          <td>Click "Profile ▾" dropdown → Settings</td>
        </tr>
      </table>
    </div>

    <div class="nav-section">
      <h3>🔼 Where all can user go from here?</h3>
      <table class="nav-table">
        <tr>
          <th>Destination</th>
          <th>Trigger</th>
        </tr>
        <tr>
          <td>Dashboard (Screen 06)</td>
          <td>Click "← Back to Dashboard" button</td>
        </tr>
        <tr>
          <td>Onboarding (Screen 04-05)</td>
          <td>Click "Complete Profile" → Re-enter onboarding flow for missing exercises</td>
        </tr>
        <tr>
          <td>Life Blueprint Editor</td>
          <td>Click "Edit Blueprint" → Modify Vision/Goals/Levers</td>
        </tr>
        <tr>
          <td>Landing Page (Screen 01)</td>
          <td>Click "Logout" → End session → Public landing page</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Pratyaksha UI Flow Documentation • Screen 11 of 12</p>
    </div>
  </div>
</body>
</html>'''

def create_screen_12_flow_map():
    return f'''<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Screen 12: Complete Flow Map</title>
  {CSS_STYLES}
</head>
<body>
  <div class="page">
    <div class="header">
      <span class="screen-number">Screen 12 of 12</span>
      <h1>Complete User Journey Flow Map</h1>
      <p class="label">All screens and navigation paths</p>
    </div>

    <div style="font-size: 9pt; margin: 20px 0;">
      <!-- Flow Diagram -->
      <div style="border: 3px solid #000; padding: 20px; background: #fafafa;">

        <!-- New User Flow -->
        <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px; background: #fff;">
          <strong style="font-size: 11pt;">NEW USER FLOW</strong>
          <div style="margin-top: 10px;">
            <div class="ui-button" style="display: inline-block; margin: 5px;">01. Landing</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">02. Sign Up</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">04. Onboarding Welcome</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">05. Soul Mapping</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">06. Dashboard</div>
          </div>
        </div>

        <!-- Returning User Flow -->
        <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px; background: #fff;">
          <strong style="font-size: 11pt;">RETURNING USER FLOW</strong>
          <div style="margin-top: 10px;">
            <div class="ui-button" style="display: inline-block; margin: 5px;">01. Landing</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">03. Login</div>
            <span style="font-size: 14pt;">→</span>
            <div class="ui-button" style="display: inline-block; margin: 5px;">06. Dashboard</div>
          </div>
        </div>

        <!-- Core App Loop -->
        <div style="border: 2px solid #000; padding: 15px; margin-bottom: 20px; background: #fff;">
          <strong style="font-size: 11pt;">CORE APP LOOP (Daily Usage)</strong>
          <div style="margin-top: 10px; text-align: center;">
            <div class="ui-button" style="margin: 5px;">06. Dashboard</div>
            <div>↓</div>
            <div class="ui-button" style="margin: 5px;">07. New Entry</div>
            <div>↓</div>
            <div class="ui-button" style="margin: 5px;">08. Entry Details</div>
            <div>↓</div>
            <div class="ui-button" style="margin: 5px;">06. Dashboard</div>
            <div style="margin-top: 10px; color: #666; font-size: 8pt;">(Repeat)</div>
          </div>
        </div>

        <!-- Navigation Hub -->
        <div style="border: 2px solid #000; padding: 15px; background: #fff;">
          <strong style="font-size: 11pt;">NAVIGATION HUB (From Dashboard)</strong>
          <div style="text-align: center; margin-top: 15px;">
            <div class="ui-button" style="margin: 3px;">06. Dashboard</div>
            <div style="margin: 10px 0;">
              <span style="font-size: 12pt;">↙</span>
              <span style="margin: 0 20px; font-size: 12pt;">↓</span>
              <span style="font-size: 12pt;">↘</span>
            </div>
            <div class="ui-button" style="display: inline-block; margin: 5px;">09. Logs</div>
            <div class="ui-button" style="display: inline-block; margin: 5px;">10. Chat</div>
            <div class="ui-button" style="display: inline-block; margin: 5px;">11. Profile</div>
          </div>
        </div>

      </div>
    </div>

    <!-- Screen Summary Table -->
    <div style="margin-top: 20px;">
      <table class="nav-table" style="font-size: 9pt;">
        <tr>
          <th style="width: 10%;">#</th>
          <th style="width: 25%;">Screen</th>
          <th style="width: 30%;">Primary Purpose</th>
          <th style="width: 35%;">Key Actions</th>
        </tr>
        <tr>
          <td>01</td>
          <td>Landing</td>
          <td>Marketing & acquisition</td>
          <td>Sign Up, Login</td>
        </tr>
        <tr>
          <td>02</td>
          <td>Sign Up</td>
          <td>New user registration</td>
          <td>Create account → Onboarding</td>
        </tr>
        <tr>
          <td>03</td>
          <td>Login</td>
          <td>Authentication</td>
          <td>Auth → Dashboard or Onboarding</td>
        </tr>
        <tr>
          <td>04</td>
          <td>Onboarding Welcome</td>
          <td>Collect basic profile</td>
          <td>Name, profession, stress, openness</td>
        </tr>
        <tr>
          <td>05</td>
          <td>Soul Mapping</td>
          <td>Deep self-reflection</td>
          <td>5 optional exercises (childhood, fear, etc.)</td>
        </tr>
        <tr>
          <td>06</td>
          <td>Dashboard</td>
          <td>Main hub & analytics</td>
          <td>View insights, charts, recent entries</td>
        </tr>
        <tr>
          <td>07</td>
          <td>New Entry</td>
          <td>Create journal entry</td>
          <td>Text/voice input → AI processing</td>
        </tr>
        <tr>
          <td>08</td>
          <td>Entry Details</td>
          <td>View full AI analysis</td>
          <td>Read insights, summary, next action</td>
        </tr>
        <tr>
          <td>09</td>
          <td>Logs</td>
          <td>Browse all entries</td>
          <td>Filter, search, paginate history</td>
        </tr>
        <tr>
          <td>10</td>
          <td>Chat</td>
          <td>Ask questions about journal</td>
          <td>RAG-powered Q&A with context</td>
        </tr>
        <tr>
          <td>11</td>
          <td>Profile Settings</td>
          <td>Manage account & preferences</td>
          <td>Edit profile, complete exercises, logout</td>
        </tr>
        <tr>
          <td>12</td>
          <td>Flow Map (This page)</td>
          <td>Documentation reference</td>
          <td>—</td>
        </tr>
      </table>
    </div>

    <div class="footer" style="margin-top: 30px;">
      <p>Pratyaksha UI Flow Documentation • Screen 12 of 12 • Complete</p>
    </div>
  </div>
</body>
</html>'''

def generate_all():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    screens = [
        ('01-landing.html', create_screen_01_landing()),
        ('02-signup.html', create_screen_02_signup()),
        ('03-login.html', create_screen_03_login()),
        ('04-onboarding-welcome.html', create_screen_04_onboarding()),
        ('05-soul-mapping.html', create_screen_05_soul_mapping()),
        ('06-dashboard.html', create_screen_06_dashboard()),
        ('07-new-entry.html', create_screen_07_new_entry()),
        ('08-entry-details.html', create_screen_08_entry_details()),
        ('09-logs.html', create_screen_09_logs()),
        ('10-chat.html', create_screen_10_chat()),
        ('11-profile.html', create_screen_11_profile()),
        ('12-flow-map.html', create_screen_12_flow_map()),
    ]

    for filename, content in screens:
        filepath = f"{OUTPUT_DIR}/{filename}"
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ {filename}")

    print(f"\n✅ Generated {len(screens)} screen wireframes in {OUTPUT_DIR}/")
    print("\n📄 Each screen includes:")
    print("   • Simple box wireframe")
    print("   • 'Where can this screen be accessed from' section")
    print("   • 'Where all can user go from here' section")
    print("   • Black & white, print-ready")

if __name__ == "__main__":
    generate_all()
