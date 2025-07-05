# LLM Gateway - Next.js App

This is the Next.js version of the LLM Gateway UI application, migrated from TanStack Start.

## Migration Notes

This app has been migrated from TanStack Start to Next.js App Router. Key changes include:

### Routing

- **TanStack Router** → **Next.js App Router**
- File-based routing with `app/` directory
- URL search parameters managed with `useSearchParams` and `useRouter`
- Layout components converted to Next.js layout pattern

### State Management

- Organization and project selection now uses URL search parameters
- State persists across page refreshes
- React Query for server state management

### Key Features

- Dashboard with organization and project selection
- URL-based state management for organization/project
- All original components and functionality preserved
- Responsive design with Tailwind CSS
- Dark mode support with next-themes

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3002](http://localhost:3002) in your browser.

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_HOSTED=false
NEXT_PUBLIC_API_URL=http://localhost:4002
NEXT_PUBLIC_GITHUB_URL=https://github.com/theopenco/llmgateway
NEXT_PUBLIC_DOCS_URL=http://localhost:3005
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
NEXT_PUBLIC_CRISP_ID=your_crisp_id
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/       # Dashboard pages
│   ├── login/          # Authentication pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## Key Differences from TanStack Start

1. **Routing**: Uses Next.js App Router instead of TanStack Router
2. **Server Functions**: Removed TanStack Start server functions
3. **Configuration**: Uses Next.js environment variables pattern
4. **Build**: Uses Next.js build system instead of Vite
5. **URL State**: Managed with Next.js navigation hooks

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
