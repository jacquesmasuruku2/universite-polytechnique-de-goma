
import React, { useState, useEffect } from 'react';
import { X, Save, ShieldAlert, Image as ImageIcon, LogOut, Loader2, Mail, Lock } from 'lucide-react';
import { NewsItem } from '../types';
import { supabase } from '../supabaseClient';

interface AdminPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (news: NewsItem) => void;
}

const AdminPublishModal: React.FC<AdminPublishModalProps> = ({ isOpen, onClose, onPublish }) => {
  // Email vide par défaut pour ne pas l'exposer publiquement
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<NewsItem>>({
    category: 'Actualité',
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  });

  const ADMIN_EMAIL = 'jacquesmasuruku2@gmail.com';

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await (supabase.auth as any).getSession();
      if (session?.user) {
        if (session.user.email === ADMIN_EMAIL) {
          setUser(session.user);
        } else {
          await (supabase.auth as any).signOut();
          setUser(null);
        }
      }
    };
    
    checkSession();

    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange(async (_event: any, session: any) => {
      if (session?.user) {
        if (session.user.email === ADMIN_EMAIL) {
          setUser(session.user);
          setIsLoading(false);
        } else {
          await (supabase.auth as any).signOut();
          setUser(null);
          alert(`Accès Refusé : Cette adresse n'est pas autorisée.`);
        }
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await (supabase.auth as any).signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      
      if (data.user?.email !== ADMIN_EMAIL) {
        await (supabase.auth as any).signOut();
        alert("Accès refusé : Identifiants non autorisés.");
        return;
      }

      setUser(data.user);
      setPassword('');
    } catch (error: any) {
      alert(`Erreur d'authentification : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      alert(`Erreur Google Auth : ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    setUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNews: NewsItem = {
      id: Date.now().toString(),
      title: formData.title || '',
      content: formData.content || '',
      date: formData.date || '',
      category: formData.category as any,
      image: formData.image || 'https://picsum.photos/id/24/800/600'
    };
    onPublish(newNews);
    onClose();
    setFormData({
      category: 'Actualité',
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-upgBlue/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="bg-upgBlue p-6 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
            <ShieldAlert size={20} className="text-upgGold" />
            Espace Administration UPG
          </h3>
          <div className="flex items-center gap-4">
            {user && (
              <button onClick={handleLogout} className="text-white/60 hover:text-upgGold transition-colors" title="Déconnexion">
                <LogOut size={18} />
              </button>
            )}
            <button onClick={onClose} className="hover:rotate-90 transition-transform"><X /></button>
          </div>
        </div>

        {!user ? (
          <div className="p-8 space-y-6">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2 font-medium italic">Accès réservé au Rectorat</p>
              <div className="h-1 w-12 bg-upgGold mx-auto rounded-full"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Administrateur" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-upgGold dark:text-white text-sm border border-transparent"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-upgGold dark:text-white text-sm border border-transparent"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-upgBlue text-white py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-upgBlue/90 transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : "VALIDER L'ACCÈS"}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OU</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              S'identifier avec Google Admin
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <div className="flex items-center gap-3 mb-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/30">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Session Administrateur</p>
                <p className="text-[10px] text-green-600/70 dark:text-green-400/70 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-upgBlue dark:text-upgGold uppercase tracking-widest">Type de message</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 dark:text-white font-medium"
              >
                <option>Actualité</option>
                <option>Événement</option>
                <option>Annonce</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-upgBlue dark:text-upgGold uppercase tracking-widest">Titre du Communiqué</label>
              <input 
                placeholder="Titre institutionnel..." 
                required
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-upgBlue dark:text-upgGold uppercase tracking-widest">Corps du Texte</label>
              <textarea 
                placeholder="Détails de l'information..." 
                rows={4}
                required
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-lg outline-none border border-slate-200 dark:border-slate-700 dark:text-white resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-upgBlue dark:text-upgGold uppercase tracking-widest">Image de couverture (URL)</label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <ImageIcon size={18} className="text-slate-400" />
                <input 
                  placeholder="https://..." 
                  className="flex-1 bg-transparent outline-none text-xs dark:text-white"
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:text-upgBlue dark:hover:text-upgGold transition-colors text-xs uppercase tracking-[0.2em]">Annuler</button>
              <button type="submit" className="flex-[2] bg-upgBlue dark:bg-upgGold text-white dark:text-upgBlue px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                <Save size={18} /> VALIDER LA PUBLICATION
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPublishModal;
