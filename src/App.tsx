import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-800">
                                    Doctor Checklist
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button className="text-gray-600 hover:text-gray-900">
                                    Войти
                                </button>
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    Регистрация
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Routes>
                        <Route path="/" element={
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    Создавайте чек-листы для пациентов за 5 минут
                                </h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    Простой конструктор для врачей. Красивые памятки, которые улучшают комплаенс.
                                </p>
                                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700">
                                    Начать бесплатно
                                </button>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;