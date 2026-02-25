/*
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ChecklistData {
    title: string;
    description: string | null;
    doctorName: string;
    clinicName: string;
    items: { content: string }[];
}

export const generateChecklistPDF = (data: ChecklistData) => {
    const doc = new jsPDF();

    // Функция для правильного отображения кириллицы
    const ru = (text: string): string => {
        if (!text) return '';

        // Просто возвращаем текст как есть - jsPDF должен сам справиться
        // если нет, можно добавить декодирование
        try {
            return decodeURIComponent(escape(text));
        } catch {
            return text;
        }
    };

    // --- ЦВЕТА ---
    const primaryColor = [41, 128, 185]; // Синий
    const lightGray = [245, 245, 245];
    const darkGray = [100, 100, 100];

    // --- ШАПКА С ГРАДИЕНТОМ (имитация) ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('📋', 20, 25);
    doc.text('Doctor Checklist', 35, 25);

    // --- ОСНОВНОЙ КОНТЕНТ ---
    let yPos = 55;

    // Заголовок чек-листа
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(ru(data.title), 20, yPos);
    yPos += 10;

    // Информация о враче (в две колонки)
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.roundedRect(20, yPos - 5, 170, 20, 3, 3, 'F');

    doc.setFontSize(10);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFont('helvetica', 'normal');

    if (data.doctorName) {
        doc.text('👨‍⚕️ Врач:', 25, yPos + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(ru(data.doctorName), 50, yPos + 2);
    }

    if (data.clinicName) {
        doc.setFont('helvetica', 'normal');
        doc.text('🏥 Клиника:', 110, yPos + 2);
        doc.setFont('helvetica', 'bold');
        doc.text(ru(data.clinicName), 135, yPos + 2);
    }

    yPos += 25;

    // Дата
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(`📅 ${new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, 20, yPos);
    yPos += 10;

    // Описание
    if (data.description) {
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'italic');
        const splitDesc = doc.splitTextToSize(ru(data.description), 170);
        doc.text(splitDesc, 20, yPos);
        yPos += splitDesc.length * 6 + 5;
    }

    // Таблица с пунктами
    const tableData = data.items.map((item, index) => [
        (index + 1).toString(),
        ru(item.content),
        '□'
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['#', ru('Пункт'), '']],
        body: tableData,
        theme: 'plain',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 11,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 8
        },
        bodyStyles: {
            fontSize: 10,
            cellPadding: 6,
            lineColor: [220, 220, 220],
            lineWidth: 0.5
        },
        columnStyles: {
            0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 20, halign: 'center', fontSize: 14 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
            // Нижний колонтитул
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.setFont('helvetica', 'normal');
                doc.text(
                    `Страница ${i} из ${pageCount} • Сгенерировано в Doctor Checklist`,
                    20,
                    doc.internal.pageSize.getHeight() - 10
                );
            }
        }
    });

    // Добавляем место для подписи в конце
    const finalY = (doc as any).lastAutoTable.finalY || yPos;

    if (finalY < doc.internal.pageSize.getHeight() - 40) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);

        // Линия для подписи врача
        doc.line(20, finalY + 20, 100, finalY + 20);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Подпись врача', 20, finalY + 25);

        // Линия для подписи пациента
        doc.line(120, finalY + 20, 190, finalY + 20);
        doc.text('Подпись пациента', 120, finalY + 25);
    }

    // Сохраняем PDF
    const fileName = `checklist-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
};*/
