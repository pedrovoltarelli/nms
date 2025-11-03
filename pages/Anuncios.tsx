import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { Button } from '../components/common/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Icons
const DollarSignIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m6-6H6" /></svg>);
const TrendingUpIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const CashIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>);
const MetaIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className={className}><path fill="currentColor" d="M232.54,82.43,184,16h-56l16.89,30.22a56,56,0,0,1,10.23,19.82A61.64,61.64,0,0,1,156.4,78.2c-5.49,11.39-14.5,21.14-26.69,28.21-12.2,7.07-26.13,10.61-41.52,10.61a100.1,100.1,0,0,1-34.19-6.43l-16.89,30.22v56l52.66,74.05a12,12,0,0,0,20.12-1.63l12.3-21.89,12.3,21.89a12,12,0,0,0,20.12,1.63L232.54,173.57Z" /></svg>);
const GoogleIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.223,0-9.655-3.657-11.127-8.581l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.902,36.631,44,30.825,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>);

const MetricCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => {
    return (
      <Card className="p-6">
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

const PlatformCard: React.FC<{
  name: string;
  description: string;
  icon: React.ElementType;
  onConnect: () => void;
  isConnecting: boolean;
}> = ({ name, description, icon: Icon, onConnect, isConnecting }) => {
    return (
        <div className="flex items-center justify-between p-4 rounded-lg bg-light-bg dark:bg-dark-bg">
            <div className="flex items-center gap-4">
                <Icon className="w-10 h-10 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">{name}</h4>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{description}</p>
                </div>
            </div>
            <Button onClick={onConnect} disabled={isConnecting}>
                {isConnecting ? 'Conectando...' : 'Conectar'}
            </Button>
        </div>
    );
};

const SuccessMessage: React.FC = () => (
    <div className="bg-green-500/10 text-green-400 text-sm font-medium p-3 rounded-lg flex items-center gap-3 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        <span>Conta conectada com sucesso! Seus dados de campanha agora estão sincronizados.</span>
    </div>
);

const roiData = [
    { name: 'Semana 1', ROI: 210 },
    { name: 'Semana 2', ROI: 280 },
    { name: 'Semana 3', ROI: 250 },
    { name: 'Semana 4', ROI: 340 },
];

const RoiChart: React.FC = () => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.5}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8' }} stroke="#334155" />
                <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: '#94A3B8' }} stroke="#334155" />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1E293B',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#F1F5F9' }}
                    itemStyle={{ color: '#A78BFA' }}
                />
                <Bar dataKey="ROI" fill="url(#colorRoi)" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export const Anuncios: React.FC = () => {
    const [isConnected, setIsConnected] = useLocalStorage<boolean>('nms-ads-connected', false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const handleConnect = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
        }, 2000);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
    };

    if (isConnected) {
        return (
            <div className="space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <PageTitle title="Anúncios e Desempenho" subtitle="Análise em tempo real de suas campanhas." />
                    <Button variant="danger-outline" size="sm" onClick={handleDisconnect}>Desconectar</Button>
                </div>

                {showSuccess && <SuccessMessage />}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard title="Custo Total" value="R$ 1.234" icon={DollarSignIcon} />
                    <MetricCard title="Receita Gerada" value="R$ 5.432" icon={CashIcon} />
                    <MetricCard title="ROI" value="340%" icon={TrendingUpIcon} />
                </div>
                
                <Card>
                   <div className="p-6">
                       <h3 className="text-xl font-semibold mb-2">Retorno Sobre Investimento (ROI) Semanal</h3>
                       <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Desempenho das últimas 4 semanas.</p>
                       <RoiChart />
                   </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <PageTitle title="Conectar Contas de Anúncios" subtitle="Importe dados de suas plataformas para análise de desempenho." />
            <Card>
                <div className="p-6 space-y-4">
                    <PlatformCard 
                        name="Meta Ads"
                        description="Conecte sua conta do Facebook e Instagram Ads."
                        icon={MetaIcon}
                        onConnect={handleConnect}
                        isConnecting={isConnecting}
                    />
                    <PlatformCard 
                        name="Google Ads"
                        description="Conecte sua conta do Google e YouTube Ads."
                        icon={GoogleIcon}
                        onConnect={handleConnect}
                        isConnecting={isConnecting}
                    />
                </div>
            </Card>
        </div>
    );
};