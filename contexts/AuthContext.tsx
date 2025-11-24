import { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

export type AuthData = {
    session?: Session | null,
    profile?: any,
    isLoading: boolean,
    isLoggedIn: boolean,
}

export const AuthContext = createContext<AuthData>({
    session: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,
})

export const useAuth = () => useContext(AuthContext)