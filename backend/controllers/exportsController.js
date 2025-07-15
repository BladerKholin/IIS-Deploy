const pool = require("../db");

const exportToPdf = async (req, res) => {
    try {
        const eventId = req.params.id;

        const { jsPDF } = await import('jspdf');
        const [eventRows] = await pool.query('SELECT * FROM events WHERE id = ?', [eventId]);
        const [actions] = await pool.query('SELECT * FROM actions WHERE event_id = ?', [eventId]);

        const event = eventRows[0];
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Evento: ${event.title}`, 10, 20);
        doc.setFontSize(12);
        doc.text(`Responsable: ${event.responsible}`, 10, 30);
        doc.text(`Inicio: ${event.start_date}`, 10, 40);
        doc.text(`Final: ${event.end_date}`, 10, 50);
        doc.text(`Estatus: ${event.status}`, 10, 60);

        let y = 75;
        doc.setFontSize(13);
        doc.text("Acciones:", 10, y);
        y += 10;

        for (const [i, action] of actions.entries()) {
            if (y > 270) { doc.addPage(); y = 20; }

            doc.setFontSize(11);
            doc.text(`${i + 1}. ${action.title}`, 10, y); y += 7;
            doc.text(`   Responsable: ${action.responsible}`, 10, y); y += 7;
            doc.text(`   Registro: ${action.registry_date}`, 10, y); y += 7;
            doc.text(`   Fecha estimada de fin: ${action.estimated_date}`, 10, y); y += 7;
            doc.text(`   Descripción: ${action.description}`, 10, y); y += 7;

            // 🔍 Get attachments for this action
            const [actionAttachments] = await pool.query(
                'SELECT id, filename FROM attachments WHERE table_name = ? AND record_id = ?',
                ['actions', action.id]
            );

            if (actionAttachments.length > 0) {
                doc.text(`   Adjuntos:`, 10, y); y += 7;

                for (const att of actionAttachments) {
                    if (y > 270) { doc.addPage(); y = 20; }

                    const url = `${process.env.PUBLIC_API_URL || "http://localhost:5000"}/attachments/download/${att.id}`;
                    doc.setTextColor(0, 0, 255); // blue color for links
                    doc.textWithLink(`     • ${att.filename}`, 14, y, { url }); // indent with 14
                    doc.setTextColor(0, 0, 0); // reset color to black
                    y += 6;
                }
            }

            y += 5; // extra space before next action
        }

        // Attachments section
        

        const pdfBuffer = doc.output("arraybuffer");

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="event_${eventId}.pdf"`,
            'Content-Length': pdfBuffer.byteLength,
        });

        res.send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error("Error generating PDF:", error.message);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

// Export all events of a category to xlsx
const ExcelJS = require('exceljs');


const exportEventsToXlsx = async (req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();

        const legendSheet = workbook.addWorksheet("Leyenda");

        // Title
        const titleRow = legendSheet.addRow(["Leyenda"]);
        titleRow.font = { bold: true, size: 14 };
        legendSheet.mergeCells(`A1:B1`);
        legendSheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
        legendSheet.addRow([]); // Blank row

        // Legend entries: [Status Text, Description, Fill Color]
        const legendEntries = [
        ["Abierto", "Evento aún no resuelto.", "FFCCE5FF"],      // Green-ish
        ["En proceso", "Evento en seguimiento o ejecución.", "FFFFFF99"], // Yellow-ish
        ["Cerrado", "Evento finalizado.", "FFD9EAD3"],           // Red-ish
        ["Adjuntos", "Enlaces a documentos o archivos relacionados con cada acción.", "D3D3D3"],
        ["Fechas", "Mostradas en formato día/mes/año hora:minutos.", "D3D3D3"]
        ];

        // Set column widths
        legendSheet.getColumn(1).width = 20;
        legendSheet.getColumn(2).width = 70;

        // Add each row with styling
        legendEntries.forEach(([label, description, color]) => {
        const row = legendSheet.addRow([label, description]);
        row.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: color }
        };
        row.font = { bold: true };
        row.height = 20;
        });

        // Get the TIC department
        const [[ticDept]] = await pool.query('SELECT id FROM departments WHERE name = "TIC"');
        if (!ticDept) return res.status(404).json({ message: 'Departamento TIC no encontrado' });

        const [categories] = await pool.query('SELECT * FROM categories WHERE department_id = ?', [ticDept.id]);

        for (const category of categories) {
            const sheet = workbook.addWorksheet(category.name);

            // Define translated headers in Spanish
            sheet.columns = [
                { header: 'Título del Evento', key: 'eventTitle', width: 30 },
                { header: 'Responsable del Evento', key: 'eventResponsible', width: 25 },
                { header: 'Inicio', key: 'startDate', width: 20 },
                { header: 'Fin', key: 'endDate', width: 20 },
                { header: 'Título de la Acción', key: 'actionTitle', width: 30 },
                { header: 'Responsable de la Acción', key: 'actionResponsible', width: 25 },
                { header: 'Fecha de Registro', key: 'registryDate', width: 20 },
                { header: 'Fecha Estimada', key: 'estimatedDate', width: 20 },
                { header: 'Descripción', key: 'description', width: 40 },
                { header: 'Adjuntos (enlaces)', key: 'attachments', width: 50 }
            ];

            // Apply bold style to header row
            sheet.getRow(1).font = { bold: true };

            const [events] = await pool.query(
                'SELECT * FROM events WHERE category_id = ?',
                [category.id]
            );

            for (const event of events) {
                const [actions] = await pool.query('SELECT * FROM actions WHERE event_id = ?', [event.id]);

                for (const action of actions) {
                    const [attachments] = await pool.query(
                        'SELECT id, filename FROM attachments WHERE table_name = "actions" AND record_id = ?',
                        [action.id]
                    );

                    const baseURL = process.env.PUBLIC_API_URL || "http://localhost:3000";
                    const attachmentLinks = attachments.map(att => `${baseURL}/attachments/download/${att.id}`);

                    const row = sheet.addRow({
                        eventTitle: event.title,
                        eventResponsible: event.responsible,
                        startDate: event.start_date,
                        endDate: event.end_date,
                        actionTitle: action.title,
                        actionResponsible: action.responsible,
                        registryDate: action.registry_date,
                        estimatedDate: action.estimated_date,
                        description: action.description,
                        attachments: ''
                    });
                    row.getCell('startDate').numFmt = 'dd/mm/yyyy hh:mm';
                    row.getCell('endDate').numFmt = 'dd/mm/yyyy hh:mm';
                    row.getCell('registryDate').numFmt = 'dd/mm/yyyy hh:mm';
                    row.getCell('estimatedDate').numFmt = 'dd/mm/yyyy hh:mm';
                    // Apply background color based on event status
                    let fillColor;
                    switch (event.status) {
                        case 'abierto':
                            fillColor = 'FFCCE5FF'; // Light Blue
                            break;
                        case 'en proceso':
                            fillColor = 'FFFFFF99'; // Light Yellow
                            break;
                        case 'cerrado':
                            fillColor = 'FFD9EAD3'; // Light Green
                            break;
                        default:
                            fillColor = null;
                    }

                    if (fillColor) {
                        row.eachCell((cell) => {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: fillColor },
                            };
                        });
                    }

                    if (attachments.length > 0) {
                        for (const file of attachments) {
                        const downloadUrl = `${baseURL}/attachments/download/${file.id}`;
                        const attachmentRow = sheet.addRow(['', '', '', '', '','','','','', file.filename]);
                        attachmentRow.getCell('attachments').value = {
                            text: file.filename,
                            hyperlink: downloadUrl
                        };
                        attachmentRow.getCell('attachments').font = {
                            color: { argb: '0000FF' },
                            underline: true
                        };
                        styleRow(attachmentRow, 'attachment');
                        }
                    }

                }
            }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Eventos_TIC.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting Excel:', error.message);
        res.status(500).json({ error: 'No se pudo exportar el archivo Excel' });
    }
};

function styleRow(row, type) {
  if (type === 'normal') {
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  } else if (type === 'attachment') {
    row.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E3F2FD' } // Light blue background
      };
      cell.font = { italic: true };
    });
  }
}

module.exports = {
    exportToPdf,
    exportEventsToXlsx
};