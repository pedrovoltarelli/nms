import React, { useState, useContext, useCallback, useEffect, useRef } from 'react';
import { ToneOfVoice, CopyType, GeneratedCopy as GeneratedCopyType } from '../types';
import { generateCopy } from '../services/geminiService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { AppContext } from './Dashboard';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CheckIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);
const DocumentDuplicateIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v10a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2m0-4H5a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1" /></svg>);
const ArrowUpwardIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7l4-4m0 0l4 4m-4-4v18" /></svg>);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>);
const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);


interface ResultCardProps {
    result: string;
    onClear: () => void;
    onSave: () => void;
    isSaved: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClear, onSave, isSaved }) => {
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
                <Button onClick={handleCopy} variant="secondary" className="gap-2">
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button 
                    onClick={onSave} 
                    variant={isSaved ? "success" : "primary"} 
                    disabled={isSaved} 
                    className="gap-2"
                >
                    {isSaved ? (
                        <>
                            <CheckIcon className="w-4 h-4" />
                            <span>Salvo!</span>
                        </>
                    ) : (
                        'Salvar Copy'
                    )}
                </Button>
                <Button onClick={onClear} variant="danger-outline">
                    Limpar
                </Button>
            </div>
        </div>
    </Card>
  );
};

const loadingMessages = [
  "Otimizando sua mensagem...",
  "Criando palavras persuasivas...",
  "Analisando seu público-alvo...",
  "Gerando copy de alta conversão...",
  "Aprimorando sua chamada para ação...",
  "Consultando as melhores práticas de marketing...",
  "Pensando em headlines irresistíveis...",
  "Desbloqueando o potencial da sua marca...",
];

interface PastCopyCardProps {
    copy: GeneratedCopyType;
    onReuse: (copy: GeneratedCopyType) => void;
}

const PastCopyCard: React.FC<PastCopyCardProps> = ({ copy, onReuse }) => {
    const [copied, setCopied] = useState(false);
    const [isResultOpen, setIsResultOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(copy.result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="p-5 flex flex-col h-full">
            <div className="flex-grow">
                <h4 className="font-semibold text-light-text dark:text-dark-text truncate" title={copy.prompt.productName}>{copy.prompt.productName}</h4>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-1">{copy.prompt.type} | {copy.prompt.tone}</p>
                <p className="text-xs text-light-text-secondary/70 dark:text-dark-text-secondary/70 mt-1">Gerado em: {new Date(copy.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div className="mt-4 border-t border-dark-border pt-4">
                <button
                    onClick={() => setIsResultOpen(!isResultOpen)}
                    className="w-full flex items-center justify-between text-left font-semibold text-light-text dark:text-dark-text hover:text-primary transition-colors text-sm"
                >
                    <span>Ver Copy Completa</span>
                    {isResultOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>
                {isResultOpen && (
                    <div className="mt-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg whitespace-pre-wrap text-sm text-light-text-secondary dark:text-dark-text-secondary animate-fade-in max-h-48 overflow-y-auto custom-scrollbar">
                        {copy.result}
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleCopy} size="sm" variant="secondary" className="gap-2">
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button onClick={() => onReuse(copy)} size="sm" variant="primary" className="gap-2">
                    <ArrowUpwardIcon className="w-4 h-4" />
                    Reutilizar
                </Button>
            </div>
        </Card>
    );
};

interface PromptExample {
  title: string;
  useCase: string;
  productName: string;
  description: string;
  targetAudience: string;
  tone: ToneOfVoice;
  type: CopyType;
}

const promptExamples: PromptExample[] = [
  {
    title: 'Anúncio de Lançamento de E-book',
    useCase: 'Para promover um novo e-book sobre marketing digital.',
    productName: 'E-book "Marketing Descomplicado"',
    description: 'Guia completo para empreendedores iniciantes que desejam dominar o marketing digital sem complicação. Capítulos sobre SEO, mídias sociais, e-mail marketing e análise de dados.',
    targetAudience: 'Empreendedores e pequenos empresários sem experiência em marketing digital, buscando crescimento online.',
    tone: ToneOfVoice.Informativo,
    type: CopyType.Anuncio,
  },
  {
    title: 'Post Engajador para Instagram',
    useCase: 'Gerar interação e curiosidade sobre um novo produto de beleza.',
    productName: 'Sérum Facial Rejuvenescedor GlowUp',
    description: 'Sérum com ácido hialurônico e vitamina C, que hidrata profundamente, reduz linhas finas e devolve o viço natural da pele. Fórmula leve e absorção rápida.',
    targetAudience: 'Mulheres jovens e adultas (25-45 anos) preocupadas com os primeiros sinais de envelhecimento e que buscam uma pele saudável e iluminada.',
    tone: ToneOfVoice.Emocional,
    type: CopyType.PostInstagram,
  },
  {
    title: 'Título Persuasivo para Página de Vendas',
    useCase: 'Capturar a atenção para um curso online de finanças pessoais.',
    productName: 'Curso "Liberdade Financeira em 90 Dias"',
    description: 'Curso online prático que ensina a organizar finanças, criar um orçamento eficaz, investir de forma inteligente e alcançar a independência financeira em 3 meses. Inclui planilhas e mentorias.',
    targetAudience: 'Pessoas endividadas ou que se sentem perdidas com suas finanças, buscando um método claro e rápido para mudar sua realidade financeira.',
    tone: ToneOfVoice.Persuasivo,
    type: CopyType.Titulo,
  },
];

interface PromptExampleCardProps {
  example: PromptExample;
  onUseExample: (example: PromptExample) => void;
}

const PromptExampleCard: React.FC<PromptExampleCardProps> = ({ example, onUseExample }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <Card className="p-5 flex flex-col h-full">
      <div className="flex-grow">
        <h4 className="font-semibold text-light-text dark:text-dark-text mb-2">{example.title}</h4>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
          <span className="font-medium">Uso:</span> {example.useCase}
        </p>

        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full flex items-center justify-between text-left font-semibold text-light-text dark:text-dark-text hover:text-primary transition-colors text-sm border-t border-dark-border pt-3 mt-3"
        >
          <span>Ver Detalhes do Prompt</span>
          {isDetailsOpen ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
        {isDetailsOpen && (
          <div className="mt-3 p-3 bg-light-bg dark:bg-dark-bg rounded-lg text-xs text-light-text-secondary dark:text-dark-text-secondary animate-fade-in space-y-2">
            <p><strong>Produto:</strong> {example.productName}</p>
            <p><strong>Descrição:</strong> {example.description}</p>
            <p><strong>Público:</strong> {example.targetAudience}</p>
            <p><strong>Tom:</strong> {example.tone}</p>
            <p><strong>Tipo:</strong> {example.type}</p>
          </div>
        )}
      </div>
      <div className="mt-4">
        <Button onClick={() => onUseExample(example)} size="sm" variant="primary" fullWidth className="gap-2">
          <SparklesIcon className="w-4 h-4" />
          Usar este Prompt
        </Button>
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
  const [isCurrentCopySaved, setIsCurrentCopySaved] = useState(false); // New state to track if current copy is saved
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
  const [apiError, setApiError] = useState(''); // NEW STATE FOR API ERRORS
  const messageIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      let messageIndex = 0;
      setLoadingMessage(loadingMessages[messageIndex]);
      messageIntervalRef.current = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000); // Change message every 3 seconds
    } else {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
      }
    }

    return () => {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
      }
    };
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult('');
    setApiError(''); // Clear any previous API errors
    setIsCurrentCopySaved(false); // Reset save status on new generation
    const generated = await generateCopy(productName, description, targetAudience, tone, type);
    
    // Check if the generated string is an error message
    if (generated.startsWith('Erro:')) {
        setApiError(generated); // Set API error message
        setResult(''); // Ensure no previous result is shown
    } else {
        setResult(generated); // Set successful result
        setApiError(''); // Clear API error
    }
    setIsLoading(false);
  };
  
  const clearResult = () => {
    setResult('');
    setApiError(''); // Clear API error
    setIsCurrentCopySaved(false); // Reset save status when clearing
  }

  const handleSaveGeneratedCopy = useCallback(() => {
    if (context && result && !isCurrentCopySaved) {
        const newCopyPrompt = { productName, description, targetAudience, tone, type };
        context.addGeneratedCopy({
            prompt: newCopyPrompt,
            result: result,
        });
        setIsCurrentCopySaved(true);
    }
  }, [context, result, productName, description, targetAudience, tone, type, isCurrentCopySaved]);

  const handleReuseCopy = useCallback((copyToReuse: GeneratedCopyType) => {
    setProductName(copyToReuse.prompt.productName);
    setDescription(copyToReuse.prompt.description);
    setTargetAudience(copyToReuse.prompt.targetAudience);
    setTone(copyToReuse.prompt.tone);
    setType(copyToReuse.prompt.type);
    setResult(''); // Clear current result when reusing
    setApiError(''); // Clear API error when reusing
    setIsCurrentCopySaved(false); // Reset save status
    // Optionally scroll to top or focus on form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setProductName, setDescription, setTargetAudience, setTone, setType, setResult, setIsCurrentCopySaved]);

  const handleUsePromptExample = useCallback((exampleToUse: PromptExample) => {
    setProductName(exampleToUse.productName);
    setDescription(exampleToUse.description);
    setTargetAudience(exampleToUse.targetAudience);
    setTone(exampleToUse.tone);
    setType(exampleToUse.type);
    setResult(''); // Clear current result when using an example
    setApiError(''); // Clear API error when using an example
    setIsCurrentCopySaved(false); // Reset save status
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setProductName, setDescription, setTargetAudience, setTone, setType, setResult, setIsCurrentCopySaved]);


  return (
    <div className="space-y-8">
      <PageTitle title="Gerador de Copy com IA" subtitle="Crie textos persuasivos para seus produtos e serviços." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6"> {/* Grouping for Product/Service Details */}
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Detalhes do Produto/Serviço</h3>
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
              </div>

              <div className="space-y-6 pt-6 border-t border-dark-border"> {/* Grouping for Copy Settings */}
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Configurações da Copy</h3>
                <Input
                  id="targetAudience"
                  label="Público-alvo"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>
              </div>
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
                    <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">{loadingMessage}</p>
                </div>
              </div>
            )}
            {!isLoading && apiError && ( // Display API error prominently
                <Card className="flex-grow flex items-center justify-center bg-red-500/10 border-2 border-dashed border-red-500/50">
                    <p className="text-red-400 p-8 text-center">{apiError}</p>
                </Card>
            )}
            {result && !isLoading && !apiError && // Display generated result if no error
                <ResultCard 
                    result={result} 
                    onClear={clearResult} 
                    onSave={handleSaveGeneratedCopy} 
                    isSaved={isCurrentCopySaved} 
                />
            }
            {!result && !isLoading && !apiError && ( // Default empty state
                <div className="flex-grow flex items-center justify-center rounded-2xl bg-light-bg-secondary dark:bg-dark-bg-secondary border-2 border-dashed border-light-border dark:border-dark-border">
                    <p className="text-light-text-secondary dark:text-dark-text-secondary p-8 text-center">O resultado da sua copy aparecerá aqui.</p>
                </div>
            )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">Exemplos de Prompts Eficazes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promptExamples.map((example, index) => (
            <PromptExampleCard key={index} example={example} onUseExample={handleUsePromptExample} />
          ))}
        </div>
      </div>


      {context && context.generatedCopies.length > 0 && (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-6">Histórico de Cópias Geradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {context.generatedCopies
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by most recent
                    .map(copy => (
                        <PastCopyCard key={copy.id} copy={copy} onReuse={handleReuseCopy} />
                    ))}
            </div>
        </div>
      )}
    </div>
  );
};