import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    restrictToVerticalAxis,
    restrictToParentElement
} from '@dnd-kit/modifiers';
import SortableItem from '../components/SortableItem';
import { generateChecklistPDF } from '../lib/pdfGenerators';
import {
    Save, ArrowLeft, Plus, FileDown, Share2,
    Eye, EyeOff, Sparkles, AlertCircle, Check,
    X, Edit2, GripVertical, Trash2
} from 'lucide-react';
import '../styles/main.scss';

interface ChecklistItem {
    id: number;
    content: string;
    order: number;
    is_checked: boolean;
}

export default function ChecklistEditor() {
    const { id } = useParams<{ id: string }>(); // Типизируем параметры
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [newItemText, setNewItemText] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
        show: false,
        message: '',
        type: 'success'
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (id) {
            fetchChecklist();
        }
    }, [id]);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const fetchChecklist = async () => {
        if (!id) return;

        try {
            const { data: checklist, error: checklistError } = await supabase
                .from('checklists')
                .select('*')
                .eq('id', id)
                .single();

            if (checklistError) throw checklistError;

            setTitle(checklist.title);
            setDescription(checklist.description || '');

            const { data: items, error: itemsError } = await supabase
                .from('checklist_items')
                .select('*')
                .eq('checklist_id', id)
                .order('order', { ascending: true });

            if (itemsError) throw itemsError;

            setItems(items || []);
        } catch (error) {
            console.error('Error fetching checklist:', error);
            showNotification('Ошибка загрузки чек-листа', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                updateItemsOrder(newItems);
                return newItems;
            });
        }
    };

    const updateItemsOrder = async (updatedItems: ChecklistItem[]) => {
        try {
            for (let i = 0; i < updatedItems.length; i++) {
                await supabase
                    .from('checklist_items')
                    .update({ order: i })
                    .eq('id', updatedItems[i].id);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    const addItem = async () => {
        if (!newItemText.trim() || !id) return;

        try {
            const { data, error } = await supabase
                .from('checklist_items')
                .insert([
                    {
                        checklist_id: parseInt(id),
                        content: newItemText,
                        order: items.length,
                        is_checked: false
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            setItems([...items, data]);
            setNewItemText('');
            showNotification('Пункт добавлен');
        } catch (error) {
            console.error('Error adding item:', error);
            showNotification('Ошибка при добавлении пункта', 'error');
        }
    };

    const updateItem = async (itemId: number, content: string) => {
        try {
            await supabase
                .from('checklist_items')
                .update({ content })
                .eq('id', itemId);

            setItems(items.map(item =>
                item.id === itemId ? { ...item, content } : item
            ));
        } catch (error) {
            console.error('Error updating item:', error);
            showNotification('Ошибка при обновлении пункта', 'error');
        }
    };

    const deleteItem = async (itemId: number) => {
        try {
            await supabase
                .from('checklist_items')
                .delete()
                .eq('id', itemId);

            setItems(items.filter(item => item.id !== itemId));
            showNotification('Пункт удален');
        } catch (error) {
            console.error('Error deleting item:', error);
            showNotification('Ошибка при удалении пункта', 'error');
        }
    };

    const saveChecklist = async () => {
        if (!id) return;

        setSaving(true);
        try {
            await supabase
                .from('checklists')
                .update({
                    title,
                    description,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            showNotification('Сохранено!');
        } catch (error) {
            console.error('Error saving checklist:', error);
            showNotification('Ошибка при сохранении', 'error');
        } finally {
            setSaving(false);
        }
    };

    const downloadPDF = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            generateChecklistPDF({
                title,
                description,
                doctorName: profile?.full_name || '',
                doctorSpecialty: profile?.specialty || '',
                clinicName: profile?.clinic_name || '',
                clinicAddress: profile?.clinic_address || '',
                clinicPhone: profile?.clinic_phone || '',
                signature: profile?.signature || null,
                items: items.map(item => ({ content: item.content }))
            });
            showNotification('PDF создан');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification('Ошибка при создании PDF', 'error');
        }
    };

    const copyShareLink = () => {
        if (!id) return;

        const link = `${window.location.origin}/view/${id}`;
        navigator.clipboard.writeText(link);
        showNotification('Ссылка скопирована!');
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="loader" />
            </div>
        );
    }

    return (
        <div className="editor-container">
            {/* Уведомления */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Шапка с градиентом */}
            <div className="editor-header">
                <div className="header-content">
                    <div className="header-top">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-back"
                        >
                            <ArrowLeft size={20} />
                            <span>Назад</span>
                        </button>
                        <div className="header-badge">
                            <Sparkles size={16} />
                            <span>Редактор чек-листов</span>
                        </div>
                    </div>

                    <h1 className="header-title">{title || 'Новый чек-лист'}</h1>
                    <p className="header-description">{description || 'Начните добавлять пункты...'}</p>
                </div>
            </div>

            {/* Панель инструментов */}
            <div className="toolbar">
                <div className="toolbar-group">
                    <button
                        onClick={saveChecklist}
                        disabled={saving}
                        className="btn btn-primary"
                        title="Сохранить"
                    >
                        <Save size={20} />
                        <span className="btn-text">Сохранить</span>
                    </button>

                    <button
                        onClick={downloadPDF}
                        className="btn btn-success"
                        title="Скачать PDF"
                    >
                        <FileDown size={20} />
                        <span className="btn-text">PDF</span>
                    </button>

                    <button
                        onClick={copyShareLink}
                        className="btn btn-secondary"
                        title="Поделиться"
                    >
                        <Share2 size={20} />
                        <span className="btn-text">Поделиться</span>
                    </button>
                </div>

                <div className="toolbar-group">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`btn ${showPreview ? 'btn-active' : 'btn-outline'}`}
                        title={showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}
                    >
                        {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                        <span className="btn-text">Предпросмотр</span>
                    </button>
                </div>
            </div>

            {/* Основной контент */}
            <div className={`editor-content ${showPreview ? 'with-preview' : ''}`}>
                {/* Левая колонка - редактор */}
                <div className="editor-main">
                    {/* Основная информация */}
                    <div className="card">
                        <h3 className="card-title">
                            <Edit2 size={18} />
                            Основная информация
                        </h3>

                        <div className="form-group">
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="form-input"
                                placeholder="Название чек-листа"
                            />
                        </div>

                        <div className="form-group">
              <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Описание чек-листа (необязательно)"
                  rows={3}
              />
                        </div>
                    </div>

                    {/* Пункты чек-листа */}
                    <div className="card">
                        <h3 className="card-title">
                            <GripVertical size={18} />
                            Пункты чек-листа
                        </h3>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                        >
                            <SortableContext
                                items={items.map(item => item.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="items-list">
                                    {items.map((item) => (
                                        <SortableItem
                                            key={item.id}
                                            id={item.id}
                                            content={item.content}
                                            onUpdate={updateItem}
                                            onDelete={deleteItem}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {items.length === 0 && (
                            <div className="empty-state">
                                <AlertCircle size={48} />
                                <h4>Пока нет пунктов</h4>
                                <p>Добавьте первый пункт ниже</p>
                            </div>
                        )}

                        {/* Добавление нового пункта */}
                        <div className="add-item-form">
                            <input
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addItem()}
                                className="form-input"
                                placeholder="Введите новый пункт..."
                            />
                            <button
                                onClick={addItem}
                                className="btn btn-primary"
                                disabled={!newItemText.trim()}
                            >
                                <Plus size={20} />
                                <span>Добавить</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Правая колонка - предпросмотр */}
                {showPreview && (
                    <div className="editor-preview">
                        <div className="preview-card">
                            <h3 className="preview-title">Предпросмотр</h3>

                            <div className="preview-content">
                                <div className="preview-header">
                                    <h2>{title || 'Без названия'}</h2>
                                    {description && <p>{description}</p>}
                                </div>

                                <div className="preview-items">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="preview-item">
                                            <div className="preview-checkbox" />
                                            <span>{index + 1}. {item.content}</span>
                                        </div>
                                    ))}

                                    {items.length === 0 && (
                                        <p className="preview-empty">Нет пунктов для отображения</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}