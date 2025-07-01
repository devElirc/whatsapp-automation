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

    const response = await axios.post('http://144.172.114.124:5678/webhook-test/phone', { phone });
    // const response = await axios.post('http://localhost:5678/webhook-test/phone', { phone });
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
  const { phone, pin } = req.body;
  pins[phone] = pin;
  console.log(`Saved PIN for ${phone}: ${pin}`);
  res.sendStatus(200);
});

app.get('/api/get-pin', (req, res) => {
  const phone = req.query.phone;
  if (pins[phone]) {
    res.json({ phone, pin: pins[phone] });
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

    // const results = [];
    // fs.createReadStream(req.file.path)
    //   .pipe(csv())
    //   .on('data', (row) => results.push(row.phone))
    //   .on('end', () => {
    //     res.json({ phones: results });
    //   });

    const formData = new FormData();
    formData.append('data', fs.createReadStream(req.file.path), req.file.originalname); // IMPORTANT: 'data' matches n8n
    formData.append('message', req.body.message);

    await axios.post('http://144.172.114.124:5678/webhook-test/upload-csv', formData, {
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

// setInterval(async () => {
//   try {
//     const response = await axios.get('http://localhost:5678/webhook-test/get-profiles');

//     console.log('Fetched profiles:', response.data);

//     // You can process the data or store it somewhere
//     // e.g., save to file, memory, database, etc.
//   } catch (error) {
//     console.error("Error calling n8n:", error.message);
//   }
// }, 3000);


const PORT = process.env.PORT || 3000; // Can change to 3001 or another port if needed
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});