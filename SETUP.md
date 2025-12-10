# LeadFlow AI Setup Instructions

## Fix Configuration Issues

Run these commands to fix the current issues:

### 1. Install Dependencies
```bash
bun install
```

### 2. If you get PostCSS/Tailwind errors, run:
```bash
bun remove tailwindcss postcss autoprefixer
bun add tailwindcss@^3.4.0 postcss@^8.4.0 autoprefixer@^10.4.0
```

### 3. If you still get PostCSS errors, try:
```bash
bun add -D @tailwindcss/postcss
```

### 4. Environment Setup
Make sure your `.env.local` file has all required variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/leadflow_ai"
ANTHROPIC_API_KEY="your_anthropic_api_key"
BETTER_AUTH_SECRET="your_32_character_secret_key_here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 5. Database Setup
```bash
# Generate database schema
bun run db:generate

# Run migrations
bun run db:migrate
```

### 6. Start Development Server
```bash
bun run dev
```

## Troubleshooting

If you continue to get PostCSS errors:

1. Delete `node_modules` and `bun.lockb`:
```bash
rm -rf node_modules bun.lockb
```

2. Reinstall dependencies:
```bash
bun install
```

3. Try running with specific PostCSS config:
```bash
TAILWIND_MODE=watch bun run dev
```

The application should now start without configuration errors.