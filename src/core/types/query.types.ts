export type SortDirections = 'asc' | 'desc'

export type BlogsQueryInput = {
  searchNameTerm?: string
  sortBy?: string
  sortDirection?: string
  pageNumber?: string
  pageSize?: string
}

export type BlogsQuery = {
  searchNameTerm: string | null
  sortBy: string
  sortDirection: SortDirections
  pageNumber: number
  pageSize: number
}
