import { create } from 'zustand';
import { supabase } from '../config/supabase';

const ADMIN_EMAILS = [
  'ptf.attn.admin@gmail.com',
  'srmptfoundation@gmail.com'
];

const STAFF_EMAILS = [
  'ptf.attn.classincharge@gmail.com',
  'aswin27dev@gmail.com'
];

const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  role: 'incharge',
  isLoading: true,
  authError: null,

  checkAccess: (email) => {
    if (ADMIN_EMAILS.includes(email.toLowerCase())) return 'admin';
    if (STAFF_EMAILS.includes(email.toLowerCase())) return 'incharge';
    return null;
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const role = get().checkAccess(session.user.email);
      if (!role) {
        await supabase.auth.signOut();
        set({ session: null, user: null, role: 'incharge', isLoading: false, authError: 'You do not have access to this system.' });
        return;
      }
      
      set({ session, user: session.user, role, isLoading: false, authError: null });
      localStorage.setItem('supabase_token', session.access_token);
    } else {
      set({ session: null, user: null, role: 'incharge', isLoading: false });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const role = get().checkAccess(session.user.email);
        if (!role) {
          await supabase.auth.signOut();
          set({ session: null, user: null, role: 'incharge', isLoading: false, authError: 'You do not have access to this system.' });
          return;
        }
        
        set({ session, user: session.user, role, isLoading: false, authError: null });
        localStorage.setItem('supabase_token', session.access_token);
      } else {
        localStorage.removeItem('supabase_token');
        set({ user: null, session: null, role: 'incharge', isLoading: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase_token');
    set({ user: null, session: null, role: 'incharge' });
  }
}));

export default useAuthStore;
