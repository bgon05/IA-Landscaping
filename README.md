# IA Landscaping — Login / Sign Up (Demo)

This workspace adds a simple frontend (`ls-login.html`, `landscaping.js`, `landscaping.css`) and a small Node.js backend (`server.js`) that uses MySQL to persist user accounts.

Quick setup

1. Install Node dependencies:

```bash
npm install
```

2. Create the database and table (run in MySQL client):

```sql
SOURCE create_db.sql;
```

3. Copy `.env.example` to `.env` and set your DB credentials.

4. Start the server:

```bash
npm run dev
# or
npm start
```

5. Open `ls-login.html` in your browser (file:// or via a static server). The client expects the API at `http://localhost:3000`.

Notes

- Passwords are hashed with `bcrypt` before storing.
- The demo returns a simple random token on successful login (for demonstration only). For production use, replace with a proper session or JWT flow and secure token storage.
