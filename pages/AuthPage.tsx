import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { supabase } from '../services/supabase';

type AuthMode = 'login' | 'signup';

const CheckIcon: React.FC<{className?: string}> = ({className}) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>);

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false); // New state for resending email
  const [resendFeedback, setResendFeedback] = useState<{message: string, type: string} | null>(null); // Feedback for resend action


  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSignupSuccess(false); // Reset signup success on new attempt
    setResendFeedback(null); // Clear resend feedback

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
                data: {
                    name: name
                }
            }
        });
        if (signUpError) throw signUpError;
        
        setSignupSuccess(true); // Set success state

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
            setError('Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada (e a pasta de spam!) e clique no link de confirmação para fazer login.');
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
  
  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    setResendFeedback(null);
    try {
        const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });
        if (resendError) throw resendError;
        setResendFeedback({ message: 'E-mail de verificação reenviado! Verifique sua caixa de entrada.', type: 'success' });
    } catch (err: any) {
        console.error("Resend email error:", err);
        let msg = 'Ocorreu um erro ao reenviar o e-mail.';
        if (err.message.includes('For security purposes')) {
            msg = 'Você realizou muitas tentativas. Por favor, aguarde um minuto antes de tentar novamente.';
        }
        setResendFeedback({ message: msg, type: 'error' });
    } finally {
        setIsResendingEmail(false);
        setTimeout(() => setResendFeedback(null), 5000); // Clear feedback after 5 seconds
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setSignupSuccess(false); // Reset signup success when toggling mode
    setResendFeedback(null); // Clear resend feedback
  };

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
          
          {signupSuccess ? (
            <div className="bg-green-500/10 text-green-400 text-sm font-medium p-4 rounded-lg mb-6 text-center">
              <p className="font-semibold">Cadastro realizado com sucesso!</p>
              <p className="mt-2">Por favor, verifique seu e-mail (<span className="font-bold">{email}</span>) para confirmar sua conta antes de fazer login. <br/>(Verifique também a pasta de spam/lixo eletrônico!)</p>
              
              {resendFeedback && (
                <p className={`mt-4 text-sm font-medium ${resendFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {resendFeedback.message}
                </p>
              )}

              <div className="flex flex-col gap-3 mt-4">
                <Button variant="secondary" onClick={handleResendEmail} disabled={isResendingEmail}>
                  {isResendingEmail ? 'Reenviando...' : (resendFeedback?.type === 'success' ? <><CheckIcon className="w-4 h-4"/> E-mail enviado!</> : 'Reenviar E-mail de Verificação')}
                </Button>
                <Button variant="primary" onClick={() => setMode('login')} className="mt-2">
                  Fazer Login
                </Button>
              </div>
            </div>
          ) : (
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
          )}

          {!signupSuccess && ( // Only show toggle if not on success screen
            <p className="text-center text-sm mt-6">
              {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button onClick={toggleMode} className="font-semibold text-primary hover:underline ml-2">
                {mode === 'login' ? 'Cadastre-se' : 'Faça Login'}
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};