import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    User, Building, PenSquare, Save, ArrowLeft,
    Stethoscope, Upload, X, Phone, MapPin, Briefcase
} from 'lucide-react';
import '../styles/main.scss';

interface DoctorProfile {
    full_name: string;
    specialty: string;
    clinic_name: string;
    clinic_address: string;
    clinic_phone: string;
    signature: string | null;
}

export default function DoctorProfile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile>({
        full_name: '',
        specialty: '',
        clinic_name: '',
        clinic_address: '',
        clinic_phone: '',
        signature: null
    });
    const [notification, setNotification] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({
        show: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    specialty: data.specialty || '',
                    clinic_name: data.clinic_name || '',
                    clinic_address: data.clinic_address || '',
                    clinic_phone: data.clinic_phone || '',
                    signature: data.signature || null
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            showNotification('Ошибка загрузки профиля', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profile.full_name,
                    specialty: profile.specialty,
                    clinic_name: profile.clinic_name,
                    clinic_address: profile.clinic_address,
                    clinic_phone: profile.clinic_phone,
                    signature: profile.signature,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            showNotification('Профиль сохранен!');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Ошибка при сохранении', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showNotification('Файл слишком большой. Максимум 2MB', 'error');
            return;
        }

        if (!file.type.includes('image/')) {
            showNotification('Пожалуйста, загрузите изображение', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfile(prev => ({ ...prev, signature: reader.result as string }));
        };
        reader.readAsDataURL(file);
    };

    const clearSignature = () => {
        setProfile(prev => ({ ...prev, signature: null }));
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '60vh' }}>
                <div className="loader" />
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Уведомления */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Шапка */}
            <div className="profile-header">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-back"
                >
                    <ArrowLeft size={20} />
                    <span>Назад</span>
                </button>

                <h1>Профиль врача</h1>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    <Save size={20} />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>

            <div className="profile-content">
                {/* Левая колонка - Основная информация */}
                <div className="profile-card">
                    <h2>
                        <User size={20} />
                        Основная информация
                    </h2>

                    <div className="form-group">
                        <label>
                            <User size={16} />
                            ФИО врача
                        </label>
                        <input
                            type="text"
                            value={profile.full_name}
                            onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Иванов Иван Иванович"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Briefcase size={16} />
                            Специализация
                        </label>
                        <input
                            type="text"
                            value={profile.specialty}
                            onChange={(e) => setProfile(prev => ({ ...prev, specialty: e.target.value }))}
                            placeholder="Терапевт, кардиолог, хирург..."
                            className="form-input"
                        />
                    </div>
                </div>

                {/* Правая колонка - Информация о клинике */}
                <div className="profile-card">
                    <h2>
                        <Building size={20} />
                        Информация о клинике
                    </h2>

                    <div className="form-group">
                        <label>
                            <Building size={16} />
                            Название клиники
                        </label>
                        <input
                            type="text"
                            value={profile.clinic_name}
                            onChange={(e) => setProfile(prev => ({ ...prev, clinic_name: e.target.value }))}
                            placeholder="Городская больница №1"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <MapPin size={16} />
                            Адрес клиники
                        </label>
                        <input
                            type="text"
                            value={profile.clinic_address}
                            onChange={(e) => setProfile(prev => ({ ...prev, clinic_address: e.target.value }))}
                            placeholder="ул. Ленина, д. 10"
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Phone size={16} />
                            Телефон клиники
                        </label>
                        <input
                            type="tel"
                            value={profile.clinic_phone}
                            onChange={(e) => setProfile(prev => ({ ...prev, clinic_phone: e.target.value }))}
                            placeholder="+7 (123) 456-78-90"
                            className="form-input"
                        />
                    </div>
                </div>

                {/* Подпись врача */}
                <div className="profile-card signature-card">
                    <h2>
                        <PenSquare size={20} />
                        Подпись врача
                    </h2>

                    <div className="signature-area">
                        {profile.signature ? (
                            <div className="signature-preview">
                                <img src={profile.signature} alt="Подпись" />
                                <button
                                    onClick={clearSignature}
                                    className="btn-icon"
                                    title="Удалить подпись"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="signature-upload">
                                <input
                                    type="file"
                                    id="signature"
                                    accept="image/*"
                                    onChange={handleSignatureUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="signature" className="upload-label">
                                    <Upload size={32} />
                                    <span>Загрузить подпись</span>
                                    <small>PNG, JPG до 2MB</small>
                                </label>
                            </div>
                        )}
                    </div>

                    <p className="signature-note">
                        Подпись будет автоматически добавлена в PDF-документы
                    </p>
                </div>
            </div>
        </div>
    );
}