# India pincode geo data

CSV files in this folder are **auto-imported on backend startup** into `geo_master` (MongoDB).

## Format

```csv
pincode,state,city,district,lat,lng
400001,Maharashtra,Mumbai,Mumbai,18.9388,72.8354
```

- `pincode` — 6 digits (required)
- `state`, `city` — required for browse-by-state flows
- `district` — optional (defaults to city)
- `lat`, `lng` — optional (0 if missing; used for GPS reverse lookup)

## Files

| File | Purpose |
|------|---------|
| `pincodes_template.csv` | Header-only template (not imported) |
| `pincodes_india_sample.csv` | Sample multi-state seed (imported) |

## Admin upload

Super admin → Site customizer → **Geo / Pincodes** → CSV upload (same format).

## Custom path

Set `GEO_DATA_DIR` to a folder path on the server for additional CSV batches.
