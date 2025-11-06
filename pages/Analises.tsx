import React, { useContext, useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppContext } from './Dashboard';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GeneratedCopy, ContentIdea, CopyType } from '../types';

// Icons
const UsersIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.08-1.283-.23-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.08-1.283.23-1.857m10.54-7.857a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243zM12 12a3 3 0 11-4.243 4.243 3 3 0 014.243-4.243zM12 12L9 9" /></svg>);
const PencilAltIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const LightBulbIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
const CloseIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const CursorClickIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>);
const ShareIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>);


type ActivityType = 'all' | 'copy' | 'idea' | 'ctr' | 'sharing';

const InteractiveMetricCard: React.FC<{ 
    title: string; 
    value: string; 
    icon: React.ElementType;
    onClick: () => void;
    isActive: boolean;
}> = ({ title, value, icon: Icon, onClick, isActive }) => {
    const activeClasses = isActive ? 'ring-2 ring-primary dark:ring-primary-light shadow-lg shadow-primary/20' : 'ring-1 ring-transparent hover:ring-primary/50';
    return (
      <button onClick={onClick} className={`w-full text-left transition-all duration-300 rounded-2xl focus:outline-none ${activeClasses}`}>
          <Card className={`p-6 h-full ${isActive ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
              <div className="flex items-center justify-between">
                  <div>
                      <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">{title}</p>
                      <p className="text-3xl font-bold text-light-text dark:text-dark-text">{value}</p>
                  </div>
                  <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-primary/20' : 'bg-primary/10'}`}>
                      <Icon className="w-6 h-6 text-primary" />
                  </div>
              </div>
          </Card>
      </button>
    );
};

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      // Extract monthIdentifier from the first payload item
      const monthIdentifier = payload[0].payload.monthIdentifier; // e.g., "2024-06"
      const [year, monthIndex] = monthIdentifier.split('-').map(Number);
      
      // Create a date object to format the month name
      const date = new Date(year, monthIndex); // Month index is 0-based

      // Format the month and year
      const formattedMonthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

      return (
        <div className="p-3 bg-dark-bg-secondary/90 backdrop-blur-sm rounded-lg border border-dark-border shadow-lg">
          <p className="font-bold text-dark-text mb-2 capitalize">{formattedMonthYear}</p>
          {payload.map((pld: any, index: number) => (
             <p key={index} style={{ color: pld.color || pld.fill }} className="text-sm">
                <span className="font-medium">{pld.name}:</span> <span className="font-bold">{pld.value}</span>
             </p>
          ))}
        </div>
      );
    }
    return null;
};

// Type guard to check if an item is a GeneratedCopy
function isGeneratedCopy(item: GeneratedCopy | ContentIdea): item is GeneratedCopy {
    return 'prompt' in item && typeof item.prompt === 'object' && 'productName' in item.prompt;
}

// Type guard to check if an item is a ContentIdea
function isContentIdea(item: GeneratedCopy | ContentIdea): item is ContentIdea {
    return 'title' in item && 'description' in item && 'category' in item;
}

const ActivityDetails: React.FC<{activities: (GeneratedCopy | ContentIdea)[], title: string}> = ({ activities, title }) => (
    <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="divide-y divide-light-border dark:divide-dark-border max-h-96 overflow-y-auto pr-2">
            {activities.length > 0 ? activities.map(item => {
                 let Icon;
                 let itemTitle: string;
                 let itemType: string;
                 let itemDate: string;

                 if (isGeneratedCopy(item)) { // GeneratedCopy
                    Icon = PencilAltIcon;
                    itemTitle = item.prompt.productName;
                    itemType = 'Copy Gerada';
                    itemDate = item.createdAt;
                 } else if (isContentIdea(item)) { // ContentIdea
                    Icon = LightBulbIcon;
                    itemTitle = item.title;
                    itemType = 'Ideia Salva';
                    itemDate = item.createdAt;
                 } else {
                    return null; // Should not happen with type guards
                 }
                 
                return (
                    <div key={item.id} className="flex items-center gap-4 py-3">
                        <div className="p-2 bg-light-bg dark:bg-dark-bg rounded-full"><Icon className="w-5 h-5 text-primary"/></div>
                        <div className="flex-grow">
                            <p className="font-semibold text-light-text dark:text-dark-text truncate" title={itemTitle}>{itemTitle}</p>
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{itemType}</p>
                        </div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0">{new Date(itemDate).toLocaleDateString()}</p>
                    </div>
                );
            }) : (
                <p className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">Nenhuma atividade encontrada para os filtros selecionados.</p>
            )}
        </div>
    </div>
);


export const Analises: React.FC = () => {
    const context = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activityType, setActivityType] = useState<ActivityType>('all');
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const baseFilteredActivities = useMemo(() => {
        if (!context) return [];
        const allContent = [
            ...(context.generatedCopies || []),
            ...(context.contentIdeas || []),
        ];
        return allContent.filter(item => {
            let title = '';
            let itemDateStr = '';

            if (isGeneratedCopy(item)) { // GeneratedCopy
                title = item.prompt.productName;
                itemDateStr = item.createdAt.split('T')[0];
            } else if (isContentIdea(item)) { // ContentIdea
                title = item.title;
                itemDateStr = item.createdAt.split('T')[0];
            } else {
                return false; // Exclude other types if any, or items not matching any type
            }
            
            const itemDate = new Date(`${itemDateStr}T00:00:00`);

            const matchesSearch = searchTerm ? title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
            const matchesStartDate = startDate ? itemDate >= new Date(`${startDate}T00:00:00`) : true;
            const matchesEndDate = endDate ? itemDate <= new Date(`${endDate}T00:00:00`) : true;

            return matchesSearch && matchesStartDate && matchesEndDate;
        });
    }, [context, searchTerm, startDate, endDate]);

    const totalCopies = useMemo(() => baseFilteredActivities.filter(isGeneratedCopy).length, [baseFilteredActivities]);
    const totalIdeas = useMemo(() => baseFilteredActivities.filter(isContentIdea).length, [baseFilteredActivities]);

    // Fake but dynamic-looking metrics for UI purposes
    const estimatedCtr = useMemo(() => {
        if (totalCopies === 0) return '0.00%';
        const ctrCopies = baseFilteredActivities.filter(item => isGeneratedCopy(item) && [CopyType.Anuncio, CopyType.PaginaVendas, CopyType.Titulo].includes(item.prompt.type)).length;
        // Base rate of 1.5%, plus some variation based on relevant copies
        return (1.5 + (ctrCopies / (totalCopies || 1)) * 2).toFixed(2) + '%';
    }, [baseFilteredActivities, totalCopies]);

    const sharingPotential = useMemo(() => {
        if (totalIdeas === 0) return '0';
        const sharableIdeas = baseFilteredActivities.filter(item => isContentIdea(item) && ['Dica', 'Tutorial', 'Interativo', 'Prova Social'].includes(item.category)).length;
        // Base score of 40, plus some variation based on relevant ideas
        const score = 40 + (sharableIdeas / (totalIdeas || 1)) * 50;
        return Math.min(score, 99).toFixed(0); // Cap at 99
    }, [baseFilteredActivities, totalIdeas]);


    const chartData = useMemo(() => {
        const months: { [key: string]: { name: string; Copys: number; Ideas: number; monthIdentifier: string } } = {};
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - 5);
        dateLimit.setDate(1);

        baseFilteredActivities.forEach(item => {
            if (isGeneratedCopy(item) || isContentIdea(item)) { // Only copies and ideas
                const itemDate = new Date(item.createdAt);
                if (itemDate >= dateLimit) {
                    const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;
                    if (!months[monthKey]) {
                        months[monthKey] = {
                            name: itemDate.toLocaleString('default', { month: 'short' }),
                            Copys: 0,
                            Ideas: 0,
                            monthIdentifier: monthKey,
                        };
                    }
                    if (isGeneratedCopy(item)) months[monthKey].Copys += 1;
                    if (isContentIdea(item)) months[monthKey].Ideas += 1;
                }
            }
        });

        return Object.values(months).sort((a,b) => new Date(a.monthIdentifier).getTime() - new Date(b.monthIdentifier).getTime());
    }, [baseFilteredActivities]);

    const displayedActivities = useMemo(() => {
        let activities;
        
        switch (activityType) {
            case 'copy':
                activities = baseFilteredActivities.filter(isGeneratedCopy);
                break;
            case 'idea':
                activities = baseFilteredActivities.filter(isContentIdea);
                break;
            case 'ctr':
                activities = baseFilteredActivities.filter(item => isGeneratedCopy(item) && [CopyType.Anuncio, CopyType.PaginaVendas, CopyType.Titulo].includes(item.prompt.type));
                break;
            case 'sharing':
                activities = baseFilteredActivities.filter(item => isContentIdea(item) && ['Dica', 'Tutorial', 'Interativo', 'Prova Social'].includes(item.category));
                break;
            default: // 'all'
                activities = baseFilteredActivities;
        }

        if (selectedMonth) {
            activities = activities.filter(item => {
                const itemDate = new Date(item.createdAt);
                return `${itemDate.getFullYear()}-${itemDate.getMonth()}` === selectedMonth;
            });
        }
        
        return (activities as (GeneratedCopy | ContentIdea)[]).sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [baseFilteredActivities, activityType, selectedMonth]);


    const handleClearFilters = () => {
        setSearchTerm(''); setStartDate(''); setEndDate('');
        setActivityType('all'); setSelectedMonth(null);
    };

    const handleBarClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const monthIdentifier = data.activePayload[0].payload.monthIdentifier;
            setSelectedMonth(current => current === monthIdentifier ? null : monthIdentifier);
        }
    };
    
    const detailsTitle = useMemo(() => {
        let title = "Detalhes da Atividade";
        if (selectedMonth) {
            const [year, monthIndex] = selectedMonth.split('-').map(Number);
            const date = new Date(year, monthIndex);
            title = `Atividades de ${date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`;
        }
        return title;
    }, [selectedMonth]);

    return (
        <div className="space-y-8">
            <PageTitle title="Análises e Métricas" subtitle="Acompanhe o desempenho do seu conteúdo e entenda sua audiência." />

            <Card>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <Input id="search" label="Buscar por nome" placeholder="Nome da campanha..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="md:col-span-2"/>
                        <Input id="start-date" label="Data de Início" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <Input id="end-date" label="Data de Fim" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                     {(searchTerm || startDate || endDate) && (
                        <div className="mt-4"><Button variant="secondary" size="sm" onClick={handleClearFilters}>Limpar Filtros</Button></div>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <InteractiveMetricCard title="Total de Atividades" value={String(baseFilteredActivities.length)} icon={UsersIcon} onClick={() => setActivityType('all')} isActive={activityType === 'all'} />
                <InteractiveMetricCard title="Copys Geradas" value={String(totalCopies)} icon={PencilAltIcon} onClick={() => setActivityType('copy')} isActive={activityType === 'copy'} />
                <InteractiveMetricCard title="Ideias Salvas" value={String(totalIdeas)} icon={LightBulbIcon} onClick={() => setActivityType('idea')} isActive={activityType === 'idea'} />
                <InteractiveMetricCard title="CTR Estimada" value={estimatedCtr} icon={CursorClickIcon} onClick={() => setActivityType('ctr')} isActive={activityType === 'ctr'} />
                <InteractiveMetricCard title="Potencial de Viral" value={`${sharingPotential}/100`} icon={ShareIcon} onClick={() => setActivityType('sharing')} isActive={activityType === 'sharing'} />
            </div>
            
            <Card>
               <div className="p-6">
                   <div className="flex flex-wrap items-center justify-between gap-2">
                     <div>
                       <h3 className="text-xl font-semibold">Atividade Mensal</h3>
                       <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">Itens criados nos últimos 6 meses. Clique em uma barra para filtrar.</p>
                     </div>
                     {selectedMonth && <Button variant="secondary" size="sm" onClick={() => setSelectedMonth(null)} className="gap-2">Limpar Mês <CloseIcon className="w-4 h-4"/></Button>}
                   </div>
                   <div className="mt-6 h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} onClick={handleBarClick} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="name" tick={{ fill: '#94A3B8' }} stroke="#334155" />
                                <YAxis tick={{ fill: '#94A3B8' }} stroke="#334155" allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(167, 139, 250, 0.1)' }}/>
                                <Legend wrapperStyle={{fontSize: '14px'}} iconSize={10} />
                                <Bar name="Copys" dataKey="Copys" stackId="a" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                                <Bar name="Ideias" dataKey="Ideas" stackId="a" fill="#A78BFA" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                   </div>
                   <ActivityDetails activities={displayedActivities} title={detailsTitle} />
               </div>
            </Card>
        </div>
    );
};