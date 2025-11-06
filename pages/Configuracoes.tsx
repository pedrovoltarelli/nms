import React, { useContext, useState } from 'react';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { AppContext } from './Dashboard';
import { supabase } from '../services/supabase';

export const Configuracoes: React.FC = () => {
    const context = useContext(AppContext);
    const [name, setName] = useState(context?.user.name || '');
    const [email, setEmail] = useState(context?.user.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [feedback, setFeedback] = useState({ message: '', type: '' });


    if (!context) return null;
    
    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(false);
        setFeedback({ message: '', type: '' });

        if (name.trim() === '') {
            setFeedback({ message: 'O nome não pode ficar em branco.', type: 'error' });
            return;
        }

        try {
            // Update name in profiles table if it has changed
            if (name !== context.user.name) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ full_name: name })
                    .eq('id', context.user.id);
                if (profileError) throw profileError;

                // Update local context state
                context.onUpdateUser({ ...context.user, name });
            }

            // Update password if provided
            if (newPassword) {
                if (newPassword.length < 6) {
                    setFeedback({ message: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'error' });
                    return;
                }
                const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
                if (passwordError) throw passwordError;
            }
            
            setFeedback({ message: 'Salvo com Sucesso!', type: 'success' });
            setIsSaved(true);
            setNewPassword('');
            setTimeout(() => {
                setIsSaved(false);
                setFeedback({ message: '', type: '' });
            }, 3000);

        } catch(error: any) {
            console.error("Error updating profile:", error);
            let message = "Ocorreu um erro ao atualizar o perfil. Por favor, tente novamente.";
            if (error && error.message) {
                // More user-friendly messages for common Supabase errors
                if (error.message.includes('password should be different')) {
                    message = 'A nova senha deve ser diferente da senha anterior.';
                } else if (error.message.includes('For security purposes, you need to re-authenticate')) {
                    message = 'Por segurança, você precisa fazer login novamente para alterar sua senha.';
                } else if (error.message.includes('check constraint')) { // RLS or other constraint error
                    message = 'Não foi possível salvar as alterações. Verifique suas permissões.';
                } else {
                    message = error.message; // Use the original message for other errors
                }
            }
            setFeedback({ message: `Erro: ${message}`, type: 'error' });
        }

    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
           // In Supabase, deleting a user is a protected, server-side action.
           // You would typically call a custom Edge Function to do this securely.
           // For this client-side example, we'll inform the user and log them out.
           alert('A exclusão de conta deve ser configurada no servidor (via Edge Functions) por segurança. Por favor, entre em contato com o suporte.');
           context.logout();
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageTitle title="Configurações" subtitle="Gerencie suas informações e preferências." />
            
            {feedback.message && (
                <div className={`p-3 rounded-lg text-center text-sm ${feedback.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {feedback.message}
                </div>
            )}

            <Card>
                <form onSubmit={handleSaveChanges} className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-3">Perfil</h3>
                    <Input label="Nome" id="name" value={name} onChange={e => setName(e.target.value)} required />
                    <Input label="E-mail" id="email" type="email" value={email} disabled />
                    <Input label="Nova Senha" id="new-password" type="password" placeholder="Deixe em branco para não alterar" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <div className="pt-2">
                        <Button type="submit" variant={isSaved ? 'success' : 'primary'} disabled={isSaved}>
                            {isSaved ? 'Salvo!' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card>
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-semibold border-b border-light-border dark:border-dark-border pb-3 text-red-500">Zona de Perigo</h3>
                    <div>
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2">
                            Excluir sua conta removerá permanentemente todos os seus dados.
                        </p>
                        <Button variant="danger" onClick={handleDeleteAccount}>Excluir Conta</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};