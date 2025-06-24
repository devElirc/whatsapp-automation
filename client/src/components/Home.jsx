import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Starfield from './Starfield';

function Home() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [status, setStatus] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !message) {
      setStatus('Please select a CSV file and enter a message template.');
      return;
    }

    const formData = new FormData();
    formData.append('csv', file);
    formData.append('message', message);

    try {
      const response = await axios.post('http://localhost:3000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus(response.data.message || 'Upload successful! Messages are being processed.');
    } catch (error) {
      setStatus('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <>
      <Starfield />
      <main className="container-fluid py-5 px-3 position-relative" style={{ zIndex: 1, width: '60%' }}>
        <div className="mx-300px bg-white bg-opacity-90 rounded p-5 shadow-lg  style={{ maxWidth: '70%' }}">
          <div className="mx-auto bg-white bg-opacity-90 rounded p-5 shadow-lg ">
            <header className="mb-5 text-center">
              <h1 className="text-success display-4 my-4">
                <i className="bi bi-whatsapp me-2"></i> WhatsApp Message Sender
              </h1>
              <nav className="d-flex justify-content-center gap-3 flex-nowrap my-10 w-100" style={{ minWidth: 0 }}>
                <button onClick={() => navigate('/verify')} className="btn btn-outline-dark btn-lg flex-fill">
                  Create Profile
                </button>
                <button className="btn btn-outline-primary btn-lg px-4 flex-fill">Dashboard</button>
                <button className="btn btn-outline-secondary btn-lg px-4 flex-fill">Accounts</button>
                <button className="btn btn-outline-warning btn-lg px-4 flex-fill">Campaigns</button>
              </nav>


            </header>

            <div className="row g-4 mb-5 text-center">
              <div className="col-md">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body bg-success text-white rounded-2">
                    <h5 className="card-title fs-4">Active Accounts</h5>
                    <p className="card-text fs-3 fw-bold">{accounts.length}</p>
                  </div>
                </div>
              </div>
              <div className="col-md">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body bg-info text-white rounded-2">
                    <h5 className="card-title fs-4">Messages Sent Today</h5>
                    <p className="card-text fs-3 fw-bold">100</p>
                  </div>
                </div>
              </div>
              <div className="col-md">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body bg-warning text-dark rounded-2">
                    <h5 className="card-title fs-4">Success Rate</h5>
                    <p className="card-text fs-3 fw-bold">95%</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mb-5">
              <h2 className="text-primary fs-2 mb-4">Connected Accounts</h2>
              <div className="table-responsive">
                <table className="table table-hover table-bordered align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th className="fs-5">Phone Number</th>
                      <th className="fs-5">Status</th>
                      <th className="fs-5">AdsPower Profile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((account, index) => (
                      <tr key={index}>
                        <td className="fs-6">{account.phone}</td>
                        <td className="fs-6">{account.status}</td>
                        <td className="fs-6">{account.profileId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-5">
              <h2 className="text-warning fs-2 mb-4">Campaigns</h2>
              <ul className="list-group">
                {campaigns.map(campaign => (
                  <li className="list-group-item d-flex justify-content-between align-items-center p-3 fs-5" key={campaign.id}>
                    {campaign.name}
                    <span className="badge bg-success rounded-pill px-3 py-2">
                      {campaign.status} – {campaign.sent} sent
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-danger fs-2 mb-4">Send Messages</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="csv" className="form-label fw-bold fs-5">Upload CSV (Name, Phone, Order ID, Custom):</label>
                  <input
                    type="file"
                    className="form-control form-control-lg"
                    id="csv"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-bold fs-5">Message Template:</label>
                  <textarea
                    id="message"
                    className="form-control form-control-lg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="6"
                    placeholder="e.g., Hello {name} Click: https://example.com"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-success w-100 py-3 fs-4">Start Sending</button>
              </form>
              {status && <div className="alert alert-info mt-4 fs-5">{status}</div>}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
