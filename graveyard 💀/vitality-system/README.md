# Vitality System

## What It Was
A comprehensive health and fitness tracking system that guided users through physical health assessment, goal setting (weight loss, strength building, cardio), daily step targets, stretch routines, nutrition planning, and sleep optimization. Featured a detailed multi-step questionnaire with personalized recommendations and reward bonuses.

## Why Archived
- Removed during Phase 2 of pruning plan
- Too complex for the core game design focus
- Required significant state management (activity level, fitness goals, step targets, etc.)
- Never fully integrated into main game loop

## Reuse Potential
- Could be repurposed for:
  - Dedicated health/fitness tracking apps
  - Corporate wellness programs
  - Personal development platforms
  - Habit-tracking applications
- Dependencies:
  - framer-motion (for animations and transitions)
  - lucide-react (for icons)
  - Zustand store for state management
  - VitalityData interface with 6 fields

## Files
- `VitalityDetailPanel.tsx` - Main UI component with multi-step questionnaire (1470 lines)
- `VitalityFlowChart.tsx` - Visual flow chart representation
- `vitality.ts` - Backend/Convex functions

## Date Archived
January 19, 2026
