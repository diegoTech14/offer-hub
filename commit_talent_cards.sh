#!/bin/bash
git add src/components/find-workers/talent-card.tsx
git commit -m "fix: apply consistent dark mode colors to talent cards and make buttons white

- Apply dark:bg-gray-800 dark:border-gray-700 to main card containers (both grid and list layouts)
- Update all text elements with proper dark mode colors:
  - Names: dark:text-white
  - Titles and descriptions: dark:text-gray-300/400
  - Ratings and rates: dark:text-white
  - Skills badges: dark:border-gray-600 dark:text-gray-300
- Update avatar fallbacks with dark:bg-gray-600 dark:text-white
- Update star ratings with dark:text-gray-600 for empty stars
- Change all buttons (View Profile and Contact) to white background with black text:
  - bg-white text-black hover:bg-gray-100
  - dark:bg-white dark:text-black dark:hover:bg-gray-200
- Ensure consistent styling across both grid and list layouts
- Match the same color pattern used in other components"
