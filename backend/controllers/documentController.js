const pool = require('../db');



const getDocumentsByCategoryId = async (req, res) => {
    const queryMap = {
        Recibidos: `
            SELECT 
                id, nro, administrative, document_type, document_number, document_date, 
                deploy_date, sender AS sender_or_recipient, receiver, matter, observations, 
                category_id, user_id, created_at, 
                'reception' AS type 
            FROM receptions
        `,
        Enviados: `
            SELECT 
                id, nro, administrative, document_type, NULL AS document_number, document_date, 
                deploy_date, recipient AS sender_or_recipient, NULL AS receiver, matter, observations, 
                category_id, user_id, created_at, 
                'sended' AS type 
            FROM sended
        `,
        Default: `
            SELECT 
                id, nro, administrative, document_type, document_number, document_date, 
                deploy_date, sender AS sender_or_recipient, receiver, matter, observations, 
                category_id, user_id, created_at, 
                'reception' AS type 
            FROM receptions
            WHERE category_id = ?
    
            UNION ALL
    
            SELECT 
                id, nro, administrative, document_type, NULL AS document_number, document_date, 
                deploy_date, recipient AS sender_or_recipient, NULL AS receiver, matter, observations, 
                category_id, user_id, created_at, 
                'sended' AS type 
            FROM sended
            WHERE category_id = ?
        `
    };

    try {
        const { categoryId } = req.params;
        const [category] = await pool.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
        
        const selectedQuery = queryMap[category[0].name] || queryMap.Default;
        
        const [documents] = category[0].name === 'Recibidos' || category[0].name === 'Enviados'
            ? await pool.query(selectedQuery)
            : await pool.query(selectedQuery, [categoryId, categoryId]);
        res.json(documents);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
};

const getDocumentsByUserAndCategory = async (req, res) => {
    const { categoryId } = req.params;
    const { id } = req;
    try {
        const [documents] = await pool.query(`
            SELECT 
                id, nro, administrative, document_type, document_number, document_date, 
                deploy_date, sender AS sender_or_recipient, receiver, matter, observations, 
                category_id, user_id, created_at, 
                'reception' AS type 
            FROM receptions
            WHERE user_id = ? AND category_id = ?

            UNION ALL

            SELECT 
                id, nro, administrative, document_type, NULL AS document_number, document_date, 
                deploy_date, recipient AS sender_or_recipient, NULL AS receiver, matter, observations, 
                category_id, user_id, created_at, 
                'sended' AS type 
            FROM sended
            WHERE user_id = ? AND category_id = ?`, [id, categoryId, id, categoryId]);
        res.json(documents);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getDocumentsByCategoryId,
    getDocumentsByUserAndCategory
};