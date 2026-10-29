# Validation notes

## Automated checks

Run from the project root:

```bash
npm ci
npm run build
npm test
```

The API test suite uses PGlite, an embedded PostgreSQL engine, with the same schema and SQL as the app. It does not read your database URL or use your production database. The tests cover:

1. Health, anonymous access and unknown API routes.
2. Missing CSRF tokens and weak-password rejection.
3. Account creation, password hashing and session rotation.
4. Duplicate registration and invalid login.
5. Application creation and default preparation data.
6. Cross-account read, update and delete protection.
7. Invalid dates, script URLs, stages and oversized notes.
8. Saving interview times, checklist state and answers.
9. Sample-data creation and safe removal alongside real records.
10. Sign-out, sign-in and data persistence between sessions.
11. Owned-record deletion and invalid identifiers.
12. Direct requests to built React routes.
13. Secure production cookie flags and a content security policy.

An external PostgreSQL/Neon connection was not available for testing. The embedded tests validate PostgreSQL behaviour but do not prove your provider's credentials, TLS settings or network availability.

## Browser checks

The built frontend was inspected on a desktop viewport and in a 390-pixel mobile iframe, using an isolated fictional test workspace. The checks include the empty workspace, loading samples, dashboard layout, interview-note editing and refresh persistence, mobile navigation/search, and creating an application through the mobile form. Authentication logic was exercised through API tests; browser sign-in used no real user credentials.

## Dependency review

The production dependency audit reported no known vulnerabilities at the time of packaging. This is a point-in-time check, not a permanent security guarantee.

## Checks to repeat on your hosted URL

- Register and sign in through the actual browser forms.
- Create and edit an application, then refresh its detail URL.
- Save interview notes, sign out and back in, and confirm they remain.
- Test from a narrow mobile window and using keyboard Tab navigation.
- Test CSV download and open it in a spreadsheet.
- Confirm two different accounts have separate records.
- Confirm the public URL works in a private browser window.

A real Render/Neon deployment and the Docker image have not been executed in this environment. Hosting configuration is supplied for you to complete with your accounts.
