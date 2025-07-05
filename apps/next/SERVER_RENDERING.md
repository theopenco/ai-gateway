# Server-Side Rendering with React Query Initial Data

This document explains the server-side rendering pattern implemented in this Next.js application, where we fetch data on the server and pass it as initial data to React Query.

## Overview

We've converted the dashboard pages from client-side components to server components that:

1. Fetch data on the server using a custom `fetchServerData` function
2. Pass the fetched data as `initialData` to React Query
3. Provide instant loading with server-rendered content
4. Maintain client-side interactivity and real-time updates

## Architecture

### Server-Side API Client (`lib/server-api.ts`)

```typescript
// Server-side API client with authentication
export async function createServerApiClient() {
  const config = getConfig();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("better-auth.session_token");

  return createFetchClient<paths>({
    baseUrl: config.apiUrl,
    credentials: "include",
    headers: {
      Cookie: sessionCookie
        ? `better-auth.session_token=${sessionCookie.value}`
        : "",
    },
  });
}

// Generic data fetcher
export async function fetchServerData<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  path: string,
  options?: { params?: any; body?: any },
): Promise<T | null>;
```

### Page Structure Pattern

Each dashboard page follows this pattern:

1. **Server Component Page** - Fetches data and renders client component
2. **Client Component** - Handles UI interactions and React Query

#### Example: Dashboard Page

```typescript
// apps/next/src/app/dashboard/page.tsx (Server Component)
export default async function Dashboard() {
  const initialActivityData = await fetchServerData("GET", "/activity", {
    params: { query: { days: "7" } },
  });

  return <DashboardClient initialActivityData={initialActivityData} />;
}

// components/dashboard/dashboard-client.tsx (Client Component)
export function DashboardClient({ initialActivityData }) {
  const { data } = api.useQuery("get", "/activity", params, {
    enabled: !!selectedProject?.id,
    initialData: initialActivityData, // Server data used as initial state
  });

  // Rest of component logic...
}
```

## Converted Pages

### ✅ Completed Conversions

1. **Dashboard** (`/dashboard`)

   - Server fetches: Activity data
   - Client handles: Project filtering, real-time updates

2. **Transactions** (`/dashboard/settings/transactions`)

   - Server fetches: Organization transactions
   - Client handles: Organization filtering, pagination

3. **Provider Keys** (`/dashboard/provider-keys`)

   - Server fetches: Provider keys data
   - Client handles: Organization filtering, CRUD operations

4. **Activity** (`/dashboard/activity`)

   - Server fetches: Recent logs
   - Client handles: Filtering, pagination

5. **Models** (`/dashboard/models`)
   - Static data (no server fetch needed)
   - Converted to async for consistency

### 🔄 Recommended for Conversion

1. **API Keys** (`/dashboard/api-keys`)
2. **Usage & Metrics** (`/dashboard/usage`)
3. **Settings pages** (billing, preferences, etc.)
4. **Playground** (`/playground`)

## Benefits

### Performance

- **Faster Initial Load**: Data is fetched on the server, reducing client-side loading time
- **Better SEO**: Content is server-rendered and indexable
- **Reduced Client Bundle**: Less client-side data fetching logic

### User Experience

- **Instant Content**: Users see data immediately on page load
- **Progressive Enhancement**: Client-side features enhance the server-rendered base
- **Reliable Fallbacks**: Server-rendered content works even if JavaScript fails

### Developer Experience

- **Type Safety**: Full TypeScript support across server and client
- **Consistent Patterns**: Predictable structure for all pages
- **Easy Testing**: Server and client logic can be tested separately

## Implementation Guidelines

### 1. Create Client Component

```typescript
// components/[feature]/[feature]-client.tsx
"use client";

interface FeatureClientProps {
  initialData?: any; // Type this properly in real implementation
}

export function FeatureClient({ initialData }: FeatureClientProps) {
  const { data } = api.useQuery("get", "/endpoint", params, {
    initialData,
    enabled: !!requiredDependency,
  });

  return (
    // Your component JSX
  );
}
```

### 2. Convert Page to Server Component

```typescript
// app/[route]/page.tsx
import { FeatureClient } from "@/components/[feature]/[feature]-client";
import { fetchServerData } from "@/lib/server-api";

export default async function FeaturePage() {
  const initialData = await fetchServerData("GET", "/endpoint", {
    params: { /* default params */ },
  });

  return <FeatureClient initialData={initialData} />;
}
```

### 3. Update Child Components

If child components use `useSuspenseQuery` or `useQuery`, update them to accept `initialData`:

```typescript
// Before
const { data } = api.useSuspenseQuery("get", "/endpoint");

// After
interface ComponentProps {
  initialData?: any;
}

const { data } = api.useSuspenseQuery(
  "get",
  "/endpoint",
  {},
  {
    initialData,
  },
);
```

## Best Practices

### 1. Handle Server Errors Gracefully

```typescript
export default async function Page() {
  const initialData = await fetchServerData("GET", "/endpoint");
  // initialData will be null if the server request fails
  // Client component should handle this case

  return <ClientComponent initialData={initialData} />;
}
```

### 2. Use Appropriate Initial Data

- For user-specific data: Fetch on server when possible
- For public data: Consider static generation
- For real-time data: Provide initial state, let client refetch

### 3. Maintain Client-Side Logic

Server-side fetching provides initial data, but client-side logic should still handle:

- User interactions
- Real-time updates
- Error states
- Loading states for subsequent requests

### 4. Type Safety

```typescript
// Define proper types instead of `any`
interface ActivityData {
  activity: Array<{
    date: string;
    requestCount: number;
    totalTokens: number;
    cost: number;
  }>;
}

const initialData = await fetchServerData<ActivityData>("GET", "/activity");
```

## Testing

### Server Components

- Test server-side data fetching logic
- Mock `fetchServerData` function
- Verify error handling

### Client Components

- Test with and without initial data
- Verify React Query integration
- Test user interactions

## Migration Checklist

When converting a page:

- [ ] Create client component with initial data prop
- [ ] Convert page to async server component
- [ ] Add server-side data fetching
- [ ] Update child components to accept initial data
- [ ] Test both server and client functionality
- [ ] Update any related tests
- [ ] Document any specific considerations

## Performance Monitoring

Monitor these metrics after conversion:

- **Time to First Byte (TTFB)**: Should improve with server-side fetching
- **First Contentful Paint (FCP)**: Should improve with server-rendered content
- **Cumulative Layout Shift (CLS)**: Should improve with pre-loaded data
- **Time to Interactive (TTI)**: Monitor for any regressions

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure cookies are properly forwarded in server requests
2. **Type Errors**: Make sure initial data types match React Query expectations
3. **Hydration Mismatches**: Ensure server and client render the same content initially
4. **Stale Data**: Remember that initial data might be stale; client should refetch when needed

### Debug Tips

- Use `console.log` in server components to debug data fetching
- Check Network tab for duplicate requests
- Verify React Query DevTools show initial data correctly
- Test with JavaScript disabled to verify server rendering
