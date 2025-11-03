import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setIsLoading(false);
        return;
      }
      try {
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin, // FIX: Ensures confirmation link uses the correct site URL
                data: {
                    name: name
                }
            }
        });
        if (signUpError) throw signUpError;
        
        setSignupSuccess(true);

      } catch (err: any) {
        if (err.message.includes('For security purposes')) {
            setError('Você realizou muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.');
        } else if (err.message.includes('User already registered')) {
            setError('Este e-mail já está em uso. Tente fazer login.');
        } else if (err.message.includes('Password should be at least 6 characters')) {
            setError('A senha deve ter pelo menos 6 caracteres.');
        } else {
            console.error("Signup error:", err);
            setError('Ocorreu um erro ao criar a conta.');
        }
      }
    } else { // Login
      try {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (signInError) throw signInError;

      } catch (err: any) {
        if (err.message.includes('Email not confirmed')) {
            setError('Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.');
        } else if (err.message.includes('Invalid login credentials')) {
            setError('E-mail ou senha inválidos.');
        } else {
            setError('Ocorreu um erro ao fazer login.');
            console.error("Login error:", err);
        }
      }
    }
    setIsLoading(false);
  };
  
  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setSignupSuccess(false);
  };

  if (signupSuccess) {
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-md">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 text-primary mx-auto rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19h18M9 11l3 3m0 0l3-3m-3 3V3" /></svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">Verifique seu E-mail</h1>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                        Enviamos um link de confirmação para <strong>{email}</strong>. Por favor, clique no link para ativar sua conta.
                    </p>
                    <Button onClick={toggleMode} variant="secondary">Voltar para Login</Button>
                </div>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-primary bg-clip-text text-transparent">
            {mode === 'login' ? 'Bem-vindo(a) de volta!' : 'Crie sua Conta'}
          </h1>
          <p className="text-center text-light-text-secondary dark:text-dark-text-secondary mb-8">
            {mode === 'login' ? 'Faça login para turbinar seu marketing.' : 'Comece a gerar conteúdo com IA.'}
          </p>
          {error && <p className="bg-red-500/10 text-red-500 text-sm text-center p-3 rounded-lg mb-4">{error}</p>}
          <form onSubmit={handleAuthAction} className="space-y-6">
            {mode === 'signup' && (
              <Input
                id="name"
                label="Seu Nome"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                required
              />
            )}
            <Input
              id="email"
              label="Seu E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: maria.silva@email.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              label="Sua Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {mode === 'signup' && (
              <Input
                id="confirmPassword"
                label="Confirme sua Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            )}
            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? 'Processando...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
            </Button>
          </form>
          <p className="text-center text-sm mt-6">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button onClick={toggleMode} className="font-semibold text-primary hover:underline ml-2">
              {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};