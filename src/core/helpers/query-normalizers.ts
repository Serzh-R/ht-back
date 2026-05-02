import {
   BlogsQuery,
   BlogsQueryInput,
   PostsQuery,
   PostsQueryInput,
   SortDirections,
} from '../types/query.types'

const DEFAULT_PAGE_NUMBER = 1
const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_BY = 'createdAt'
const DEFAULT_SORT_DIRECTION: SortDirections = 'desc'

function normalizePositiveInteger(value: string | undefined, defaultValue: number): number {
   const parsedValue = Number(value)

   if (!Number.isInteger(parsedValue) || parsedValue < 1) {
      return defaultValue
   }

   return parsedValue
}

function normalizeSortDirection(value: string | undefined): SortDirections {
   return value === 'asc' ? 'asc' : DEFAULT_SORT_DIRECTION
}

function normalizeSortBy(value: string | undefined): string {
   return value || DEFAULT_SORT_BY
}

export function normalizeBlogsQuery(query: BlogsQueryInput): BlogsQuery {
   return {
      searchNameTerm: query.searchNameTerm ?? null,
      sortBy: normalizeSortBy(query.sortBy),
      sortDirection: normalizeSortDirection(query.sortDirection),
      pageNumber: normalizePositiveInteger(query.pageNumber, DEFAULT_PAGE_NUMBER),
      pageSize: normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE),
   }
}

export function normalizePostsQuery(query: PostsQueryInput): PostsQuery {
   return {
      sortBy: normalizeSortBy(query.sortBy),
      sortDirection: normalizeSortDirection(query.sortDirection),
      pageNumber: normalizePositiveInteger(query.pageNumber, DEFAULT_PAGE_NUMBER),
      pageSize: normalizePositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE),
   }
}
