/** Filtros de borrado lógico para `alojamientos_aprobados` (deleted_at IS NULL = activo). */

type QueryWithSoftDelete = {
  is: (column: string, value: null) => QueryWithSoftDelete
  not: (column: string, operator: string, value: null) => QueryWithSoftDelete
}

export function onlyActiveAlojamientos<T extends QueryWithSoftDelete>(query: T): T {
  return query.is("deleted_at", null) as T
}

export function onlyDeletedAlojamientos<T extends QueryWithSoftDelete>(query: T) {
  return query.not("deleted_at", "is", null) as T
}

export const SOFT_DELETE_COLUMN = "deleted_at" as const
