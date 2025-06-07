# Instructions

## General

- for git commit messages, always use the conventional commit style
- always use pnpm for installing or managing dependencies, and running scripts
- never add unnecessary basic code comments
- use existing data fetching mechanisms using react-query and native fetch
- after writing new files or adding lots of code, run `pnpm format` to ensure proper code formatting
- after adding features, make sure that the tests pass using `pnpm test`
- after adding features, make sure that the build passes using `pnpm build`
- after adding features, make sure to run the generations `pnpm generate`

## For database operations

- use drizzle with the latest object syntax
- for DB changes, do not write manual migration files
- if any tables or columns do not exist, run `pnpm sync` to sync the schema to the database
- do not apply any migrations, just use `pnpm sync`
- for read queries, always use `db().query.<table>.findMany()` or `db().query.<table>.findFirst()`

## Packages

### apps/ui

The UI package uses tanstack start and tanstack router. Make sure to create new routes using the respective format.
Make sure to use consistent code by checking how existing routes or files are implemented.
