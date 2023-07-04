### Osmosis Pool TVL & Prices

### Task

## Repo Structure

- this repo is a package extracted from our Monorepo. In order to make this package work, I exported some dependencies into the `src/external`. Those files should just be used, but changes here (except for logging or debugging) should not be necessary
- the actual package is split into 3 parts:
  - `src/infrastructure` are functions that are generally doing I/O to outbound services (in this case to the OSMOSIS API)
  - `src/model` are domain functions that are undependant from APIs, but implement the core logic (using the concept of a DEX and calculating TVL & Prices). This is the logic that could be reused for other dexes
  - `src/service` are the function that are exported from the package and be called by other packages. They orchestrate the functionality of the other two parts. Using the infrastructure to load data, then the models to apply logic and return the final result.
