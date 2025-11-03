export interface User {
  id: string;
  name: string;
  email: string;
}

export type Theme = 'light' | 'dark';

export enum ToneOfVoice {
  Profissional = 'Profissional',
  Divertido = 'Divertido',
  Emocional = 'Emocional',
  Persuasivo = 'Persuasivo',
  Informativo = 'Informativo',
}

export enum CopyType {
  Anuncio = 'Anúncio para redes sociais',
  PaginaVendas = 'Página de Vendas',
  PostInstagram = 'Post para Instagram',
  Email = 'E-mail Marketing',
  Titulo = 'Título Chamativo',
}

export interface GeneratedCopy {
  id: string;
  prompt: {
    productName: string;
    description: string;
    targetAudience: string;
    tone: ToneOfVoice;
    type: CopyType;
  };
  result: string;
  createdAt: string;
  user_id?: string; // To associate with a user
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  user_id?: string; // To associate with a user
}

export enum PostType {
  Post = 'Post',
  Story = 'Story',
  Reels = 'Reels'
}

export interface PlannedPost {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: PostType;
  linkedIdeaId?: string;
  user_id?: string; // To associate with a user
}