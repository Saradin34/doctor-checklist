/*
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Регистрируем шрифты (уже включают кириллицу)
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface ChecklistData {
    title: string;
    description: string | null;
    doctorName: string;
    clinicName: string;
    items: { content: string }[];
}

export const generateChecklistPDF = (data: ChecklistData) => {
    const currentDate = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Подготавливаем содержимое PDF
    const docDefinition = {
        // Информация о документе
        info: {
            title: data.title,
            author: 'Doctor Checklist',
            subject: 'Медицинский чек-лист',
            keywords: 'медицина, чек-лист, рекомендации',
        },

        // Метаданные
        header: (currentPage: number, pageCount: number) => {
            return {
                text: `Doctor Checklist • Страница ${currentPage} из ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 10, 0, 0],
                color: '#999999'
            };
        },

        footer: (currentPage: number, pageCount: number) => {
            return {
                text: `Сгенерировано ${currentDate}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 0, 0, 10],
                color: '#999999'
            };
        },

        // Содержимое документа
        content: [
            // Заголовок
            {
                text: 'DOCTOR CHECKLIST',
                style: 'logo',
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },

            // Название чек-листа
            {
                text: data.title,
                style: 'header',
                alignment: 'center',
                margin: [0, 10, 0, 20]
            },

            // Информация о враче
            {
                columns: [
                    {
                        width: '*',
                        text: [
                            { text: 'Врач: ', style: 'label' },
                            { text: data.doctorName || 'Не указан', style: 'value' }
                        ],
                        margin: [0, 0, 0, 5]
                    },
                    {
                        width: '*',
                        text: [
                            { text: 'Клиника: ', style: 'label' },
                            { text: data.clinicName || 'Не указана', style: 'value' }
                        ],
                        margin: [0, 0, 0, 5]
                    }
                ],
                margin: [0, 0, 0, 10]
            },

            // Дата
            {
                text: [
                    { text: 'Дата: ', style: 'label' },
                    { text: currentDate, style: 'value' }
                ],
                margin: [0, 0, 0, 20]
            },

            // Описание (если есть)
            data.description ? {
                text: data.description,
                style: 'description',
                margin: [0, 0, 0, 20]
            } : null,

            // Заголовок таблицы
            {
                text: 'Рекомендации и назначения:',
                style: 'subheader',
                margin: [0, 0, 0, 10]
            },

            // Таблица с пунктами
            {
                table: {
                    headerRows: 1,
                    widths: ['10%', '80%', '10%'],
                    body: [
                        // Заголовки
                        [
                            { text: '№', style: 'tableHeader', alignment: 'center' },
                            { text: 'Пункт', style: 'tableHeader' },
                            { text: '✓', style: 'tableHeader', alignment: 'center' }
                        ],
                        // Данные
                        ...data.items.map((item, index) => [
                            { text: (index + 1).toString(), alignment: 'center' },
                            item.content,
                            { text: '□', alignment: 'center', fontSize: 14 }
                        ])
                    ]
                },
                layout: {
                    fillColor: (rowIndex: number) => {
                        return rowIndex === 0 ? '#2980b9' : (rowIndex % 2 === 0 ? '#f8f9fa' : null);
                    },
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#dddddd',
                    vLineColor: () => '#dddddd',
                    paddingLeft: () => 8,
                    paddingRight: () => 8,
                    paddingTop: () => 6,
                    paddingBottom: () => 6
                }
            },

            // Статистика
            {
                text: [
                    { text: `\n\nВсего пунктов: `, style: 'label' },
                    { text: `${data.items.length}`, style: 'value' }
                ],
                margin: [0, 20, 0, 0]
            },

            // Место для подписи
            {
                text: '\n\n\n',
                margin: [0, 20, 0, 0]
            },
            {
                columns: [
                    {
                        width: '50%',
                        text: '_________________________',
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    },
                    {
                        width: '50%',
                        text: '_________________________',
                        alignment: 'center',
                        margin: [0, 0, 0, 5]
                    }
                ]
            },
            {
                columns: [
                    {
                        width: '50%',
                        text: 'Подпись врача',
                        alignment: 'center',
                        fontSize: 10,
                        color: '#666666'
                    },
                    {
                        width: '50%',
                        text: 'Подпись пациента',
                        alignment: 'center',
                        fontSize: 10,
                        color: '#666666'
                    }
                ]
            }
        ],

        // Стили
        styles: {
            logo: {
                fontSize: 20,
                bold: true,
                color: '#2980b9'
            },
            header: {
                fontSize: 24,
                bold: true,
                color: '#2c3e50'
            },
            subheader: {
                fontSize: 16,
                bold: true,
                color: '#34495e'
            },
            label: {
                fontSize: 11,
                bold: true,
                color: '#7f8c8d'
            },
            value: {
                fontSize: 11,
                color: '#2c3e50'
            },
            description: {
                fontSize: 11,
                italics: true,
                color: '#7f8c8d'
            },
            tableHeader: {
                fontSize: 12,
                bold: true,
                color: '#ffffff'
            }
        },

        // Настройки страницы
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
            font: 'Roboto' // Roboto поддерживает кириллицу
        }
    };

    // Удаляем null значения из content
    docDefinition.content = docDefinition.content.filter(item => item !== null);

    // Генерируем и скачиваем PDF
    pdfMake.createPdf(docDefinition).download(`checklist-${Date.now()}.pdf`);
};*/
