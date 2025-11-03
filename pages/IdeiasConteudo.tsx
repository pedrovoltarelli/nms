import React, { useState, useContext } from 'react';
import { generateContentIdeas } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { AppContext } from './Dashboard';

interface Idea {
    title: string;
    description: string;
    category: string;
}

const IdeaCard: React.FC<{ idea: Idea }> = ({ idea }) => {
  const context = useContext(AppContext);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (context) {
        context.addContentIdea(idea);
        setIsSaved(true);
    }
  };

  return (
    <Card>
        <div className="p-5 flex flex-col h-full">
            <div className="flex-grow">
                <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full mb-2">{idea.category}</span>
                <h4 className="font-semibold text-light-text dark:text-dark-text">{idea.title}</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{idea.description}</p>
            </div>
            <div className="mt-4">
                <Button onClick={handleSave} size="sm" variant={isSaved ? "success" : "secondary"} disabled={isSaved}>
                    {isSaved ? 'Salvo!' : 'Salvar Ideia'}
                </Button>
            </div>
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