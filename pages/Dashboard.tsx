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
import { User, GeneratedCopy, ContentIdea, PlannedPost } from '../types';
import { supabase } from '../services/supabase';
import { AIChat } from './AIChat';
import { IdeiasSalvas } from './IdeiasSalvas'; // Import IdeiasSalvas

const PAGE_SIZE = 10;

interface AppContextType {
  user: User;
  logout: () => void;
  generatedCopies: GeneratedCopy[];
  contentIdeas: ContentIdea[];
  plannedPosts: PlannedPost[];
  addGeneratedCopy: (copy: Omit<GeneratedCopy, 'id' | 'createdAt' | 'user_id'>) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'user_id'>) => void;
  addPlannedPost: (post: Omit<PlannedPost, 'id' | 'user_id'>) => void;
  updatePlannedPost: (post: PlannedPost) => void;
  onUpdateUser: (updatedUser: User) => void;
  setActivePage: (page: string) => void;
  loadMoreActivities: () => Promise<void>;
  isLoadingMore: boolean;
  hasMoreActivities: boolean;
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
    case 'Ideias Salvas': // New case for saved ideas page
      return <IdeiasSalvas />;
    case 'AI Chat':
      return <AIChat />;
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

  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [plannedPosts, setPlannedPosts] = useState<PlannedPost[]>([]);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreCopies, setHasMoreCopies] = useState(true);
  const [hasMoreIdeas, setHasMoreIdeas] = useState(true);

  // Effect to fetch initial data and listen for real-time changes from Supabase
  useEffect(() => {
    if (!user.id) return;

    const fetchData = async () => {
        const { data: copies } = await supabase.from('generatedCopies').select('*').eq('user_id', user.id).order('createdAt', { ascending: false }).range(0, PAGE_SIZE - 1);
        setGeneratedCopies(copies || []);
        if (!copies || copies.length < PAGE_SIZE) setHasMoreCopies(false);


        const { data: ideas } = await supabase.from('contentIdeas').select('*').eq('user_id', user.id).order('createdAt', { ascending: false }).range(0, PAGE_SIZE - 1);
        setContentIdeas(ideas || []);
        if (!ideas || ideas.length < PAGE_SIZE) setHasMoreIdeas(false);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'plannedPosts', filter: `user_id=eq.${user.id}` }, 
        payload => {
            if (payload.eventType === 'INSERT') {
                 setPlannedPosts(current => [payload.new as PlannedPost, ...current].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else if (payload.eventType === 'UPDATE') {
                 setPlannedPosts(current => current.map(p => p.id === payload.new.id ? payload.new as PlannedPost : p));
            }
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(copiesSubscription);
      supabase.removeChannel(ideasSubscription);
      supabase.removeChannel(postsSubscription);
    };
  }, [user.id]);

  const loadMoreActivities = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    if (hasMoreCopies) {
        const { data: moreCopies } = await supabase.from('generatedCopies').select('*').eq('user_id', user.id).order('createdAt', { ascending: false }).range(generatedCopies.length, generatedCopies.length + PAGE_SIZE - 1);
        if (moreCopies && moreCopies.length > 0) {
            setGeneratedCopies(current => [...current, ...moreCopies]);
        }
        if (!moreCopies || moreCopies.length < PAGE_SIZE) {
            setHasMoreCopies(false);
        }
    }
    
    if (hasMoreIdeas) {
        const { data: moreIdeas } = await supabase.from('contentIdeas').select('*').eq('user_id', user.id).order('createdAt', { ascending: false }).range(contentIdeas.length, contentIdeas.length + PAGE_SIZE - 1);
        if (moreIdeas && moreIdeas.length > 0) {
            setContentIdeas(current => [...current, ...moreIdeas]);
        }
        if (!moreIdeas || moreIdeas.length < PAGE_SIZE) {
            setHasMoreIdeas(false);
        }
    }

    setIsLoadingMore(false);
  };
  
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

  const updatePlannedPost = async (post: PlannedPost) => {
    await supabase.from('plannedPosts').update(post).eq('id', post.id);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    onUpdateUser(updatedUser);
  };

  const contextValue: AppContextType = {
    user,
    logout: onLogout,
    generatedCopies,
    contentIdeas,
    plannedPosts,
    addGeneratedCopy,
    addContentIdea,
    addPlannedPost,
    updatePlannedPost,
    onUpdateUser: handleUpdateUser,
    setActivePage,
    loadMoreActivities,
    isLoadingMore,
    hasMoreActivities: hasMoreCopies || hasMoreIdeas,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`flex h-screen bg-dark-bg`}>
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
            <div key={activePage} className="animate-fade-in">
              {renderActivePage(activePage)}
            </div>
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
};