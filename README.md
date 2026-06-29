# Outreach OS

Separated frontend/backend implementation for the intelligent CRM and sales outreach system described in `user_design.md` and `Module_Task_List.md`.

## Structure

- `backend/` - FastAPI service with versioned `/api/v1` routes.
- `frontend/` - React + TypeScript + Vite SPA using the FastAPI JSON contract.
- `PRODUCT.md` - product and design context for the operational CRM UI.

The UI source of truth is the React app under `frontend/`. The original root-level
Design Composer draft and its runtime have been removed after the module screens were
implemented in the frontend.

## Run Backend

```bash
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/api/v1/health
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api` to `http://127.0.0.1:8000`.

## Test

```bash
cd backend && uv run pytest -q
cd frontend && npm test
cd frontend && npm run build
```
