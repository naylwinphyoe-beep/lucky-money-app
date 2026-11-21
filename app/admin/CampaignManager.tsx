
'use client';

import { useEffect, useState } from 'react';

type Campaign = {
  id: string;
  name: string;
  is_active: boolean;
  expires_at: string;
  max_draws: number;
  created_at: string;
};

type Prize = {
  id: string;
  campaign_id: string;
  amount: number;
  quantity: number;
  claimed: number;
  is_active: boolean;
};

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [maxDraws, setMaxDraws] = useState('30');

  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadCampaigns() {
    const res = await fetch('/api/admin/campaigns');
    const data = await res.json();

    if (res.ok) {
      setCampaigns(data.campaigns || []);
    } else {
      setMessage(data.error || 'Campaign စာရင်းရယူ၍မရပါ။');
    }
  }

  async function loadPrizes(campaignId: string) {
    if (!campaignId) {
      setPrizes([]);
      return;
    }

    const res = await fetch(
      `/api/admin/prizes?campaignId=${campaignId}`
    );

    const data = await res.json();

    if (res.ok) {
      setPrizes(data.prizes || []);
    } else {
      setMessage(data.error || 'Prize စာရင်းရယူ၍မရပါ။');
    }
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    loadPrizes(selectedCampaign);
  }, [selectedCampaign]);

  async function createCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          expiresAt: new Date(expiresAt).toISOString(),
          maxDraws: Number(maxDraws)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Campaign ဖန်တီး၍မရပါ။');
        return;
      }

      setMessage('Campaign အသစ် ဖန်တီးပြီးပါပြီ။');
      setName('');
      setExpiresAt('');
      setMaxDraws('30');

      await loadCampaigns();
      setSelectedCampaign(data.campaign.id);
    } catch {
      setMessage('ချိတ်ဆက်မှု အမှားရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  }

  async function createPrize(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedCampaign) {
      setMessage('Campaign တစ်ခု ရွေးချယ်ပါ။');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign,
          amount: Number(amount),
          quantity: Number(quantity)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Prize ထည့်၍မရပါ။');
        return;
      }

      setMessage('Prize အသစ် ထည့်သွင်းပြီးပါပြီ။');
      setAmount('');
      setQuantity('');

      await loadPrizes(selectedCampaign);
    } catch {
      setMessage('ချိတ်ဆက်မှု အမှားရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  }

  async function updateCampaignStatus(
    campaign: Campaign,
    isActive: boolean
  ) {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaign.id,
          is_active: isActive
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Campaign Status ပြောင်း၍မရပါ။');
        return;
      }

      setMessage(
        isActive
          ? 'Campaign ကို Active လုပ်ပြီးပါပြီ။'
          : 'Campaign ကို Inactive လုပ်ပြီးပါပြီ။'
      );

      await loadCampaigns();
    } catch {
      setMessage('ချိတ်ဆက်မှု အမှားရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  }

  async function updatePrizeStatus(
    prize: Prize,
    isActive: boolean
  ) {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/prizes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prize.id,
          is_active: isActive
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Prize Status ပြောင်း၍မရပါ။');
        return;
      }

      setMessage(
        isActive
          ? 'Prize ကို Active လုပ်ပြီးပါပြီ။'
          : 'Prize ကို Inactive လုပ်ပြီးပါပြီ။'
      );

      await loadPrizes(selectedCampaign);
    } catch {
      setMessage('ချိတ်ဆက်မှု အမှားရှိနေပါသည်။');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="panel">
        <h2 className="gold">Campaign Management</h2>

        <form onSubmit={createCampaign}>
          <p>Campaign Name</p>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Lucky Money November 2026"
            required
          />

          <p>Expiry Date & Time</p>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            required
          />

          <p>Maximum Draws</p>
          <input
            type="number"
            min="1"
            value={maxDraws}
            onChange={e => setMaxDraws(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Create Campaign'}
          </button>
        </form>

        <hr />

        <h3>Campaign History</h3>

        {campaigns.length === 0 ? (
          <p>Campaign မရှိသေးပါ။</p>
        ) : (
          campaigns.map(c => (
            <div
              key={c.id}
              style={{
                border: '1px solid #69402d',
                padding: 12,
                marginBottom: 10,
                borderRadius: 8
              }}
            >
              <h3>{c.name}</h3>
              <p>
                Status: {c.is_active ? 'Active' : 'Inactive'}
              </p>
              <p>Max Draws: {c.max_draws}</p>
              <p>
                Expiry: {new Date(c.expires_at).toLocaleString()}
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  updateCampaignStatus(c, !c.is_active)
                }
              >
                {c.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <h2 className="gold">Prize Management</h2>

        <p>Select Campaign</p>
        <select
          value={selectedCampaign}
          onChange={e => setSelectedCampaign(e.target.value)}
        >
          <option value="">-- Campaign ရွေးချယ်ပါ --</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <hr />

        <h3>Add New Prize</h3>

        <form onSubmit={createPrize}>
          <p>Prize Amount (Ks)</p>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="ဥပမာ - 5000"
            required
          />

          <p>Quantity</p>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="ဥပမာ - 10"
            required
          />

          <button
            type="submit"
            disabled={loading || !selectedCampaign}
          >
            {loading ? 'Saving...' : 'Add Prize'}
          </button>
        </form>

        <hr />

        <h3>Prize List</h3>

        {!selectedCampaign ? (
          <p>Campaign တစ်ခု ရွေးချယ်ပါ။</p>
        ) : prizes.length === 0 ? (
          <p>Prize မရှိသေးပါ။</p>
        ) : (
          prizes.map(p => (
            <div
              key={p.id}
              style={{
                border: '1px solid #69402d',
                padding: 12,
                marginBottom: 10,
                borderRadius: 8
              }}
            >
              <h3>{p.amount.toLocaleString('en-US')} Ks</h3>
              <p>Quantity: {p.quantity}</p>
              <p>Claimed: {p.claimed}</p>
              <p>Remaining: {p.quantity - p.claimed}</p>
              <p>Status: {p.is_active ? 'Active' : 'Inactive'}</p>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  updatePrizeStatus(p, !p.is_active)
                }
              >
                {p.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))
        )}
      </div>

      {message && (
        <div className="panel">
          <p>{message}</p>
        </div>
      )}
    </>
  );
}
