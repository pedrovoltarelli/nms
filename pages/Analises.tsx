
import React from 'react';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';

export const Analises: React.FC = () => {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <PageTitle title="Análises e Métricas" subtitle="Acompanhe o desempenho do seu conteúdo e entenda sua audiência." />

            <Card>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Funcionalidade em Breve</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto">
                        Em breve, esta área trará gráficos e métricas para você analisar o alcance, engajamento e conversão de suas publicações, ajudando a otimizar sua estratégia de conteúdo.
                    </p>
                </div>
            </Card>
        </div>
    );
};
