import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import {
    Stethoscope, Mail, Lock, LogIn, UserPlus,
    AlertCircle, CheckCircle, Eye, EyeOff,
    ArrowRight, Sparkles
} from 'lucide-react'
import '../styles/main.scss'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')
    const [isLogin, setIsLogin] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setMessageType('error')
            setMessage(error.message)
        } else {
            setMessageType('success')
            setMessage('Успешный вход! Перенаправляем...')
            setTimeout(() => navigate('/dashboard'), 1500)
        }
        setLoading(false)
    }

    const handleSignUp = async () => {
        if (!email || !password) {
            setMessageType('error')
            setMessage('Заполните все поля')
            return
        }

        if (password.length < 6) {
            setMessageType('error')
            setMessage('Пароль должен быть не менее 6 символов')
            return
        }

        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        })

        if (error) {
            setMessageType('error')
            setMessage(error.message)
        } else {
            setMessageType('success')
            setMessage('✨ Проверьте почту для подтверждения регистрации!')
            setTimeout(() => setIsLogin(true), 3000)
        }
        setLoading(false)
    }

    return (
        <div className="login-page">
            {/* Декоративные элементы фона */}
            <div className="login-background">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <div className="login-container">
                {/* Левая колонка с брендингом */}
                <div className="login-brand">
                    <div className="brand-content">
                        <div className="brand-icon">
                            <Stethoscope size={48} />
                        </div>
                        <h1 className="brand-title">Doctor Checklist</h1>
                        <p className="brand-description">
                            Простой конструктор чек-листов для врачей. Создавайте красивые памятки для пациентов за 5 минут.
                        </p>
                        <div className="brand-features">
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>Drag-and-drop конструктор</span>
                            </div>
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>Генерация PDF</span>
                            </div>
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>Публичные ссылки для пациентов</span>
                            </div>
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>Адаптивный дизайн</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая колонка с формой */}
                <div className="login-form-container">
                    <div className="form-card">
                        {/* Заголовок формы */}
                        <div className="form-header">
                            <h2>{isLogin ? 'С возвращением!' : 'Создайте аккаунт'}</h2>
                            <p>
                                {isLogin
                                    ? 'Войдите в свой аккаунт чтобы продолжить'
                                    : 'Зарегистрируйтесь и начните создавать чек-листы'}
                            </p>
                        </div>

                        {/* Сообщение об ошибке/успехе */}
                        {message && (
                            <div className={`message ${messageType}`}>
                                {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                <span>{message}</span>
                            </div>
                        )}

                        {/* Форма */}
                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email">
                                    <Mail size={18} />
                                    Email
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="doctor@hospital.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    <Lock size={18} />
                                    Пароль
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="input-hint">
                                        Минимум 6 символов
                                    </p>
                                )}
                            </div>

                            {isLogin && (
                                <div className="forgot-password">
                                    <button type="button" className="link-button">
                                        Забыли пароль?
                                    </button>
                                </div>
                            )}

                            <div className="form-actions">
                                {isLogin ? (
                                    <>
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-large"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="loader-small" />
                                            ) : (
                                                <>
                                                    <LogIn size={20} />
                                                    Войти
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(false)}
                                            className="btn btn-outline btn-large"
                                            disabled={loading}
                                        >
                                            <UserPlus size={20} />
                                            Создать аккаунт
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSignUp}
                                            className="btn btn-primary btn-large"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="loader-small" />
                                            ) : (
                                                <>
                                                    <UserPlus size={20} />
                                                    Зарегистрироваться
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(true)}
                                            className="btn btn-outline btn-large"
                                            disabled={loading}
                                        >
                                            <ArrowRight size={20} />
                                            Уже есть аккаунт
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>

                        {/* Дополнительная информация */}
                        <div className="form-footer">
                            <p className="terms">
                                Продолжая, вы соглашаетесь с{' '}
                                <button type="button" className="link-button">
                                    условиями использования
                                </button>
                                {' '}и{' '}
                                <button type="button" className="link-button">
                                    политикой конфиденциальности
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}