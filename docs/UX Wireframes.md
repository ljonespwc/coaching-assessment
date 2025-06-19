# Coaching Skills Assessment - UI/UX Wireframes

## 1. Assessment Landing Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (PN Logo + Nav)              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│               HERO SECTION                              │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │        Tell us about your coaching skills       │   │
│   │              [Large H1 Heading]                 │   │
│   │                                                 │   │
│   │    Coaching is a complex role. A good coach     │   │
│   │    develops their skills in many areas...       │   │
│   │              [Subheading text]                  │   │
│   │                                                 │   │
│   │        ┌─────────────────────────────┐          │   │
│   │        │   START ASSESSMENT (CTA)    │          │   │
│   │        │      [Primary Button]       │          │   │
│   │        └─────────────────────────────┘          │   │
│   │                                                 │   │
│   │             Takes about 15 minutes              │   │
│   │              [Small text below]                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              HOW IT WORKS SECTION                       │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │   │
│   │  │  1  │  │  2  │  │  3  │  │  4  │  │  5  │    │   │
│   │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘    │   │
│   │   Take     Rate     Get      See      Take       │   │
│   │   Quiz   Yourself  Results  Progress  Action     │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│            ASSESSMENT DETAILS SECTION                   │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │        How to complete this assessment          │   │
│   │                                                 │   │
│   │  • 55 questions across 6 skill domains         │   │
│   │  • Rate yourself 1-5 on each statement         │   │
│   │  • Progress saved automatically                 │   │
│   │  • Get personalized recommendations            │   │
│   │                                                 │   │
│   │        ┌─────────────────────────────┐          │   │
│   │        │    BEGIN ASSESSMENT         │          │   │
│   │        │     [Secondary CTA]         │          │   │
│   │        └─────────────────────────────┘          │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Component Details
- **Header:** Standard PN navigation with user auth state
- **Hero Section:** Full-width background with centered content, max-width container
- **Progress Indicator:** 5-step horizontal timeline with icons
- **CTA Buttons:** Primary (orange/brand color), Secondary (outline style)
- **Typography:** Large heading (3xl), medium subheading (xl), body text (base)

---

## 2. Assessment Question Interface

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Minimal)                    │
│   PN Logo                    ┌─────────────────────┐   │
│                              │    Save & Exit      │   │
│                              └─────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 PROGRESS BAR                            │
│   ┌─────────────────────────────────────────────────┐   │
│   │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│   │              Question 15 of 55                  │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                DOMAIN INDICATOR                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              🎯 Personal Development             │   │
│   │               [Domain Badge]                    │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 QUESTION CONTENT                        │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │   "I allocate my time efficiently and           │   │
│   │   effectively, and am clear on what I'm         │   │
│   │   doing when."                                  │   │
│   │                [Question Text]                  │   │
│   │                                                 │   │
│   │                                                 │   │
│   │    Rate how strongly you agree:                 │   │
│   │                                                 │   │
│   │    ○ 1    ○ 2    ○ 3    ○ 4    ○ 5             │   │
│   │  Strongly              Strongly                 │   │
│   │  Disagree               Agree                   │   │
│   │                                                 │   │
│   │  ┌─────────┐                   ┌─────────┐     │   │
│   │  │ Previous│                   │  Next   │     │   │
│   │  └─────────┘                   └─────────┘     │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Component Details
- **Progress Bar:** Animated fill based on completion percentage
- **Domain Badge:** Color-coded badge showing current domain
- **Rating Scale:** Large touch-friendly radio buttons with labels
- **Navigation:** Previous button (disabled on Q1), Next button (enabled when answered)
- **Auto-save:** Invisible progress saving every 5 questions

### Interactive States
- **Radio Button States:** Default, hover, selected, disabled
- **Next Button States:** Disabled (gray), enabled (brand color), loading
- **Domain Transitions:** Animated color changes between domains

---

## 3. Results Page - PN Hex Visualization

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Full Nav)                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                RESULTS HERO SECTION                     │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │        🎉 Your Coaching Skills Results          │   │
│   │                                                 │   │
│   │              ┌─────────────┐                    │   │
│   │              │             │                    │   │
│   │              │   156/275   │                    │   │
│   │              │             │                    │   │
│   │              │ Doing Okay  │                    │   │
│   │              └─────────────┘                    │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 PN HEX VISUALIZATION                    │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │            Scientific Literacy                  │   │
│   │                    ∧                            │   │
│   │    Professional   /|\   Personal                │   │
│   │    Development   / | \  Development             │   │
│   │               /   |   \                         │   │
│   │              /    |    \                        │   │
│   │             /     |     \                       │   │
│   │   Change   ◄──────┼──────► Client-              │   │
│   │   Facilitation    |    Centeredness             │   │
│   │             \     |     /                       │   │
│   │              \    |    /                        │   │
│   │               \   |   /                         │   │
│   │                \ | /                           │   │
│   │                 \|/                            │   │
│   │                  ∨                             │   │
│   │            Systems Thinking                     │   │
│   │                                                 │   │
│   │           [Interactive Hex Chart]               │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│             FOCUS RECOMMENDATIONS                       │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │    We recommend you focus on these domains      │   │
│   │                                                 │   │
│   │    ┌─────────────┐    ┌─────────────┐           │   │
│   │    │ EASIEST WIN │    │  BIGGEST    │           │   │
│   │    │             │    │ OPPORTUNITY │           │   │
│   │    │ Professional│    │   Change    │           │   │
│   │    │ Development │    │ Facilitation│           │   │
│   │    │             │    │             │           │   │
│   │    │   24/45     │    │   18/50     │           │   │
│   │    └─────────────┘    └─────────────┘           │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### PN Hex Component Specifications
- **Responsive Design:** Scales from 300px (mobile) to 500px (desktop)
- **Interactive Elements:** Hover states show exact scores, click to expand details
- **Color Coding:** Gradient from red (low scores) to green (high scores)
- **Animation:** Smooth draw-in animation on page load
- **Accessibility:** Screen reader compatible with score announcements

---

## 4. Domain Detail Cards (Expandable)

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                DOMAIN DETAIL CARD                       │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │  ┌─────┐ Professional Development Skills        │   │
│   │  │ 24  │ Score 24/45                           │   │
│   │  │ /45 │                                       │   │
│   │  └─────┘ [Click to expand ▼]                   │   │
│   │                                                 │   │
│   │  Professional development skills are the key    │   │
│   │  skills to building and running a thriving     │   │
│   │  coaching business...                          │   │
│   │                                                 │   │
│   │  ┌─ EXPANDED CONTENT (when clicked) ─────────┐  │   │
│   │  │                                          │  │   │
│   │  │  What this means:                        │  │   │
│   │  │  • Strong: You have business systems    │  │   │
│   │  │  • Growth area: Client flow needs work  │  │   │
│   │  │                                          │  │   │
│   │  │  To improve, try these practices:        │  │   │
│   │  │  • Write one new social media post/week │  │   │
│   │  │  • Network with one new professional    │  │   │
│   │  │  • Review PN Code of Ethics             │  │   │
│   │  │                                          │  │   │
│   │  │  Recommended courses:                    │  │   │
│   │  │  ┌─────────────────────────────────────┐ │  │   │
│   │  │  │ Level 1 Nutrition Certification    │ │  │   │
│   │  │  │ [Enroll Now] [Learn More]          │ │  │   │
│   │  │  └─────────────────────────────────────┘ │  │   │
│   │  │  ┌─────────────────────────────────────┐ │  │   │
│   │  │  │ Coaching Business Kickstarter      │ │  │   │
│   │  │  │ [Enroll Now] [Learn More]          │ │  │   │
│   │  │  └─────────────────────────────────────┘ │  │   │
│   │  │                                          │  │   │
│   │  └──────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Card Component Details
- **Collapsed State:** Score badge, domain name, brief description, expand arrow
- **Expanded State:** Full content with practices and course recommendations
- **Transition:** Smooth expand/collapse animation
- **Course Cards:** Mini course preview with enrollment CTAs

---

## 5. Dashboard Integration Widget

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    MAIN DASHBOARD                       │
│   ┌─────────────────────────────────────────────────┐   │
│   │              Welcome back, Sarah!               │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│   │   Course    │ │    Your     │ │  Coaching   │      │
│   │  Progress   │ │ Credentials │ │   Skills    │      │
│   │             │ │             │ │             │      │
│   │    85%      │ │  L1 Cert    │ │  156/275    │      │
│   │  Complete   │ │ ✓ Complete  │ │             │      │
│   │             │ │             │ │ ┌─────────┐ │      │
│   │ [Continue]  │ │[Recertify]  │ │ │   Hex   │ │      │
│   │             │ │             │ │ │  Chart  │ │      │
│   │             │ │             │ │ │ (Mini)  │ │      │
│   │             │ │             │ │ └─────────┘ │      │
│   │             │ │             │ │             │      │
│   │             │ │             │ │ [View Full] │      │
│   │             │ │             │ │ [Retake]    │      │
│   └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │             Recommended Actions                 │   │
│   │                                                 │   │
│   │  • Focus on Change Facilitation skills         │   │
│   │  • Consider: Level 2 Master Health Coaching    │   │
│   │  • Practice: Weekly client debrief sessions    │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Widget Specifications
- **Grid Layout:** 3-column responsive grid that stacks on mobile
- **Mini Hex:** Simplified 6-sided chart showing latest scores
- **Action Items:** Personalized recommendations based on assessment results
- **Quick Actions:** One-click access to retake assessment or view full results

---

## 6. Progress Tracking Page

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    HEADER + NAV                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                 PROGRESS OVERVIEW                       │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │            Your Coaching Journey                │   │
│   │                                                 │   │
│   │    Assessment History     Overall Progress      │   │
│   │    ┌─────────────────┐   ┌─────────────────┐    │   │
│   │    │ May 2024: 142   │   │ Start: 142      │    │   │
│   │    │ Aug 2024: 156   │   │ Latest: 156     │    │   │
│   │    │ Nov 2024: 168   │   │ Growth: +24pts  │    │   │
│   │    └─────────────────┘   └─────────────────┘    │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                DOMAIN PROGRESS CHARTS                   │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │  ┌─ Personal Development ────────────────────┐   │   │
│   │  │                                          │   │   │
│   │  │   May    Aug    Nov                      │   │   │
│   │  │    ●------●------●   [Line Chart]        │   │   │
│   │  │   22     26     31                       │   │   │
│   │  │                                          │   │   │
│   │  └──────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   │  ┌─ Professional Development ───────────────┐    │   │
│   │  │   Similar chart layout...               │    │   │
│   │  └─────────────────────────────────────────┘    │   │
│   │                                                 │   │
│   │  [Continue for all 6 domains...]               │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              MILESTONE ACHIEVEMENTS                     │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │    🏆 Achievements Unlocked                     │   │
│   │                                                 │   │
│   │    ✅ First Assessment Complete                 │   │
│   │    ✅ L1 Course Progress Tracked               │   │
│   │    ✅ 25+ Point Improvement                    │   │
│   │    🔒 50+ Point Improvement (23 to go!)        │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Progress Component Details
- **Timeline View:** Horizontal timeline showing assessment dates and scores
- **Domain Charts:** Small line charts showing individual domain progress
- **Achievement System:** Gamified milestones to encourage continued assessment
- **Export Options:** Download progress report as PDF

---

## 7. Mobile Responsive Considerations

### Mobile Assessment Interface
```
┌─────────────────┐
│ PN Logo   [≡]   │ <- Hamburger menu
├─────────────────┤
│                 │
│ ████████░░░░░░░ │ <- Progress bar
│   Question 15   │
│                 │
├─────────────────┤
│                 │
│ 🎯 Personal     │ <- Domain badge
│   Development   │
│                 │
├─────────────────┤
│                 │
│ "I allocate my  │ <- Question text
│ time efficiently│   (larger font)
│ and effectively"│
│                 │
│                 │
│  Rate yourself: │
│                 │
│ ○  ○  ○  ○  ○  │ <- Larger touch
│ 1  2  3  4  5   │   targets
│                 │
│                 │
│ ┌─────────────┐ │
│ │    NEXT     │ │ <- Full width
│ └─────────────┘ │   button
│                 │
└─────────────────┘
```

### Mobile Results Page
```
┌─────────────────┐
│ Your Results    │
│                 │
│ ┌─────────────┐ │
│ │   156/275   │ │ <- Score card
│ │ Doing Okay  │ │
│ └─────────────┘ │
│                 │
│ ┌─────────────┐ │
│ │             │ │
│ │  Mini Hex   │ │ <- Scaled hex
│ │   Chart     │ │
│ │             │ │
│ └─────────────┘ │
│                 │
│ Focus Areas:    │
│ ● Professional  │ <- Simplified
│   Development   │   recommendations
│ ● Change        │
│   Facilitation  │
│                 │
│ [View Details]  │
└─────────────────┘
```

---

## 8. Component Library Requirements

### Design System Components
- **Buttons:** Primary, Secondary, Outline, Disabled states
- **Form Elements:** Radio buttons, Progress bars, Input fields
- **Cards:** Default, Hover, Expanded states
- **Charts:** Hex radar chart, Line charts, Progress indicators
- **Navigation:** Breadcrumbs, Tabs, Pagination
- **Feedback:** Loading states, Success messages, Error handling

### Color Palette
- **Primary:** PN Orange (#FF6B35)
- **Secondary:** PN Blue (#004E89)
- **Success:** Green (#22C55E)
- **Warning:** Yellow (#EAB308)
- **Error:** Red (#EF4444)
- **Neutral:** Gray scale (#F8FAFC to #1E293B)

### Typography Scale
- **H1:** 2.5rem (40px) - Hero headings
- **H2:** 2rem (32px) - Section headings
- **H3:** 1.5rem (24px) - Card titles
- **Body:** 1rem (16px) - Standard text
- **Small:** 0.875rem (14px) - Labels, captions

This wireframe specification provides clear, implementable guidance for AI-assisted development while maintaining PN's brand identity and user experience standards.