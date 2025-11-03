import React, { useContext } from 'react';
import { PageTitle } from '../components/common/PageTitle';
import { Card } from '../components/common/Card';
import { AppContext } from './Dashboard';
import { GeneratedCopy, ContentIdea } from '../types';

const PencilAltIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const LightBulbIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
const CalendarIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-light-bg-secondary to-light-bg dark:from-dark-bg-secondary dark:to-dark-bg">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
                <Icon className="w-6 h-6 text-primary" />
            </div>
        </div>
    </Card>
  );
};

const RecentActivityItem: React.FC<{ item: GeneratedCopy | ContentIdea }> = ({ item }) => {
    const isCopy = 'prompt' in item;
    const title = isCopy ? item.prompt.productName : item.title;
    const type = isCopy ? 'Copy Gerada' : 'Ideia Salva';
    
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-medium text-light-text dark:text-dark-text truncate pr-4" title={title}>{title}</p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{type}</p>
            </div>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">
                {new Date(item.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}

// FIX: Replaced non-functional anchor tags with interactive buttons for quick navigation.
const QuickAccessCard: React.FC = () => {
    const context = useContext(AppContext);

    const navigateTo = (page: string) => {
        context?.setActivePage(page);
    };

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Acesso Rápido</h3>
                <div className="space-y-4">
                    <button onClick={() => navigateTo('Gerar Copy')} className="w-full text-left block p-4 bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors">
                        <h4 className="font-semibold">Gerar Nova Copy</h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Crie textos de marketing com IA.</p>
                    </button>
                    <button onClick={() => navigateTo('Ideias de Conteúdo')} className="w-full text-left block p-4 bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors">
                        <h4 className="font-semibold">Buscar Ideias</h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Receba sugestões de conteúdo.</p>
                    </button>
                    <button onClick={() => navigateTo('Planejamento')} className="w-full text-left block p-4 bg-light-bg dark:bg-dark-bg hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors">
                        <h4 className="font-semibold">Planejar Conteúdo</h4>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">Organize suas publicações.</p>
                    </button>
                </div>
            </div>
        </Card>
    );
}

export const AreaPrincipal: React.FC = () => {
    const context = useContext(AppContext);
    
    if (!context) return null;

    const { user, generatedCopies, contentIdeas, plannedPosts } = context;
    
    const recentActivities = [...generatedCopies, ...contentIdeas]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8">
            <PageTitle title={`Olá, ${user.name}!`} subtitle="Pronto para criar algo incrível hoje?" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Copys Geradas" value={generatedCopies.length} icon={PencilAltIcon} />
                <StatCard title="Ideias Salvas" value={contentIdeas.length} icon={LightBulbIcon} />
                <StatCard title="Posts Agendados" value={plannedPosts.length} icon={CalendarIcon} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
                            <div className="divide-y divide-light-border dark:divide-dark-border">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map(item => <RecentActivityItem key={item.id} item={item} />)
                                ) : (
                                    <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                                        Nenhuma atividade recente. Comece a criar!
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <QuickAccessCard />
                </div>
            </div>
        </div>
    );
};