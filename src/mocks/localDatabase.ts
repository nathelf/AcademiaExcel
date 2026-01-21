const STORAGE_KEY = "excel_companion_local_store";
const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export type TableName =
  | "empresas"
  | "profiles"
  | "categorias"
  | "subcategorias"
  | "centros_custo"
  | "formas_pagamento"
  | "auth_users";

export type LocalRecord = Record<string, unknown>;

interface LocalStore {
  empresas: LocalRecord[];
  profiles: LocalRecord[];
  categorias: LocalRecord[];
  subcategorias: LocalRecord[];
  centros_custo: LocalRecord[];
  formas_pagamento: LocalRecord[];
  auth_users: LocalRecord[];
}

const defaultStore: LocalStore = {
  empresas: [],
  profiles: [],
  categorias: [],
  subcategorias: [],
  centros_custo: [],
  formas_pagamento: [],
  auth_users: [],
};

let store: LocalStore = loadStoredData();

function loadStoredData(): LocalStore {
  if (!isBrowser) {
    return cloneStore(defaultStore);
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("Não foi possível ler o banco local. Recriando.", error);
    }
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStore));
  return cloneStore(defaultStore);
}

function persistStore() {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function cloneStore(data: LocalStore): LocalStore {
  return JSON.parse(JSON.stringify(data));
}

function ensureTimestamps(row: LocalRecord): LocalRecord {
  const timestamp = new Date().toISOString();
  return {
    ...row,
    created_at: row.created_at ?? timestamp,
    updated_at: timestamp,
  };
}

function applyFilters(rows: LocalRecord[], filters: Filter[]) {
  if (filters.length === 0) return rows;
  return rows.filter((row) =>
    filters.every((filter) => {
      const value = row[filter.field];
      if (filter.operator === "eq") {
        return value === filter.value;
      }
      return true;
    })
  );
}

export type Filter = {
  field: string;
  value: unknown;
  operator: "eq";
};

export type OrderBy = {
  field: string;
  ascending: boolean;
};

export function resetLocalStore() {
  store = cloneStore(defaultStore);
  persistStore();
}

export function insertRows(table: TableName, rows: LocalRecord[]) {
  const prepared = rows.map((row) => ({
    id: typeof row.id === "string" ? row.id : generateId(),
    ...ensureTimestamps(row),
  }));

  store = {
    ...store,
    [table]: [...store[table], ...prepared],
  };

  persistStore();
  return prepared;
}

export function selectRows(
  table: TableName,
  filters: Filter[] = [],
  order?: OrderBy
) {
  let result = [...store[table]];
  result = applyFilters(result, filters);
  if (order) {
    result.sort((a, b) => {
      const fieldA = a[order.field];
      const fieldB = b[order.field];
      if (fieldA === fieldB) return 0;
      if (fieldA === undefined) return 1;
      if (fieldB === undefined) return -1;
      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return order.ascending
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      return order.ascending ? 1 : -1;
    });
  }
  return result.map((row) => ({ ...row }));
}

export function updateRows(
  table: TableName,
  filters: Filter[],
  patches: LocalRecord
) {
  const rows = store[table];
  const updated: LocalRecord[] = [];

  const result = rows.map((row) => {
    const matches = filters.every(
      (filter) => row[filter.field] === filter.value
    );
    if (!matches) {
      return row;
    }
    const patchedRow = {
      ...row,
      ...patches,
      updated_at: new Date().toISOString(),
    };
    updated.push(patchedRow);
    return patchedRow;
  });

  store = {
    ...store,
    [table]: result,
  };

  persistStore();
  return updated;
}

export function deleteRows(table: TableName, filters: Filter[]) {
  const rows = store[table];
  const remaining: LocalRecord[] = [];
  const removed: LocalRecord[] = [];

  rows.forEach((row) => {
    const matches = filters.every(
      (filter) => row[filter.field] === filter.value
    );
    if (matches) {
      removed.push(row);
    } else {
      remaining.push(row);
    }
  });

  store = {
    ...store,
    [table]: remaining,
  };

  persistStore();
  return removed;
}

export function getTableSnapshot(table: TableName) {
  return selectRows(table);
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
}
