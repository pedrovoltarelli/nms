import React, { useState, createContext, useEffect, ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { AreaPrincipal } from './AreaPrincipal';
import { GerarCopy } from './GerarCopy';
import { IdeiasConteudo } from './IdeiasConteudo';
import { Planejamento } from './Planejamento';
import { Anuncios } from './Anuncios';
import { Analises } from './Analises';
import { Configuracoes } from './Configuracoes';
import { User, Theme, GeneratedCopy, ContentIdea, PlannedPost } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { supabase } from '../services/supabase';

interface AppContextType {
  user: User;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  logout: () => void;
  generatedCopies: GeneratedCopy[];
  contentIdeas: ContentIdea[];
  plannedPosts: PlannedPost[];
  addGeneratedCopy: (copy: Omit<GeneratedCopy, 'id' | 'createdAt' | 'user_id'>) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'user_id'>) => void;
  addPlannedPost: (post: Omit<PlannedPost, 'id' | 'user_id'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  setActivePage: (page: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

interface DashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

const renderActivePage = (page: string): ReactNode => {
  switch (page) {
    case 'Área Principal':
      return <AreaPrincipal />;
    case 'Gerar Copy':
      return <GerarCopy />;
    case 'Ideias de Conteúdo':
      return <IdeiasConteudo />;
    case 'Planejamento':
      return <Planejamento />;
    case 'Anúncios':
      return <Anuncios />;
    case 'Análises':
      return <Analises />;
    case 'Configurações':
      return <Configuracoes />;
    default:
      return <AreaPrincipal />;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onUpdateUser, onLogout }) => {
  const [activePage, setActivePage] = useState('Área Principal');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('nms-theme', 'dark');

  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Effect to fetch initial data and listen for real-time changes from Supabase
  useEffect(() => {
    if (!user.id) return;

    const fetchData = async () => {
        const { data: copies } = await supabase.from('generatedCopies').select('*').eq('user_id', user.id).order('createdAt', { ascending: false });
        setGeneratedCopies(copies || []);

        const { data: ideas } = await supabase.from('contentIdeas').select('*').eq('user_id', user.id).order('createdAt', { ascending: false });
        setContentIdeas(ideas || []);
        
        const { data: posts } = await supabase.from('plannedPosts').select('*').eq('user_id', user.id).order('date', { ascending: false });
        setPlannedPosts(posts || []);
    };
    
    fetchData();

    const copiesSubscription = supabase.channel('generatedCopies')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'generatedCopies', filter: `user_id=eq.${user.id}` }, 
        payload => setGeneratedCopies(current => [payload.new as GeneratedCopy, ...current])
      ).subscribe();
      
    const ideasSubscription = supabase.channel('contentIdeas')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contentIdeas', filter: `user_id=eq.${user.id}` }, 
        payload => setContentIdeas(current => [payload.new as ContentIdea, ...current])
      ).subscribe();

    const postsSubscription = supabase.channel('plannedPosts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'plannedPosts', filter: `user_id=eq.${user.id}` }, 
        payload => setPlannedPosts(current => [payload.new as PlannedPost, ...current])
      ).subscribe();

    return () => {
      supabase.removeChannel(copiesSubscription);
      supabase.removeChannel(ideasSubscription);
      supabase.removeChannel(postsSubscription);
    };
  }, [user.id]);
  
  const addGeneratedCopy = async (copy: Omit<GeneratedCopy, 'id' | 'createdAt' | 'user_id'>) => {
    const newCopy = {
        ...copy,
        createdAt: new Date().toISOString(),
        user_id: user.id,
    };
    await supabase.from('generatedCopies').insert(newCopy);
  };

  const addContentIdea = async (idea: Omit<ContentIdea, 'id' | 'createdAt'| 'user_id'>) => {
    const newIdea = {
        ...idea,
        createdAt: new Date().toISOString(),
        user_id: user.id,
    };
    await supabase.from('contentIdeas').insert(newIdea);
  };

  const addPlannedPost = async (post: Omit<PlannedPost, 'id' | 'user_id'>) => {
    const newPost = {
        ...post,
        user_id: user.id,
    };
    await supabase.from('plannedPosts').insert(newPost);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    onUpdateUser(updatedUser);
  };

  const contextValue: AppContextType = {
    user,
    theme,
    setTheme,
    logout: onLogout,
    generatedCopies,
    contentIdeas,
    plannedPosts,
    addGeneratedCopy,
    addContentIdea,
    addPlannedPost,
    onUpdateUser: handleUpdateUser,
    setActivePage
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`flex h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300`}>
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage}
          onLogout={onLogout}
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
            {renderActivePage(activePage)}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};