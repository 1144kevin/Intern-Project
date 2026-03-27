import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { publicSupabase, supabase } from '../api/supabaseClient';
import { profileDataType } from '../assets/data';

interface AuthContextValue {
	session: Session | null;
	user: User | null;
	profile: profileDataType | null;
	loading: boolean;
	refreshProfile: (userId?: string) => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<profileDataType | null> {
	const { data, error } = await publicSupabase
		.from('profiles')
		.select('id, username, created_at')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('Error fetching profile:', error);
		return null;
	}

	return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<profileDataType | null>(null);
	const [loading, setLoading] = useState(true);

	const refreshProfile = async (userId?: string) => {
		const targetUserId = userId || session?.user?.id;
		if (!targetUserId) {
			setProfile(null);
			return;
		}

		const profileData = await fetchProfile(targetUserId);
		setProfile(profileData);
	};

	useEffect(() => {
		let isMounted = true;

		const getSessionWithTimeout = async () => {
			return Promise.race([
				supabase.auth.getSession(),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Auth session timeout')), 4000)
				),
			]);
		};

		async function bootstrap() {
			try {
				const {
					data: { session: currentSession },
				} = await getSessionWithTimeout();

				if (!isMounted) return;

				setSession(currentSession);
				setUser(currentSession?.user ?? null);

				if (currentSession?.user?.id) {
					const profileData = await fetchProfile(currentSession.user.id);
					if (isMounted) {
						setProfile(profileData);
					}
				}
			} catch (error) {
				console.error('Error bootstrapping auth session:', error);
				if (isMounted) {
					setSession(null);
					setUser(null);
					setProfile(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		bootstrap();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
			try {
				setSession(nextSession);
				setUser(nextSession?.user ?? null);

				if (nextSession?.user?.id) {
					const profileData = await fetchProfile(nextSession.user.id);
					setProfile(profileData);
				} else {
					setProfile(null);
				}
			} catch (error) {
				console.error('Error handling auth state change:', error);
				setProfile(null);
			} finally {
				setLoading(false);
			}
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const value = useMemo(
		() => ({
			session,
			user,
			profile,
			loading,
			refreshProfile,
			signOut: async () => {
				await supabase.auth.signOut();
			},
		}),
		[loading, profile, session, user]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}

	return context;
}
