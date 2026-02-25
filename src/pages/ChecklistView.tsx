import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    ArrowLeft, Printer, CheckSquare,
    Stethoscope, Share2, Download
} from 'lucide-react';
import '../styles/main.scss';

interface ChecklistItem {
    id: number;
    content: string;
    is_checked: boolean;
    order: number;
}

export default function ChecklistView() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [doctorName, setDoctorName] = useState('');
    const [clinicName, setClinicName] = useState('');

    useEffect(() => {
        fetchChecklist();
    }, [id]);

    const fetchChecklist = async () => {
        try {
            const { data: checklist, error: checklistError } = await supabase
                .from('checklists')
                .select('*, profiles(full_name, clinic_name)')
                .eq('id', id)
                .single();

            if (checklistError) throw checklistError;

            setTitle(checklist.title);
            setDescription(checklist.description || '');
            setDoctorName(checklist.profiles?.full_name || '');
            setClinicName(checklist.profiles?.clinic_name || '');

            const { data: items, error: itemsError } = await supabase
                .from('checklist_items')
                .select('*')
                .eq('checklist_id', id)
                .order('order', { ascending: true });

            if (itemsError) throw itemsError;
            setItems(items || []);
        } catch (error) {
            console.error('Error fetching checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleItem = (itemId: number) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        ));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Ссылка скопирована!');
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="loader" />
            </div>
        );
    }

    return (
        <div className="view-container">
            {/* Навигационная панель */}
            <nav className="view-nav">
                <div className="nav-content">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon">
                            <Stethoscope size={24} />
                        </div>
                        <span className="logo-text">Doctor Checklist</span>
                    </Link>

                    <div className="nav-actions">
                        <button
                            onClick={handleShare}
                            className="nav-btn"
                            title="Поделиться"
                        >
                            <Share2 size={20} />
                            <span className="btn-text">Поделиться</span>
                        </button>

                        <button
                            onClick={handlePrint}
                            className="nav-btn nav-btn-primary"
                            title="Распечатать"
                        >
                            <Printer size={20} />
                            <span className="btn-text">Распечатать</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Основной контент */}
            <div className="view-content">
                {/* Кнопка назад */}
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    <span>Вернуться на главную</span>
                </Link>

                {/* Карточка чек-листа */}
                <div className="checklist-card">
                    {/* Шапка карточки */}
                    <div className="checklist-header">
                        <div className="header-badge">
                            <span className="badge">Чек-лист пациента</span>
                        </div>

                        <h1 className="checklist-title">{title}</h1>

                        {(doctorName || clinicName) && (
                            <div className="doctor-info">
                                {doctorName && (
                                    <div className="info-item">
                                        <span className="info-label">Врач:</span>
                                        <span className="info-value">{doctorName}</span>
                                    </div>
                                )}
                                {clinicName && (
                                    <div className="info-item">
                                        <span className="info-label">Клиника:</span>
                                        <span className="info-value">{clinicName}</span>
                                    </div>
                                )}
                                <div className="info-item">
                                    <span className="info-label">Дата:</span>
                                    <span className="info-value">
                    {new Date().toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                  </span>
                                </div>
                            </div>
                        )}

                        {description && (
                            <div className="checklist-description">
                                <p>{description}</p>
                            </div>
                        )}
                    </div>

                    {/* Список пунктов */}
                    <div className="checklist-items">
                        <h2 className="items-title">Рекомендации:</h2>

                        <div className="items-list">
                            {items.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`item ${item.is_checked ? 'checked' : ''}`}
                                    onClick={() => toggleItem(item.id)}
                                >
                                    <div className="item-checkbox">
                                        {item.is_checked && <CheckSquare size={18} />}
                                    </div>
                                    <span className="item-number">{index + 1}.</span>
                                    <span className="item-text">{item.content}</span>
                                </div>
                            ))}
                        </div>

                        {items.length === 0 && (
                            <div className="empty-state">
                                <p>В этом чек-листе пока нет пунктов</p>
                            </div>
                        )}
                    </div>

                    {/* Футер карточки */}
                    <div className="checklist-footer">
                        <p className="footer-note">
                            Сгенерировано в Doctor Checklist • {new Date().toLocaleDateString('ru-RU')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Стили для печати */}
            <style>{`
        @media print {
          .view-nav,
          .back-link {
            display: none !important;
          }
          
          .checklist-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          .item-checkbox {
            border: 2px solid #000 !important;
          }
          
          .badge {
            background: #f0f0f0 !important;
            color: #000 !important;
            border: 1px solid #ddd !important;
          }
        }
      `}</style>
        </div>
    );
}