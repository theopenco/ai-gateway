# Environment Variables Refactoring Summary

## Overview

Successfully refactored the UI package to eliminate static environment variable definitions and implement a dynamic, server-side configuration system using TanStack Router SSR and Vinxi SSR.

## What Was Changed

### 1. Server-Side Configuration (`apps/ui/src/lib/config-server.ts`)

- Created a TanStack Start server function `getConfig()` that reads environment variables server-side
- Defined `AppConfig` interface with all configuration properties
- Server function returns configuration object with:
  - `hosted`: boolean flag for hosted mode
  - `apiUrl`: API endpoint URL
  - `githubUrl`: GitHub repository URL
  - `docsUrl`: Documentation URL
  - `posthogKey`: PostHog analytics key (optional)
  - `posthogHost`: PostHog host (optional)
  - `crispId`: Crisp chat widget ID (optional)

### 2. Client-Side Configuration Hooks (`apps/ui/src/lib/config.ts`)

- Created React Query-powered hooks for configuration access:
  - `useAppConfig()`: Main hook with loading/error states
  - `useAppConfigValue()`: Synchronous access (throws if not loaded)
  - Individual convenience hooks: `useApiUrl()`, `useIsHosted()`, `useDocsUrl()`, etc.
- Configuration is cached for 5 minutes with React Query
- Provides type-safe access to all configuration values

### 3. Synchronous Configuration Utils (`apps/ui/src/lib/config-utils.ts`)

- Created utilities for non-React contexts:
  - `loadConfig()`: Loads and caches configuration
  - `getConfigSync()`: Synchronous access to cached config
  - `isConfigLoaded()`: Check if config is available
  - `clearConfigCache()`: For testing purposes

### 4. Root Route Configuration (`apps/ui/src/routes/__root.tsx`)

- Added loader that prefetches configuration on app startup
- Configuration is loaded into both React Query cache and synchronous cache
- Updated PostHog and Crisp integrations to use dynamic configuration
- Added conditional rendering for PostHog when key is not provided

### 5. Updated Utility Files

#### `apps/ui/src/lib/fetch-client.ts`

- Replaced static API_URL with dynamic configuration using Proxy pattern
- `getFetchClient()` function creates client with current config
- Maintains backward compatibility with existing `$api` export

#### `apps/ui/src/lib/auth-client.ts`

- Updated Better Auth client to use dynamic API URL
- Implemented Proxy pattern for seamless config updates
- Maintains all existing auth method exports

#### `apps/ui/src/hooks/useChats.ts`

- Updated `authFetch` helper to use dynamic API URL
- All chat-related API calls now use server-side configuration

### 6. Component Updates

#### Major Components Updated:

- `apps/ui/src/components/Chat.tsx`: Uses `useApiUrl()` hook
- `apps/ui/src/components/dashboard/dashboard-sidebar.tsx`: Uses `useDocsUrl()` for dynamic docs link
- Multiple landing page components: Use `useDocsUrl()`, `useGithubUrl()` hooks
- Settings and onboarding components: Use `useIsHosted()` hook

#### Pattern Used:

```typescript
// Before (static)
import { API_URL } from "@/lib/env";

// After (dynamic)
import { useApiUrl } from "@/lib/config";

function MyComponent() {
  const apiUrl = useApiUrl();
  // Use apiUrl in component
}
```

## Benefits Achieved

### 1. **Dynamic Configuration**

- Environment variables are now read server-side only
- No static build-time configuration baked into client bundle
- Configuration can change without rebuilding the application

### 2. **Type Safety**

- Full TypeScript support for all configuration values
- Compile-time checking for configuration property access
- Clear interface definition for all config properties

### 3. **Caching & Performance**

- React Query provides intelligent caching (5-minute stale time)
- Single server request loads all configuration
- Synchronous access available for utility functions

### 4. **SSR Compatibility**

- Configuration loaded during SSR phase
- No hydration mismatches
- Server and client use same configuration source

### 5. **Error Handling**

- Graceful handling of missing optional configuration (PostHog, Crisp)
- Clear error messages when configuration not loaded
- Loading states handled by React Query

## File Structure

```
apps/ui/src/lib/
├── config-server.ts     # Server function for config
├── config.ts            # React hooks for config access
├── config-utils.ts      # Synchronous config utilities
├── fetch-client.ts      # Updated API client
└── auth-client.ts       # Updated auth client

apps/ui/src/routes/
└── __root.tsx           # Configuration prefetching

apps/ui/tsconfig.json    # Added Node.js types
```

## Migration Notes

### For Developers:

1. Replace `import { CONSTANT } from "@/lib/env"` with appropriate hook imports
2. Use hooks in React components: `const apiUrl = useApiUrl()`
3. For utility functions, ensure config is loaded first: `getConfigSync()`

### For Deployment:

1. Environment variables are now read server-side only
2. No changes needed to environment variable names or values
3. Configuration updates don't require rebuilds

## Testing Considerations

- Use `clearConfigCache()` in tests to reset state
- Mock server functions for unit testing components
- Integration tests should verify configuration loading

## Future Enhancements

1. **Configuration Validation**: Add runtime validation of environment variables
2. **Hot Reloading**: Implement configuration refresh without restart
3. **Environment-Specific Configs**: Support for different config schemas per environment
4. **Configuration UI**: Admin interface for runtime configuration changes

## Files Removed

- `apps/ui/src/lib/env.ts` - Static environment configuration (no longer needed)

## Dependencies Added

- `@types/node` - For Node.js type definitions in server functions

This refactoring successfully modernizes the configuration system while maintaining full backward compatibility and improving type safety, performance, and maintainability.
