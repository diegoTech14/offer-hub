#!/bin/bash
git add src/components/find-workers/talent-card.tsx src/components/find-workers/talent-featured.tsx
git commit -m "fix: change hourly rates to white color in dark mode

- Update hourly rate text to be white in dark mode: text-[#002333] dark:text-white
- Apply to both talent-card.tsx and talent-featured.tsx components
- Maintain View Profile buttons in teal color as previously set
- Keep Contact/Message buttons white as requested
- Ensure hourly rates are clearly visible in dark mode"
