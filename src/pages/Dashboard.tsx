import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
    FileText, Plus, FolderOpen,
    Calendar, Clock, TrendingUp, Sparkles,
    Search
} from 'lucide-react'
import '../styles/main.scss' // Импортируем SCSS

interface Checklist {
    id: number
    title: string
    description: string | null
    specialty_tag: string | null
    is_published: boolean
    created_at: string
    updated_at: string
}

export default function Dashboard() {
    const [checklists, setChecklists] = useState<Checklist[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        fetchChecklists()
    }, [])

    const fetchChecklists = async () => {
        try {
            const { data, error } = await supabase
                .from('checklists')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) throw error
            setChecklists(data || [])
        } catch (error) {
            console.error('Error fetching checklists:', error)
        } finally {
            setLoading(false)
        }
    }

    const createNewChecklist = async () => {
        try {
            const { data: userData } = await supabase.auth.getUser()
            if (!userData.user) return

            const { data, error } = await supabase
                .from('checklists')
                .insert([
                    {
                        title: 'Новый чек-лист',
                        description: 'Начните добавлять пункты...',
                        user_id: userData.user.id
                    }
                ])
                .select()
                .single()

            if (error) throw error
            navigate(`/checklist/${data.id}`)
        } catch (error) {
            console.error('Error creating checklist:', error)
        }
    }

    const stats = {
        total: checklists.length,
        published: checklists.filter(c => c.is_published).length,
        drafts: checklists.filter(c => !c.is_published).length
    }

    const filteredChecklists = checklists.filter(checklist =>
        checklist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        checklist.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="animate-spin" style={{
                    width: '3rem',
                    height: '3rem',
                    border: '3px solid #e5e7eb',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%'
                }} />
            </div>
        )
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            {/* Шапка */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 className="text-gradient">Мои чек-листы</h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                        Управляйте своими чек-листами для пациентов
                    </p>
                </div>
                <button
                    onClick={createNewChecklist}
                    className="btn btn-primary"
                >
                    <Plus className="btn-icon" />
                    Создать чек-лист
                </button>
            </div>

            {/* Статистика */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div className="stat-card stat-card-blue">
                    <div className="stat-card-icon">
                        <FolderOpen size={24} />
                    </div>
                    <div className="stat-card-value">{stats.total}</div>
                    <div className="stat-card-label">Всего чек-листов</div>
                    <div className="stat-card-footer">
                        {stats.total > 0 ? `${stats.total} активных` : 'Нет чек-листов'}
                    </div>
                </div>

                <div className="stat-card stat-card-green">
                    <div className="stat-card-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-card-value">{stats.published}</div>
                    <div className="stat-card-label">Опубликовано</div>
                    <div className="stat-card-footer">
                        {stats.published > 0 ? 'Доступны пациентам' : 'Нет публикаций'}
                    </div>
                </div>

                <div className="stat-card stat-card-purple">
                    <div className="stat-card-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-card-value">{stats.drafts}</div>
                    <div className="stat-card-label">Черновики</div>
                    <div className="stat-card-footer">
                        {stats.drafts > 0 ? 'В работе' : 'Нет черновиков'}
                    </div>
                </div>
            </div>

            {/* Поиск */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                        width: '1.25rem',
                        height: '1.25rem'
                    }} />
                    <input
                        type="text"
                        placeholder="Поиск чек-листов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            paddingLeft: '3rem',
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '0.75rem',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            {/* Список чек-листов */}
            {filteredChecklists.length === 0 ? (
                <div className="card" style={{
                    textAlign: 'center',
                    padding: '4rem 2rem'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                        borderRadius: '50%',
                        marginBottom: '1.5rem'
                    }}>
                        <Sparkles size={48} style={{ color: '#3b82f6' }} />
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>Пока нет чек-листов</h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                        Создайте первый чек-лист для своих пациентов
                    </p>
                    <button
                        onClick={createNewChecklist}
                        className="btn btn-primary"
                    >
                        <Plus className="btn-icon" />
                        Создать чек-лист
                    </button>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredChecklists.map(checklist => (
                        <div
                            key={checklist.id}
                            className="card"
                            onClick={() => navigate(`/checklist/${checklist.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="card-header">
                                <div style={{
                                    padding: '0.5rem',
                                    background: checklist.is_published ? '#d1fae5' : '#f3e8ff',
                                    borderRadius: '0.5rem'
                                }}>
                                    <FileText style={{
                                        width: '1.5rem',
                                        height: '1.5rem',
                                        color: checklist.is_published ? '#059669' : '#8b5cf6'
                                    }} />
                                </div>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    background: checklist.is_published ? '#d1fae5' : '#f3e8ff',
                                    color: checklist.is_published ? '#059669' : '#8b5cf6',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {checklist.is_published ? 'Опубликовано' : 'Черновик'}
                                </span>
                            </div>

                            <h3 className="card-title">{checklist.title}</h3>
                            <p className="card-text">
                                {checklist.description || 'Нет описания'}
                            </p>

                            <div className="card-footer">
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#6b7280',
                                    fontSize: '0.875rem'
                                }}>
                                    <Calendar size={16} />
                                    {new Date(checklist.created_at).toLocaleDateString('ru-RU')}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}