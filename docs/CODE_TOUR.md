# Shortlist code tour

## Start with one feature: saving an application

1. `ApplicationEditor.jsx` displays normal input fields. `useState` holds the values while you type.
2. Clicking Save runs `submit`. It converts the interview time to an ISO timestamp and passes the data to `save` in `App.jsx`.
3. `api.js` sends a JSON request to `/api/applications`. It includes the session cookie and the CSRF token.
4. Express receives the request in `server/app.js`. Middleware checks the session and request token before the router handles it.
5. `applicationRoutes` requires a signed-in user. `applicationInput` checks the field types, lengths, dates, stage and job link.
6. A parameterised SQL INSERT saves the record using the user ID from the server session. The browser never chooses which user owns the row.
7. Express sends the saved record back. React adds it to the application list and shows a confirmation message.

That is the main full-stack loop: **form → HTTP request → validation → SQL → JSON response → updated page**.

## What the frontend files do

- `main.jsx`: puts the React app inside BrowserRouter and loads CSS.
- `App.jsx`: checks the session, loads records, defines save/delete actions and connects pages to routes.
- `api.js`: one small fetch function. It saves the CSRF token returned by the server and throws readable errors for unsuccessful requests.
- `utils.js`: dates, company initials, application stages and safe CSV export.
- `Layout.jsx`: desktop sidebar, mobile navigation and sign-out button.
- `UI.jsx`: shared pieces such as badges, headings, loading placeholders and empty states.
- `Auth.jsx`: sign-in and registration forms, including password visibility and validation messages.
- `Dashboard.jsx`: derives counts and upcoming actions from the saved applications. Counts are not stored separately.
- `Applications.jsx`: search, filter, sort and list/card views. These operate on the signed-in user's already-loaded data.
- `ApplicationEditor.jsx`: the application details form and preparation notebook. Changes remain local until Save is clicked.
- `Interviews.jsx`: applications in the Interview stage, with preparation progress.
- `styles.css`: normal CSS, organised into numbered sections. Media queries adapt the layout for smaller screens.

## Understanding React state

`useState` stores information that can change, such as the current search text or form values. Calling its setter asks React to render the new value.

`useEffect` runs work after rendering, such as fetching applications when the signed-in user changes. It is not needed for simple calculations: stage counts and filtered lists are calculated directly from the current data.

`map` turns a list into visible cards or rows. `filter` chooses matching records. The `key` identifies each record so React can track it when the list changes.

## Authentication without a token in localStorage

Passwords are hashed with bcrypt before storage. After login, Express stores a user ID in a server-side session. The browser receives an HttpOnly cookie containing a signed session identifier, not the user's password.

Sessions are stored in PostgreSQL, so restarting the web service does not erase the session table. In production the cookie is Secure and therefore travels over HTTPS. SameSite=Lax limits cross-site cookie use.

The server also gives the frontend a random CSRF token. Every changing request must send it in a header. Regenerating the session on sign-in prevents reuse of an old anonymous session ID.

This version deliberately omits email verification, password reset and OAuth. Do not describe those as implemented features.

## Why every query includes the owner

The update query ends with conditions for both the application ID and `user_id`. Knowing another record's UUID is not enough to edit it. The owner comes from the session, not a form field. The automated tests verify that a second account cannot read, modify or delete the first account's record.

## Why SQL has $1 and $2

Those are placeholders. The database driver sends values separately from SQL text, preventing user text from becoming executable SQL. The small dynamically assembled list of column names is defined in the source code, never supplied by the browser.

## Dates

`applied_date` and `follow_up_date` are date-only PostgreSQL fields. The API returns YYYY-MM-DD strings so a time-zone conversion cannot move them to a different calendar day.

`interview_at` is a TIMESTAMPTZ. The editor accepts your device's local time, sends an ISO time with a time zone, and displays it in the viewer's local zone. The input explains this behaviour.

## Preparation data

The five checklist items and interview questions are JSONB fields on each application. For a small personal tracker, this keeps related data together and avoids several extra tables. The server still validates their structure and text limits. A larger collaborative system might store questions in their own table.

## Useful creative changes to make yourself

1. Add your own interview prompts based on the roles you apply for. Start in `server/validation.js` and keep the editor defaults in sync.
2. Change colours and spacing in `styles.css`; keep visible keyboard focus and readable contrast.
3. Add a new field such as an application source. Update schema, validation, SQL field list and editor together.
4. Add a “What I learned” reflection for closed applications.
5. Build a monthly activity view using existing dates.

Implement and test one change at a time. Be able to explain it without reading a generated script.

## What is intentionally kept simple

No TypeScript, ORM, Redux, component framework, microservices or AI features. The frontend uses props and state. The backend uses Express routers, a PostgreSQL pool and a small number of standard security libraries. A framework-free backend does not mean storing plaintext passwords or skipping input checks.
