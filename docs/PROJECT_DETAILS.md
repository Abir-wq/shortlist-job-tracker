# Portfolio project page material

Use this as factual project documentation. Rewrite the personal-development reflections in your own words after studying and modifying the project. Do not claim challenges you did not personally work through.

## Name

Shortlist — Job Application & Interview Tracker

## Description

A personal workspace for tracking job applications, planning follow-ups and preparing for interviews. Users can keep company details, application stages, next actions and interview notes together, with private records for each account.

## Main technology stack

React, Vite, React Router, JavaScript, CSS, Node.js, Express, PostgreSQL, pg, bcryptjs and express-session.

## Screens to capture for the project image

After deploying and loading samples, capture the overview, the application list, and the interview-preparation page. Use fictional sample data in public screenshots rather than personal contact details or private job-search notes.

## Links to fill after you publish

- Live project: your actual working Render URL.
- GitHub repository: your own repository URL.
- Frontend source: the `/client` directory of that repository (if your portfolio asks for a client-only link).

This project keeps frontend and backend in one repository but in separate directories. If the course strictly requires two repositories, ask the examiner before splitting deployment; the included instructions assume one repository.

## Technical problems the implementation addresses

- Keeping each account's applications private through ownership checks.
- Preserving date-only reminders without shifting days across time zones.
- Maintaining sign-in sessions across server restarts using PostgreSQL.
- Supporting page refreshes on React routes through an Express fallback.
- Validating nested preparation notes and allowing only HTTP(S) job links.
- Keeping filtered CSV exports safe to open in spreadsheets.
- Distinguishing fictional sample entries from real records.

## Future improvements

- Email verification and secure password recovery.
- Calendar export for interviews.
- Opt-in email follow-up reminders.
- An application activity history and conflict detection for concurrent edits.
- Automated accessibility tests and more browser coverage.
- A shared rate-limit store if deploying multiple API instances.

## Honest development note

This starter was built with AI assistance. Personalise it, inspect the tests and explain the parts you changed yourself. Do not describe it as entirely hand-written or as work completed for a real company.
