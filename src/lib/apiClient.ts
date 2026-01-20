import { supabase } from "@/integrations/supabase/client";
import { localSupabase } from "@/mocks/localSupabase";

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Em dev, se você está rodando no localhost e não setou explicitamente "false",
// ativamos os mocks para evitar dependência de banco remoto.
const envFlag = import.meta.env.VITE_USE_LOCAL_FIXTURES;
const useLocalFixtures =
  envFlag === "true" || (isLocalhost && envFlag !== "false");

export const apiClient = useLocalFixtures ? localSupabase : supabase;
export const isUsingLocalFixtures = useLocalFixtures;
