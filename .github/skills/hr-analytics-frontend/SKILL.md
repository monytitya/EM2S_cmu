---
name: hr-analytics-frontend
description: 'Build or refine Angular HR analytics dashboards from an API and visual reference. Use for employee overview screens, KPI cards, department and role charts, responsive dashboard layouts, and API-backed workforce insights.'
argument-hint: 'Describe the API endpoints and dashboard view to build'
user-invocable: true
---

# HR Analytics Frontend

## What This Produces

Create a focused Angular workforce dashboard that turns employee, department, salary, payroll, and leave API data into a scannable analytics view. Preserve the reference's light canvas, compact white panels, blue and coral data accents, and dense executive-summary layout while keeping every view responsive and data-ready.

## Workflow

1. Inspect the existing Angular component structure, route, global styles, API service, and package scripts before editing.
2. Inspect backend controller mappings or API documentation and record the response fields needed for employees, departments, payroll, salaries, and leave records.
3. Define a small view model at the component boundary. Keep raw API shapes out of the template and normalize missing values to safe defaults.
4. Build the page in this order: title and filters, KPI strip, trend/department charts, demographic and satisfaction panels, then insight footer.
5. Use semantic HTML and CSS grid for layout. Set stable chart heights and responsive breakpoints so labels never resize the surrounding cards.
6. Add loading, empty, and error states. If the API is unavailable during local development, use clearly isolated demo data so the visual surface remains testable.
7. Prefer existing project dependencies. Add a chart library only when the dashboard needs interactions that CSS/SVG cannot reasonably provide.
8. Validate with the narrowest available check first: Angular build, then unit tests. Verify desktop and mobile rendering when a browser tool is available.

## Quality Checklist

- Dashboard route renders without template or TypeScript errors.
- API service uses Angular's supported injectable decorator and a configurable base URL.
- KPI values are derived from data rather than hard-coded in the template.
- Charts have accessible labels or summaries and do not depend on color alone.
- Mobile layout collapses cleanly without horizontal overflow.
- Loading and API failure states are visible and do not break the shell.
- The visual hierarchy matches the supplied reference without copying decorative noise.
