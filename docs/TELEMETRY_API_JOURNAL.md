# Telemetry API Journal & Usage Guide

This journal documents the newly upgraded, uncompromised telemetry pipeline for the F1 Stats Dashboard API. It outlines how to use the available endpoints, what parameters they accept, and what the resulting data shapes look like.

---

## 1. Single & Multi-Lap Telemetry
**Endpoint:** `GET /api/analysis/races/{year}/{round}/telemetry`

This endpoint streams raw car-data samples. It is highly flexible and can be used to pull telemetry for a single lap, all laps for a single driver, or the entire race across all drivers.

### Parameters
- `session` (optional): Defaults to `R` (Race). Can be `Q`, `FP1`, `FP2`, `FP3`.
- `driver` (optional): The 3-letter driver code (e.g., `HAM`). **If omitted, returns data for all drivers.**
- `lap` (optional): The lap number (e.g., `1`). **If omitted, returns all laps for the selected driver(s).**
- `limit_points` (optional): Maximum number of points to return. Defaults to `1000`, but you can request up to `1,000,000` for uncompromised data.
- `stride` (optional): Downsamples the data by returning every *N*th point. Useful for frontend charting.
- `sector_start` / `sector_end` (optional): Filter the returned points to only include a specific sector window (1-3).

### Data Shape
```json
{
  "meta": { ... },
  "filters_applied": { ... },
  "data": [
    {
      "driver_code": "HAM",
      "lap_number": 1,
      "sector": 1,
      "time_seconds": 1.234,
      "distance_m": 50.5,
      "speed_kph": 240,
      "throttle_pct": 100,
      "brake": false,
      "rpm": 11500,
      "gear": 7
    },
    ...
  ]
}
```

---

## 2. Telemetry Overlay
**Endpoint:** `GET /api/analysis/races/{year}/{round}/telemetry/overlay`

This endpoint makes it easy to compare telemetry between two drivers. It returns separate arrays (traces) for each driver, which are perfect for plotting on a multi-line chart where `distance_m` is the X-axis.

### Parameters
- `session` (optional): Defaults to `R` (Race).
- `driver_a` (required): First 3-letter driver code.
- `driver_b` (required): Second 3-letter driver code.
- `lap_a` (optional): Lap number for driver A. **If omitted, returns all laps for driver A.**
- `lap_b` (optional): Lap number for driver B. **If omitted, returns all laps for driver B.**
- `limit_points`, `stride`, `sector_start`, `sector_end`: Same as above.

### Data Shape
```json
{
  "meta": { ... },
  "filters_applied": { ... },
  "traces": [
    {
      "driver": "HAM",
      "lap": 1,
      "data": [
        {
          "distance_m": 50.5,
          "speed_kph": 240,
          "throttle_pct": 100,
          "brake": false,
          "gear": 7,
          "rpm": 11500
        }
      ]
    },
    {
      "driver": "VER",
      "lap": 1,
      "data": [ ... ]
    }
  ]
}
```

---

## 3. Telemetry Summary
**Endpoint:** `GET /api/analysis/races/{year}/{round}/telemetry/summary`

Instead of raw high-frequency points, this endpoint calculates high-level statistics based on the telemetry. It is ideal for UI summary cards (e.g., "Max Speed Reached").

### Parameters
- `session` (optional): Defaults to `R` (Race).
- `driver` (optional): The 3-letter driver code. **If omitted, returns summaries for all drivers.**
- `lap` (optional): The lap number. **If omitted, returns summaries for all laps.**
- `stride`, `sector_start`, `sector_end`: Same as above.

### Data Shape
If multiple laps or drivers are requested, the `summary` field is an array of objects:
```json
{
  "meta": { ... },
  "filters_applied": { ... },
  "summary": [
    {
      "driver_code": "HAM",
      "lap_number": 1,
      "max_speed_kph": 320.5,
      "braking_zones": 8,
      "throttle_on_percentage": 68.4,
      "samples": 602
    },
    {
      "driver_code": "VER",
      "lap_number": 1,
      ...
    }
  ]
}
```

---

> [!TIP]
> **Performance Considerations:** Requesting uncompromised data (e.g., all 20 drivers for all 50+ laps) will return hundreds of thousands of points and result in a payload size of around 10MB to 15MB. Ensure your frontend Canvas or WebGL charting library can handle these massive arrays efficiently!
