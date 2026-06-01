const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Expenses';

async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  // Fix any mangled newlines in the private key
  if (credentials.private_key) {
    credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function ensureHeader(sheets) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:E1`,
  });
  const first = res.data.values?.[0];
  if (!first || first[0] !== 'id') {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:E1`,
      valueInputOption: 'RAW',
      requestBody: { values: [['id', 'date', 'item', 'cat', 'amount']] },
    });
  }
}

function rowToObj(row) {
  return {
    id: row[0] || '',
    date: row[1] || '',
    item: row[2] || '',
    cat: row[3] || 'Other',
    amount: parseFloat(row[4]) || 0,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const sheets = await getSheets();
    await ensureHeader(sheets);

    // GET — return all rows
    if (req.method === 'GET') {
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:E`,
      });
      const data = (result.data.values || []).map(rowToObj).filter(r => r.date);
      return res.status(200).json(data);
    }

    // POST — append new row
    if (req.method === 'POST') {
      const b = req.body;
      const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A:E`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[id, b.date, b.item, b.cat, b.amount]] },
      });
      return res.status(201).json({ ...b, id });
    }

    // PUT — update by id
    if (req.method === 'PUT') {
      const b = req.body;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:E`,
      });
      const rows = result.data.values || [];
      const idx = rows.findIndex(r => r[0] === b.id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const sheetRow = idx + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${sheetRow}:E${sheetRow}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[b.id, b.date, b.item, b.cat, b.amount]] },
      });
      return res.status(200).json(b);
    }

    // DELETE — delete by id query param
    if (req.method === 'DELETE') {
      const { id } = req.query;
      const result = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A2:E`,
      });
      const rows = result.data.values || [];
      const idx = rows.findIndex(r => r[0] === id);
      if (idx === -1) return res.status(404).json({ error: 'Not found' });
      const sheetRow = idx + 2;
      const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const sheet = meta.data.sheets.find(s => s.properties.title === SHEET_NAME);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheet.properties.sheetId,
                dimension: 'ROWS',
                startIndex: sheetRow - 1,
                endIndex: sheetRow,
              },
            },
          }],
        },
      });
      return res.status(200).json({ deleted: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('API Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
