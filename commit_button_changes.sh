#!/bin/bash
git add src/components/find-workers/talent-card.tsx src/components/find-workers/talent-featured.tsx
git commit -m "fix: revert View Profile buttons to teal and hourly rates to original color

- Change View Profile buttons back to teal background: bg-[#15949C] hover:bg-[#15949C]/90 text-white
- Revert hourly rate text to original color: text-[#002333] (removed dark:text-white)
- Keep Contact/Message buttons white as requested
- Maintain all other dark mode styling for backgrounds and text elements
- Apply changes to both talent-card.tsx and talent-featured.tsx components
- Ensure consistency across grid and list layouts"
