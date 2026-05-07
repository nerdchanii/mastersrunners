import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type QueryParamValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryParamValue>;
export type AppQueryKey = QueryKey;

export function cleanQueryParams<TParams extends QueryParams>(
  params: TParams | undefined,
): QueryParams | undefined {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(
    ([, value]) => value !== null && value !== undefined,
  );
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function cursorlessQueryParams<TParams extends QueryParams & { cursor?: QueryParamValue }>(
  params: TParams,
) {
  const { cursor: _cursor, ...baseParams } = params;
  return cleanQueryParams(baseParams);
}

export function toQueryString(params: QueryParams | undefined) {
  const cleanedParams = cleanQueryParams(params);

  if (!cleanedParams) {
    return "";
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(cleanedParams)) {
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function invalidateQueryKeys(queryClient: QueryClient, queryKeys: readonly AppQueryKey[]) {
  return Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}
