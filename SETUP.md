# Second Brain OS - Setup Guide

## Overview

Second Brain OS is a multi-tenant knowledge management system with:
- **Frontend**: Next.js 16+ with React 19
- **Backend**: FastAPI with PostgreSQL
- **Architecture**: Full-stack prototype with artifact versioning, SOP builder, and template promotion system

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- pnpm (or npm/yarn)

## Backend Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file in the backend directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/second_brain_os
JWT_SECRET=your-very-secure-secret-key-change-this
FRONTEND_URL=http://localhost:3000
```

### 4. Create Database

```bash
# Using psql
createdb second_brain_os
```

### 5. Run FastAPI Server

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run Next.js Dev Server

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## Complete Workflow

### 1. Register a New Organization

1. Go to `http://localhost:3000/register`
2. Fill in your details and organization name
3. You'll be automatically logged in

### 2. Create an Artifact

1. Navigate to **Artifacts** from the dashboard
2. Click **+ New Artifact**
3. Fill in title, description, and content
4. The artifact is now versioned and tracked

### 3. Update an Artifact

1. Click on any artifact to view details
2. Click **Edit** to modify content
3. Add a change summary to document the update
4. Click **Save** - a new version is automatically created
5. View full version history in the Version History section

### 4. Promote Artifact to Template

1. Open an artifact detail
2. Click **Promote to Template**
3. Review the sanitization checklist:
   - Removed sensitive data
   - Anonymized examples
   - Verified accuracy
   - Updated references
4. Click **Confirm Promotion** - the artifact becomes a template
5. Other organizations can now see and import this template

### 5. Build an SOP from Artifact

1. Open an artifact
2. Click **Use in SOP**
3. Define your SOP title and description
4. Add steps with titles and descriptions
5. Click **Create SOP** - generates a structured SOP
6. SOP displays with numbered steps for easy reference

### 6. Import Templates

1. Navigate to **Templates**
2. See your promoted templates on the left
3. See available templates from other organizations on the right
4. Click **Import** on any template
5. Provide a title for the imported artifact
6. The template content is imported as a new artifact in your organization

## Database Schema

### Core Tables

- **organizations**: Multi-tenant organization data
- **users**: User accounts with hashed passwords
- **projects**: Project grouping (optional)
- **artifacts**: Knowledge artifacts with versioning
- **artifact_versions**: Version history for each artifact
- **sops**: Standard Operating Procedures
- **sop_steps**: Individual steps within SOPs
- **templates**: Promoted artifacts as reusable templates
- **template_imports**: Tracking of template imports across orgs

### Key Features

- **Multi-tenant isolation**: Each organization is completely isolated
- **Versioning**: Artifacts automatically create versions on content changes
- **Audit trail**: Created_at and updated_at timestamps on all entities
- **Template promotion**: Artifacts can be promoted to templates with sanitization checklist
- **Template imports**: Track which org imported which template

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and organization
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh access token

### Artifacts
- `GET /api/artifacts` - List artifacts for org
- `POST /api/artifacts` - Create artifact
- `GET /api/artifacts/{id}` - Get artifact with versions
- `PUT /api/artifacts/{id}` - Update artifact (creates version)
- `DELETE /api/artifacts/{id}` - Delete artifact

### SOPs
- `GET /api/sops` - List SOPs for org
- `POST /api/sops` - Create SOP with steps
- `GET /api/sops/{id}` - Get SOP with steps
- `DELETE /api/sops/{id}` - Delete SOP

### Templates
- `GET /api/templates` - List org's templates
- `GET /api/templates/gallery` - Get all available templates
- `POST /api/templates/promote` - Promote artifact to template
- `POST /api/templates/import` - Import template as artifact

## Architecture Decisions

### Frontend
- **Next.js App Router**: Modern routing with nested layouts
- **Context API**: For auth state management
- **Shadcn/UI**: Accessible component library
- **Tailwind CSS**: Utility-first styling

### Backend
- **FastAPI**: High-performance async API framework
- **SQLAlchemy ORM**: Type-safe database operations
- **JWT tokens**: Stateless authentication
- **CORS**: Enabled for frontend development

### Database
- **PostgreSQL**: Relational database with JSONB support
- **Foreign keys**: Maintain referential integrity
- **Indexes**: On org_id for multi-tenant queries

## Development Notes

### Adding New Features

1. **Backend route**: Add to `app/routes/`
2. **Pydantic schema**: Add to `app/schemas.py`
3. **API utility**: Add to `lib/api.ts`
4. **Frontend component**: Create in `components/` or `app/`
5. **Auth check**: Use `useAuth()` hook for protected pages

### Testing the Workflow

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd ..
pnpm dev

# Terminal 3: Access at http://localhost:3000
```

## Troubleshooting

### API Connection Error
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in `app/main.py`

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in backend `.env`
- Ensure database exists: `createdb second_brain_os`

### Login Failed
- Verify user email is correct
- Check password
- Ensure user belongs to same organization

### Template Not Showing
- Verify artifact was promoted (`is_promoted=True` in DB)
- Check importing org can access the template gallery
- Ensure both orgs exist in database

## Future Enhancements

- [ ] File uploads for artifacts
- [ ] Collaborative editing with WebSockets
- [ ] Rich text editor for content
- [ ] Search and filtering
- [ ] Access control levels (viewer, editor, admin)
- [ ] Template versioning and updates
- [ ] Audit logs for all actions
- [ ] Export to PDF/Markdown
- [ ] AI-powered content suggestions

## Support

For issues or questions, please check:
1. Ensure all prerequisites are installed
2. Verify environment variables are set correctly
3. Check that both backend and frontend servers are running
4. Review the complete workflow section above
