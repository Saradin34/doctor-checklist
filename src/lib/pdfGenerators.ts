import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Регистрируем шрифты
pdfMake.vfs = pdfFonts.vfs;

interface ChecklistData {
    title: string;
    description: string | null;
    doctorName: string;
    doctorSpecialty: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhone: string;
    signature: string | null;
    items: { content: string }[];
}

export const generateChecklistPDF = (data: ChecklistData) => {
    const currentDate = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Создаем массив пунктов для таблицы
    const tableBody = [
        // Заголовки таблицы
        [
            { text: '№', style: 'tableHeader', alignment: 'center' },
            { text: 'Пункт', style: 'tableHeader' },
            { text: '✓', style: 'tableHeader', alignment: 'center' }
        ],
        // Данные
        ...data.items.map((item, index) => [
            { text: (index + 1).toString(), alignment: 'center' },
            item.content,
            { text: '☐', alignment: 'center', fontSize: 14 }
        ])
    ];

    // Формируем информацию о враче
    const doctorInfo = [];
    if (data.doctorName) {
        doctorInfo.push({ text: `👨‍⚕️ ${data.doctorName}`, fontSize: 11, margin: [0, 0, 0, 2] });
    }
    if (data.doctorSpecialty) {
        doctorInfo.push({ text: data.doctorSpecialty, fontSize: 10, color: '#666666', margin: [0, 0, 0, 2] });
    }

    // Формируем информацию о клинике
    const clinicInfo = [];
    if (data.clinicName) {
        clinicInfo.push({ text: `🏥 ${data.clinicName}`, fontSize: 11, margin: [0, 0, 0, 2] });
    }
    if (data.clinicAddress) {
        clinicInfo.push({ text: data.clinicAddress, fontSize: 10, color: '#666666', margin: [0, 0, 0, 2] });
    }
    if (data.clinicPhone) {
        clinicInfo.push({ text: `📞 ${data.clinicPhone}`, fontSize: 10, color: '#666666', margin: [0, 0, 0, 2] });
    }

    // Определение документа
    const docDefinition: any = {
        // Информация о документе
        info: {
            title: data.title,
            author: data.doctorName || 'Doctor Checklist',
            subject: 'Медицинский чек-лист',
            keywords: 'медицина, чек-лист, рекомендации',
        },

        // Заголовок документа
        header: (currentPage: number, pageCount: number) => {
            return {
                text: `Doctor Checklist • Страница ${currentPage} из ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                margin: [0, 10, 0, 0],
                color: '#999999'
            };
        },

        // Нижний колонтитул
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
            // Логотип и название
            {
                text: 'DOCTOR CHECKLIST',
                fontSize: 28,
                bold: true,
                color: '#2980b9',
                alignment: 'center',
                margin: [0, 20, 0, 10]
            },

            // Заголовок чек-листа
            {
                text: data.title,
                fontSize: 20,
                bold: true,
                alignment: 'center',
                margin: [0, 10, 0, 20],
                color: '#2c3e50'
            },

            // Информация о враче и клинике в две колонки
            {
                columns: [
                    {
                        width: '50%',
                        stack: doctorInfo.length > 0 ? doctorInfo : [{ text: 'Врач не указан', fontSize: 11, color: '#999999' }],
                        margin: [0, 0, 10, 15]
                    },
                    {
                        width: '50%',
                        stack: clinicInfo.length > 0 ? clinicInfo : [{ text: 'Клиника не указана', fontSize: 11, color: '#999999' }],
                        margin: [10, 0, 0, 15]
                    }
                ]
            },

            // Дата
            {
                text: `📅 ${currentDate}`,
                fontSize: 11,
                color: '#666666',
                margin: [0, 0, 0, 20]
            },

            // Разделительная линия
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 40,
                        y1: 0,
                        x2: 570,
                        y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#e0e0e0'
                    }
                ],
                margin: [0, 0, 0, 15]
            },

            // Описание (если есть)
            data.description ? {
                text: data.description,
                fontSize: 11,
                italics: true,
                color: '#7f8c8d',
                alignment: 'center',
                margin: [40, 0, 40, 20]
            } : null,

            // Заголовок таблицы
            {
                text: 'Рекомендации и назначения',
                fontSize: 14,
                bold: true,
                margin: [40, 10, 40, 10],
                color: '#34495e'
            },

            // Таблица с пунктами
            {
                table: {
                    headerRows: 1,
                    widths: ['10%', '80%', '10%'],
                    body: tableBody
                },
                layout: {
                    fillColor: (rowIndex: number) => {
                        if (rowIndex === 0) return '#2980b9';
                        return rowIndex % 2 === 0 ? '#f8f9fa' : null;
                    },
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#dddddd',
                    vLineColor: () => '#dddddd',
                    paddingLeft: () => 8,
                    paddingRight: () => 8,
                    paddingTop: () => 6,
                    paddingBottom: () => 6
                },
                margin: [40, 0, 40, 20]
            },

            // Статистика
            {
                text: `📊 Всего пунктов: ${data.items.length}`,
                fontSize: 10,
                margin: [40, 0, 40, 30],
                color: '#7f8c8d'
            },

            // Разделительная линия перед подписями
            {
                canvas: [
                    {
                        type: 'line',
                        x1: 40,
                        y1: 0,
                        x2: 570,
                        y2: 0,
                        lineWidth: 0.5,
                        lineColor: '#e0e0e0'
                    }
                ],
                margin: [0, 0, 0, 20]
            },

            // Подпись врача (если есть)
            data.signature ? {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: 'Подпись врача', alignment: 'center', fontSize: 10, color: '#666666', margin: [0, 0, 0, 5] },
                            { image: data.signature, width: 150, height: 50, alignment: 'center' }
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: 'Подпись пациента', alignment: 'center', fontSize: 10, color: '#666666', margin: [0, 0, 0, 5] },
                            { text: '_________________________', alignment: 'center', margin: [0, 20, 0, 5] }
                        ]
                    }
                ],
                margin: [40, 20, 40, 20]
            } : {
                columns: [
                    {
                        width: '*',
                        stack: [
                            { text: '_________________________', alignment: 'center', margin: [0, 0, 0, 5] },
                            { text: 'Подпись врача', alignment: 'center', fontSize: 10, color: '#666666' }
                        ]
                    },
                    {
                        width: '*',
                        stack: [
                            { text: '_________________________', alignment: 'center', margin: [0, 0, 0, 5] },
                            { text: 'Подпись пациента', alignment: 'center', fontSize: 10, color: '#666666' }
                        ]
                    }
                ],
                margin: [40, 20, 40, 20]
            }
        ],

        // Стили по умолчанию
        defaultStyle: {
            font: 'Roboto',
            fontSize: 10
        },

        // Настройки страницы
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],

        // Стили для переиспользования
        styles: {
            tableHeader: {
                fontSize: 11,
                bold: true,
                color: '#ffffff'
            }
        }
    };

    // Удаляем null значения из content
    docDefinition.content = docDefinition.content.filter((item: any) => item !== null);

    // Генерируем PDF
    pdfMake.createPdf(docDefinition).download(`checklist-${Date.now()}.pdf`);
};