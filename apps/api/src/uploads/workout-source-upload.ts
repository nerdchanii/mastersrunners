const WORKOUT_SOURCE_EXTENSIONS = new Set(["fit", "gpx"]);
const WORKOUT_SOURCE_CONTENT_TYPES = new Set([
  "application/octet-stream",
  "application/gpx+xml",
  "application/xml",
  "text/xml",
  "application/fit",
  "application/vnd.ant.fit",
]);

export function isSupportedWorkoutSourceFilename(filename: string): boolean {
  const extension = filename.split(".").pop()?.toLowerCase();
  return Boolean(extension && WORKOUT_SOURCE_EXTENSIONS.has(extension));
}

export function isSupportedWorkoutSourceContentType(contentType: string): boolean {
  return WORKOUT_SOURCE_CONTENT_TYPES.has(contentType);
}
