import React, { useState, useContext } from 'react';
import { ToneOfVoice, CopyType } from '../types';
import { generateCopy } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { AppContext } from './Dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ResultCard: React.FC<{ result: string, onClear: () => void }> = ({ result, onClear }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
        <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">Copy Gerada</h3>
            <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-lg whitespace-pre-wrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {result}
            </div>
            <div className="flex items-center space-x-4 mt-4">
                <Button onClick={handleCopy} variant="secondary">
                    {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button onClick={onClear} variant="danger-outline">
                    Limpar
                </Button>
            </div>
        </div>
    </Card>
  );
};

export const GerarCopy: React.FC = () => {
  const context = useContext(AppContext);
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [tone, setTone] = useLocalStorage<ToneOfVoice>('nms-tone-preference', ToneOfVoice.Profissional);
  const [type, setType] = useLocalStorage<CopyType>('nms-type-preference', CopyType.Anuncio);
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    const generated = await generateCopy(productName, description, targetAudience, tone, type);
    setResult(generated);
    setIsLoading(false);

    if (context && generated) {
      const newCopyPrompt = { productName, description, targetAudience, tone, type };
      context.addGeneratedCopy({
        prompt: newCopyPrompt,
        result: generated,
      });
    }
  };
  
  const clearResult = () => {
    setResult('');
  }

  return (
    <div className="space-y-8">
      <PageTitle title="Gerador de Copy com IA" subtitle="Crie textos persuasivos para seus produtos e serviços." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <Input
                id="productName"
                label="Nome do Produto/Serviço"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <Textarea
                id="description"
                label="Descrição do Produto/Serviço"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
              <Input
                id="targetAudience"
                label="Público-alvo"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
              />
              <Select
                id="tone"
                label="Tom de Voz"
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneOfVoice)}
                options={Object.values(ToneOfVoice)}
              />
              <Select
                id="type"
                label="Tipo de Copy"
                value={type}
                onChange={(e) => setType(e.target.value as CopyType)}
                options={Object.values(CopyType)}
              />
              <Button type="submit" disabled={isLoading} fullWidth>
                {isLoading ? 'Gerando...' : 'Gerar Copy'}
              </Button>
            </form>
        </Card>

        <div className="flex flex-col">
            {isLoading && (
              <div className="flex-grow flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">A IA está criando algo incrível...</p>
                </div>
              </div>
            )}
            {result && !isLoading && <ResultCard result={result} onClear={clearResult}/>}
            {!result && !isLoading && (
                <div className="flex-grow flex items-center justify-center rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary border-2 border-dashed border-light-border dark:border-dark-border">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary p-8 text-center">O resultado da sua copy aparecerá aqui.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};