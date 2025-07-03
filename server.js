const cors = require('cors');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON request bodies

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'client/build')));

const accounts = [
  { phone: '+1234567890', status: 'Online', profileId: 'adspower_123' },
];

const pins = {}; // temporary store: { [phone]: pin }
const flags = {}; // temporary store: { [phone]: flag }
let userIdList = [];
app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

// Endpoint to handle phone verification
app.post("/api/phone", async (req, res) => {
  const { phone } = req.body;
  const phoneNumber = req.body.phone;
  pins[phoneNumber] = '';

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {

     const response = await axios.post('http://144.172.102.134:5678/webhook/phone', { phone });
    //  const response = await axios.post('http://localhost:5678/webhook-test/phone', { phone });

    const data = response.data;

    // Return n8n webhook response back to frontend
    res.json(data);
  } catch (error) {
    console.error("Error calling n8n:", error.message);
    res.status(500).json({ error: "Failed to generate code" });
  }
});


app.post("/api/receive-profile", async (req, res) => {
  const { profiles } = req.body;

  if (!profiles) {
    return res.status(400).json({ error: 'Profile not found' });
  }

  try {
    // Extract user_id list from the profiles array
    userIdList = profiles.map(profile => profile.user_id);

    // Return the list of user_ids
    res.json({ user_ids: userIdList });
    console.log("user_list", userIdList);
  } catch (error) {
    console.error("Error processing profiles:", error.message);
    res.status(500).json({ error: "Failed to process profiles" });
  }
});



app.post('/api/pin', (req, res) => {
  const { phone, flag, pin } = req.body;
  flags[phone] = flag;
  pins[phone] = pin;
  console.log(`Saved PIN for ${phone}: ${pins[phone]} : ${flags[phone]}`);
  res.sendStatus(200);
});

app.get('/api/get-pin', (req, res) => {

  const phone = req.query.phone;
  console.log(`get pin : ${phone}`);
  if (pins[phone]) {
  console.log(`get pin for ${phone}: ${ pins[phone]} : ${flags[phone]}`);

    res.json({ phone, pin: pins[phone], flag: flags[phone] });
  } else {
    res.status(404).json({ error: "PIN not found yet" });
  }
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

    await axios.post('http://144.172.102.134:5678/webhook/upload-csv', formData, {
    // await axios.post('http://localhost:5678/webhook-test/upload-csv', formData, {
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

const PORT = process.env.PORT || 4000; // Can change to 3001 or another port if needed
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});