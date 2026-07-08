import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, FileText, Save, X, Camera, Sparkles } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

interface ProfileProps {
  user: any;
  onUpdateUser: (user: any) => void;
  onLogout?: () => void;
}

export default function Profile({ user, onUpdateUser, onLogout }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    bio: user?.user_metadata?.bio || ''
  });

  useEffect(() => {
    setFormData({
      name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      bio: user?.user_metadata?.bio || ''
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedMetadata = {
        full_name: formData.name,
        phone: formData.phone,
        bio: formData.bio
      };

      let updatedUser = { ...user };
      
      if (hasSupabaseConfig) {
        const { data, error } = await supabase.auth.updateUser({
          data: updatedMetadata
        });
        
        if (error) throw error;
        if (data.user) {
          updatedUser = data.user;
        }
      } else {
        // Mock update for local mode
        updatedUser = {
          ...user,
          user_metadata: {
            ...user?.user_metadata,
            ...updatedMetadata
          }
        };
      }

      onUpdateUser(updatedUser);
      setSuccessMessage('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || 'Ocorreu um erro ao atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full relative z-10">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mb-2">Meu Perfil</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Gerencie suas informações pessoais e preferências.</p>
      </div>

      {user?.id === 'guest' && (
        <div className="mb-6 p-6 glass bg-teal-500/10 border-teal-500/30 text-slate-900 dark:text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-teal-700 dark:text-teal-400 flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              Você é um Visitante
            </h3>
            <p className="text-sm opacity-80">
              Crie uma conta gratuita para não perder os seus lançamentos e acessar de qualquer dispositivo.
            </p>
          </div>
          <button 
            onClick={onLogout}
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-teal-500/20 whitespace-nowrap"
          >
            Criar Conta Grátis
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 glass bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-400 rounded-xl font-medium text-sm flex items-center justify-between">
          {successMessage}
          <button onClick={() => setSuccessMessage('')} className="text-teal-700 dark:text-teal-400 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 glass bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl font-medium text-sm flex items-center justify-between">
          {errorMessage}
          <button onClick={() => setErrorMessage('')} className="text-rose-700 dark:text-rose-400 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 sm:p-8 mb-6 border border-slate-900/10 dark:border-white/10"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-900/10 dark:border-white/10">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-teal-500/20">
              {formData.name.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg hover:scale-105 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{formData.email}</p>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-3 px-4 py-1.5 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled={true} // Email usually requires special flow to change
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-teal-500/50 opacity-70 cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">O e-mail não pode ser alterado por aqui.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Telefone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Biografia</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full glass-input rounded-xl py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-teal-500/50 disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-900/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
                    email: user?.email || '',
                    phone: user?.user_metadata?.phone || '',
                    bio: user?.user_metadata?.bio || ''
                  });
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-900/5 dark:hover:bg-white/5 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-teal-500/20 flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
