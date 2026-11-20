/**
 * Central Feature Flags for AIGENESIS.SAFETY
 *
 * Toggle `SHOW_MULTI_PHYSICS_TOOLS` to `true` when ready to surface the
 * full Multi-Physics Engine & Tools dropdown, 1 kHz Multi-Physics landing section,
 * and legacy multi-physics onboarding tour steps. All underlying studio components
 * and routes in `App.tsx` remain preserved and type-checked in the codebase.
 */
export const FEATURE_FLAGS = {
  SHOW_MULTI_PHYSICS_TOOLS: false,
} as const;
