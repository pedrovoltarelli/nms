import React, { useState, useContext, useCallback } from 'react';
import { generateContentIdeas, generateIdeaExpansion } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { AppContext } from './Dashboard';
import { ContentIdea as ContentIdeaType } from '../types'; // Import as ContentIdeaType to avoid name collision

interface Idea {
    title: string;
    description: string;
    category: string;
}

const CheckIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const LightBulbIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);


const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => {
  const context = useContext(AppContext);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpandedIdeaOpen, setIsExpandedIdeaOpen] = useState(false);
  const [expandedIdeaText, setExpandedIdeaText] = useState<string | null>(null);
  const [isLoadingExpansion, setIsLoadingExpansion] = useState(false);

  const handleSave = () => {
    if (context) {
        // Generate temporary ID and createdAt for the idea before saving
        const newIdea: Omit<ContentIdeaType, 'user_id'> = {
            id: crypto.randomUUID(), // Unique ID for client-side representation
            createdAt: new Date().toISOString(),
            ...idea,
        };
        context.addContentIdea(newIdea);
        setIsSaved(true);
    }
  };

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
                <Button onClick={handleSave} size="sm" variant={isSaved ? "success" : "secondary"} disabled={isSaved} className="gap-2">
                    {isSaved ? (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Salvo!</span>
                        </>
                    ) : (
                        'Salvar Ideia'
                    )}
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


export const IdeiasConteudo: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const parseIdeas = (text: string): Idea[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return lines.map(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length === 3) {
        const title = parts[0].replace(/^\d+\.\s*\*\*/, '').replace(/\*\*$/, '').trim();
        return {
          title: title,
          description: parts[1],
          category: parts[2],
        };
      }
      return null;
    }).filter((idea): idea is Idea => idea !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIdeas([]);
    setError('');
    try {
      const result = await generateContentIdeas(niche);
      const parsed = parseIdeas(result);
      if (parsed.length === 0 && result.length > 0) {
        setError('Não foi possível processar a resposta da IA. Tente novamente.');
      }
      setIdeas(parsed);
    } catch (err) {
      setError('Ocorreu um erro. Por favor, tente novamente.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <PageTitle title="Gerador de Ideias de Conteúdo" subtitle="Encontre inspiração para seus próximos posts, vídeos e artigos." />
      
      <Card>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <Input
            id="niche"
            placeholder="Digite seu nicho ou objetivo (ex: 'marketing para pequenas empresas')"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            required
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Gerando...' : 'Gerar Ideias'}
          </Button>
        </form>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-12">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">Buscando as melhores ideias para você...</p>
            </div>
        </div>
      )}

      {error && <p className="text-center text-red-500">{error}</p>}

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea, index) => (
            <IdeaCard key={index} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
};