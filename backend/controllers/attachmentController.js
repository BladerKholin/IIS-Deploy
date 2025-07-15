const pool = require("../db");


const libre = require('libreoffice-convert');


// Get all attachments for a specific action
const getAttachmentsByActionId = async (req, res) => {
    try {
        const { actionId, tableName } = req.params;
        const [attachments] = await pool.query("SELECT id, filename, uploaded_at FROM attachments WHERE record_id = ? AND table_name = ?", [actionId, tableName]);
        res.json(attachments);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Error fetching attachments' });
    }
};

// Download attachment by id
const downloadAttachmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT filename, data FROM attachments WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = rows[0];
        const {default: mime} = await import('mime');
        const fileType = mime.getType(file.filename);
        res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        res.setHeader('Content-Type', fileType);
        res.send(file.data);
    } catch (err) {
        console.error('Error downloading file:', err.message);
        res.status(500).json({ error: 'Error downloading file' });
    }
};

// Showcase attachment by id
const showcaseAttachmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT filename, data FROM attachments WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'File not found' });
        }

        const file = rows[0];
        const {default: mime} = await import('mime');
        const fileType = mime.getType(file.filename);
        const officeTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

        if (officeTypes.includes(fileType)) {
            // Convert office-like file to PDF
            libre.convert(file.data, '.pdf', undefined   , (err, done) => {
                if (err) {
                    console.log(`Error converting file: ${err}`);
                    return res.status(500).send('Error converting file');
                }

                res.setHeader('Content-Disposition', `attachment; filename="${file.filename}.pdf"`);
                res.setHeader('Content-Type', 'application/pdf');
                res.send(done);
            });
        } else {
            // Send the original file
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
            res.setHeader('Content-Type', fileType);
            res.send(file.data);
        }
    } catch (err) {
        console.error('Error downloading file:', err.message);
        res.status(500).json({ error: 'Error downloading file' });
    }
};

module.exports = {
    getAttachmentsByActionId,
    downloadAttachmentById,
    showcaseAttachmentById
};