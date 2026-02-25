import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChecklistEditor from './pages/ChecklistEditor';
import ChecklistView from './pages/ChecklistView';
import DoctorProfile from './pages/DoctorProfile';
import PrivateRoute from './components/PrivateRoute';
import { Stethoscope, LogOut, LayoutDashboard, User } from 'lucide-react';
import './styles/main.scss';

function AppContent() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div>
            {/* Навигация */}
            <nav style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        height: '4rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Link to="/" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textDecoration: 'none'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    transition: 'transform 0.3s ease'
                                }}>
                                    <Stethoscope style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                                </div>
                                <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                  Doctor Checklist
                </span>
                            </Link>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {user ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '2rem',
                                            height: '2rem',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            borderRadius: '9999px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '500',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            {user.email?.[0].toUpperCase()}
                                        </div>
                                        <span style={{ color: '#4b5563', display: 'none' }} className="desktop-only">
                      {user.email}
                    </span>
                                    </div>

                                    <Link
                                        to="/profile"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#4b5563',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            textDecoration: 'none'
                                        }}
                                        className="hover-bg"
                                    >
                                        <User size={18} />
                                        <span style={{ display: 'none' }} className="desktop-only">
                      Профиль
                    </span>
                                    </Link>

                                    <Link
                                        to="/dashboard"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#4b5563',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            textDecoration: 'none'
                                        }}
                                        className="hover-bg"
                                    >
                                        <LayoutDashboard size={18} />
                                        <span style={{ display: 'none' }} className="desktop-only">
                      Мои чек-листы
                    </span>
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            color: '#4b5563',
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}
                                        className="hover-bg"
                                    >
                                        <LogOut size={18} />
                                        <span style={{ display: 'none' }} className="desktop-only">
                      Выйти
                    </span>
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link
                                        to="/login"
                                        style={{
                                            color: '#4b5563',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            textDecoration: 'none'
                                        }}
                                        className="hover-bg"
                                    >
                                        Войти
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem' }}
                                    >
                                        Регистрация
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Основной контент */}
            <main className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
                <Routes>
                    <Route path="/" element={
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.75rem',
                                background: 'linear-gradient(135deg, #dbeafe, #ede9fe)',
                                borderRadius: '1rem',
                                marginBottom: '1.5rem'
                            }}>
                                <Stethoscope style={{ width: '4rem', height: '4rem', color: '#3b82f6' }} />
                            </div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                <span className="text-gradient">
                  Создавайте чек-листы
                  <br />для пациентов за 5 минут
                </span>
                            </h1>
                            <p style={{
                                fontSize: '1.125rem',
                                color: '#6b7280',
                                marginBottom: '2rem',
                                maxWidth: '600px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                                Простой конструктор для врачей. Красивые памятки, которые улучшают комплаенс и экономят ваше время.
                            </p>
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="btn btn-primary"
                                    style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
                                >
                                    <LayoutDashboard className="btn-icon" />
                                    Перейти к чек-листам
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="btn btn-primary"
                                    style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}
                                >
                                    <Stethoscope className="btn-icon" />
                                    Начать бесплатно
                                </Link>
                            )}
                        </div>
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <DoctorProfile />
                        </PrivateRoute>
                    } />
                    <Route path="/checklist/:id" element={
                        <PrivateRoute>
                            <ChecklistEditor />
                        </PrivateRoute>
                    } />
                    <Route path="/view/:id" element={<ChecklistView />} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;