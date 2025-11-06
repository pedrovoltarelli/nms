import React, { useContext } from 'react';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { AppContext } from './Dashboard';
import { ContentIdea } from '../types';
import { Button } from '../components/common/Button';
import { generateIdeaExpansion } from '../services/geminiService';
import { useState, useCallback } from 'react';

const CheckIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const LightBulbIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);

interface SavedIdeaCardProps {
    idea: ContentIdea;
}

const SavedIdeaCard: React.FC<SavedIdeaCardProps> = ({ idea }) => {
    const [isExpandedIdeaOpen, setIsExpandedIdeaOpen] = useState(false);
    const [expandedIdeaText, setExpandedIdeaText] = useState<string | null>(null);
    const [isLoadingExpansion, setIsLoadingExpansion] = useState(false);

    const handleExpandIdea = useCallback(async () => {
        if (!idea.title || !idea.description) return;

        setIsLoadingExpansion(true);
        setExpandedIdeaText(null); // Clear previous expansion
        setIsExpandedIdeaOpen(true); // Open accordion by default when expanding

        try {
            const response = await generateIdeaExpansion(idea.title, idea.description);
            setExpandedIdeaText(response);
        } catch (error) {
            console.error("Error expanding idea:", error);
            setExpandedIdeaText("Ocorreu um erro ao expandir a ideia. Por favor, tente novamente.");
        } finally {
            setIsLoadingExpansion(false);
        }
    }, [idea.title, idea.description]);

    return (
        <Card>
            <div className="p-5 flex flex-col h-full">
                <div className="flex-grow">
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full mb-2">{idea.category}</span>
                    <h4 className="font-semibold text-light-text dark:text-dark-text">{idea.title}</h4>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{idea.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="success" disabled className="gap-2">
                        <CheckIcon className="w-4 h-4" />
                        <span>Salvo!</span>
                    </Button>
                    <Button
                        onClick={handleExpandIdea}
                        size="sm"
                        variant="secondary"
                        disabled={isLoadingExpansion}
                        className="gap-2"
                    >
                        {isLoadingExpansion ? (
                            <>
                                <LightBulbIcon className="w-4 h-4 animate-pulse" />
                                <span>Expandindo...</span>
                            </>
                        ) : (
                            <>
                                <LightBulbIcon className="w-4 h-4" />
                                <span>Expandir Ideia</span>
                            </>
                        )}
                    </Button>
                </div>
                {expandedIdeaText && (
                    <div className="mt-6 border-t border-dark-border pt-6">
                        <button
                            onClick={() => setIsExpandedIdeaOpen(!isExpandedIdeaOpen)}
                            className="w-full flex items-center justify-between text-left font-semibold text-light-text dark:text-dark-text hover:text-primary transition-colors"
                        >
                            <span>Detalhes da Ideia</span>
                            {isExpandedIdeaOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                        </button>
                        {isExpandedIdeaOpen && (
                            <div className="mt-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg whitespace-pre-wrap text-sm text-light-text-secondary dark:text-dark-text-secondary animate-fade-in">
                                {expandedIdeaText}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};


export const IdeiasSalvas: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) {
        return <div className="text-center text-red-500">Erro: Contexto da aplicação não disponível.</div>;
    }

    const { contentIdeas } = context;

    return (
        <div className="space-y-8">
            <PageTitle title="Minhas Ideias Salvas" subtitle="Revise e explore todas as ideias de conteúdo que você salvou." />

            {contentIdeas.length === 0 ? (
                <Card>
                    <div className="p-8 text-center text-light-text-secondary dark:text-dark-text-secondary">
                        <p className="text-lg">Você ainda não salvou nenhuma ideia de conteúdo.</p>
                        <p className="mt-2">Vá para a página "Ideias de Conteúdo" para começar a gerar e salvar!</p>
                        <Button onClick={() => context.setActivePage('Ideias de Conteúdo')} className="mt-6">Gerar Ideias Agora</Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contentIdeas.map(idea => (
                        <SavedIdeaCard key={idea.id} idea={idea} />
                    ))}
                </div>
            )}
        </div>
    );
};