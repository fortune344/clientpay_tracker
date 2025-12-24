import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isPremium: boolean;
    signOut: () => Promise<void>;
    upgradeToPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isPremium: false,
    signOut: async () => { },
    upgradeToPremium: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(false);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_premium')
                .eq('id', userId)
                .single();

            if (data) {
                setIsPremium(data.is_premium || false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const upgradeToPremium = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_premium: true, subscription_type: 'monthly' })
                .eq('id', user.id);

            if (error) throw error;
            setIsPremium(true);
        } catch (error) {
            console.error("Error upgrading:", error);
            alert("Erreur lors de l'activation Premium");
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setIsPremium(false);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, isPremium, signOut, upgradeToPremium }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
