#!/bin/bash
git add src/components/find-workers/talent-filters.tsx
git commit -m "fix: adjust filters panel height to fit content properly

- Change Card height from h-full to h-fit to prevent excessive vertical extension
- Ensures filters panel only extends to the Apply Filters button
- Eliminates unnecessary empty space below the Apply Filters button
- Maintains all existing dark mode styling and functionality
- Improves visual layout and user experience"
