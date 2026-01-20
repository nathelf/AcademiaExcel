import {
  deleteRows,
  insertRows,
  selectRows,
  updateRows,
  resetLocalStore,
  Filter,
  TableName,
} from "@/mocks/localDatabase";

type LocalUserRecord = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  password: string;
  user_metadata?: Record<string, unknown>;
  [key: string]: unknown;
};

type LocalSession = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: "bearer";
  user: LocalUserRecord;
};

type AuthStateChangeCallback = (
  event: string,
  session: LocalSession | null
) => void;

type LocalQueryResult = {
  data: Record<string, unknown>[];
  error: Error | null;
};

class LocalSupabaseQuery {
  private filters: Filter[] = [];
  private order: { field: string; ascending: boolean } | null = null;
  private operation: "select" | "insert" | "update" | "delete" | null = null;
  private rows: Record<string, unknown>[] = [];
  private patches: Record<string, unknown> | null = null;
  private selectedColumns: string[] | null = null;

  constructor(private table: TableName) {}

  insert(payload: Record<string, unknown> | Record<string, unknown>[]) {
    this.operation = "insert";
    this.rows = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  select(columns?: string) {
    if (columns) {
      this.selectedColumns = columns.split(",").map((column) => column.trim());
    }
    if (!this.operation) {
      this.operation = "select";
    }
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, value, operator: "eq" });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.order = {
      field,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.operation = "update";
    this.patches = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  maybeSingle() {
    return this._execute().then((result) => ({
      ...result,
      data: result.data.length > 0 ? result.data[0] : null,
    }));
  }

  single() {
    return this._execute().then((result) => ({
      ...result,
      data: result.data[0] ?? null,
    }));
  }

  then(onFulfilled: (value: LocalQueryResult) => unknown, onRejected?: (reason: any) => void) {
    return this._execute().then(onFulfilled, onRejected);
  }

  private async _execute(): Promise<LocalQueryResult> {
    if (this.operation === "insert") {
      const inserted = insertRows(this.table, this.rows);
      return { data: inserted, error: null };
    }

    if (this.operation === "update") {
      const updated = updateRows(
        this.table,
        this.filters,
        this.patches ?? {}
      );
      return { data: updated, error: null };
    }

    if (this.operation === "delete") {
      const deleted = deleteRows(this.table, this.filters);
      return { data: deleted, error: null };
    }

    const selected = selectRows(this.table, this.filters, this.order ?? undefined);
    const data = this.selectedColumns
      ? selected.map((row) => pickColumns(row, this.selectedColumns!))
      : selected;
    return { data, error: null };
  }
}

function pickColumns(row: Record<string, unknown>, columns: string[]) {
  if (columns.includes("*")) {
    return { ...row };
  }

  const result: Record<string, unknown> = {};
  columns.forEach((column) => {
    if (!column) return;
    if (column.includes("(")) return;
    if (column in row) {
      result[column] = row[column];
    }
  });
  return result;
}

const authListeners = new Set<AuthStateChangeCallback>();
let currentSession: LocalSession | null = null;

function notifyAuth(event: string, session: LocalSession | null) {
  authListeners.forEach((callback) => {
    setTimeout(() => callback(event, session), 0);
  });
}

function buildSession(user: Record<string, unknown>): LocalSession {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: `local-${user.id ?? "unknown"}-${now}`,
    refresh_token: `local-refresh-${user.id ?? "unknown"}`,
    expires_at: now + 3600,
    token_type: "bearer",
    user,
  };
}

function createLocalUserRecord({
  id,
  email,
  password,
  metadata,
}: {
  id: string;
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}): LocalUserRecord {
  return {
    id,
    email,
    password,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_metadata: metadata ?? {},
  };
}

function findLocalUserByEmail(email: string): LocalUserRecord | undefined {
  return selectRows("auth_users", [
    { field: "email", value: email, operator: "eq" },
  ])[0] as LocalUserRecord | undefined;
}

function toClientUser(record: LocalUserRecord) {
  return {
    id: record.id,
    email: record.email,
    created_at: record.created_at,
    user_metadata: record.user_metadata,
  };
}

function removeAuthListener(callback: AuthStateChangeCallback) {
  authListeners.delete(callback);
}

function startInitialSession() {
  notifyAuth("INITIAL_SESSION", currentSession);
}

export const localSupabase = {
  auth: {
    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      const existing = findLocalUserByEmail(email);
      if (existing) {
        return {
          data: null,
          error: new Error("Este e-mail já está cadastrado."),
        };
      }

      const metadata = options?.data ?? {};
      const userId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 11);

      const record = createLocalUserRecord({
        id: userId,
        email,
        password,
        metadata,
      });

      insertRows("auth_users", [record]);

      const session = buildSession({
        ...toClientUser(record),
        user_metadata: metadata,
      });

      currentSession = session;
      notifyAuth("SIGNED_IN", session);

      return {
        data: { user: session.user, session },
        error: null,
      };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const user = findLocalUserByEmail(email);
      if (!user || user.password !== password) {
        return {
          data: null,
          error: new Error("Credenciais inválidas"),
        };
      }

      const session = buildSession(toClientUser(user));
      currentSession = session;
      notifyAuth("SIGNED_IN", session);

      return {
        data: { user: session.user, session },
        error: null,
      };
    },

    async signOut() {
      currentSession = null;
      notifyAuth("SIGNED_OUT", null);
      return { error: null };
    },

    async resetPasswordForEmail(_email: string) {
      return { data: null, error: null };
    },

    onAuthStateChange(callback: AuthStateChangeCallback) {
      authListeners.add(callback);
      startInitialSession();
      return {
        data: {
          subscription: {
            unsubscribe: () => removeAuthListener(callback),
          },
        },
        error: null,
      };
    },

    async getSession() {
      return { data: { session: currentSession }, error: null };
    },
  },

  from(table: TableName) {
    return new LocalSupabaseQuery(table);
  },

  resetLocalFixtures() {
    resetLocalStore();
    currentSession = null;
  },
};
