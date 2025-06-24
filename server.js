const cors = require('cors');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'client/build')));

const accounts = [
  { phone: '+1234567890', status: 'Online', profileId: 'adspower_123' },
];

app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

app.post('/api/upload', upload.single('csv'), async (req, res) => {
  try {

    console.log("logsss");
    if (!req.file || !req.body.message) {
      return res.status(400).json({ error: 'CSV file and message are required.' });
    }

    const formData = new FormData();
    formData.append('data', fs.createReadStream(req.file.path), req.file.originalname); // IMPORTANT: 'data' matches n8n
    formData.append('message', req.body.message);

    await axios.post('http://localhost:5678/webhook-test/upload-csv', formData, {
      headers: formData.getHeaders(),
    });

    fs.unlinkSync(req.file.path); // cleanup
    res.json({ message: 'Upload successful! Messages are being processed.' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000; // Can change to 3001 or another port if needed
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});