import React, { useState, useMemo, useContext } from 'react';
import { PlannedPost, PostType, ContentIdea } from '../types';
import { Card } from '../components/common/Card';
import { PageTitle } from '../components/common/PageTitle';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Select } from '../components/common/Select';
import { AppContext } from './Dashboard';

const postTypeColors: { [key in PostType]: string } = {
  [PostType.Post]: 'bg-blue-500',
  [PostType.Story]: 'bg-pink-500',
  [PostType.Reels]: 'bg-purple-500',
};

const PostModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (post: Omit<PlannedPost, 'id' | 'user_id'>) => void;
}> = ({ isOpen, onClose, date, onSave }) => {
  const context = useContext(AppContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PostType>(PostType.Post);
  const [linkedIdeaId, setLinkedIdeaId] = useState<string | undefined>();
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      type,
      linkedIdeaId,
      date: date.toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="text-lg font-semibold mb-4">Novo Post para {date.toLocaleDateString()}</h3>
          <div className="space-y-4">
            <Input id="post-title" label="Título" value={title} onChange={e => setTitle(e.target.value)} required />
            <Textarea id="post-description" label="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
            <Select id="post-type" label="Tipo de Conteúdo" value={type} onChange={e => setType(e.target.value as PostType)} options={Object.values(PostType)} />
            {context && context.contentIdeas.length > 0 && (
                <Select id="linked-idea" label="Lincar Ideia Salva (Opcional)" value={linkedIdeaId} onChange={e => setLinkedIdeaId(e.target.value)}>
                    <option value="">Nenhuma</option>
                    {context.contentIdeas.map(idea => (
                        <option key={idea.id} value={idea.id}>{idea.title}</option>
                    ))}
                </Select>
            )}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export const Planejamento: React.FC = () => {
  const context = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [month, year, firstDay, daysInMonth]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSavePost = (post: Omit<PlannedPost, 'id' | 'user_id'>) => {
    if (context) {
        context.addPlannedPost(post);
    }
  };

  const postsByDate = useMemo(() => {
    if (!context) return {};
    return context.plannedPosts.reduce((acc, post) => {
      (acc[post.date] = acc[post.date] || []).push(post);
      return acc;
    }, {} as { [key: string]: PlannedPost[] });
  }, [context?.plannedPosts]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-8">
      <PageTitle title="Planejamento de Conteúdo" subtitle="Organize suas publicações em um calendário interativo." />
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="secondary" onClick={() => changeMonth(-1)}>&lt;</Button>
            <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long' })} {year}</h2>
            <Button variant="secondary" onClick={() => changeMonth(1)}>&gt;</Button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekdays.map(day => <div key={day} className="text-center font-medium text-sm text-light-text-secondary dark:text-dark-text-secondary p-2">{day}</div>)}
            {calendarDays.map((day, index) => (
              <div key={index} className="border border-light-border dark:border-dark-border h-32 p-2 flex flex-col relative group cursor-pointer" onClick={() => day && handleDateClick(day)}>
                {day ? (
                  <>
                    <span className="font-medium text-sm">{day.getDate()}</span>
                    <div className="mt-1 space-y-1 overflow-y-auto">
                        {postsByDate[day.toISOString().split('T')[0]]?.map(post => (
                           <div key={post.id} className={`${postTypeColors[post.type]} text-white text-xs p-1 rounded truncate`} title={post.title}>{post.title}</div>
                        ))}
                    </div>
                    <button className="absolute bottom-2 right-2 w-6 h-6 bg-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">+</button>
                  </>
                ) : <div />}
              </div>
            ))}
          </div>
        </div>
      </Card>
      {selectedDate && <PostModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} date={selectedDate} onSave={handleSavePost} />}
    </div>
  );
};