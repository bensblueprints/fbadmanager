import { Router } from 'express';
import axios from 'axios';

const router = Router();
const BASE = 'https://graph.facebook.com/v21.0';

// Runtime-configurable tokens (seeded from .env)
let runtimeToken = process.env.META_ACCESS_TOKEN || '';
let runtimeAppId = process.env.META_APP_ID || '';

function token() {
  return runtimeToken;
}

// GET current settings (masked token for security)
router.get('/settings', (req, res) => {
  res.json({
    access_token: runtimeToken ? `${runtimeToken.slice(0, 10)}...${runtimeToken.slice(-4)}` : '',
    access_token_set: !!runtimeToken,
    app_id: runtimeAppId,
  });
});

// POST update settings
router.post('/settings', (req, res) => {
  const { access_token, app_id } = req.body;
  if (access_token !== undefined) runtimeToken = access_token;
  if (app_id !== undefined) runtimeAppId = app_id;
  res.json({ success: true, access_token_set: !!runtimeToken, app_id: runtimeAppId });
});

function meta(path, params = {}) {
  return axios.get(`${BASE}${path}`, {
    params: { access_token: token(), ...params },
  });
}

function metaPost(path, data = {}) {
  return axios.post(`${BASE}${path}`, null, {
    params: { access_token: token(), ...data },
  });
}

// List ad accounts
router.get('/accounts', async (req, res) => {
  try {
    const { data } = await meta('/me/adaccounts', {
      fields: 'id,name,account_id,account_status,currency,timezone_name,amount_spent',
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// List campaigns for an account
router.get('/accounts/:id/campaigns', async (req, res) => {
  try {
    const { data } = await meta(`/act_${req.params.id}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,budget_remaining,created_time,updated_time',
      limit: 100,
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Create campaign
router.post('/accounts/:id/campaigns', async (req, res) => {
  try {
    const { name, objective, status, daily_budget, special_ad_categories } = req.body;
    const { data } = await metaPost(`/act_${req.params.id}/campaigns`, {
      name,
      objective: objective || 'OUTCOME_TRAFFIC',
      status: status || 'PAUSED',
      daily_budget: daily_budget || undefined,
      special_ad_categories: special_ad_categories ? JSON.stringify(special_ad_categories) : '[]',
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Get campaign details
router.get('/campaigns/:id', async (req, res) => {
  try {
    const { data } = await meta(`/${req.params.id}`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,budget_remaining,created_time,updated_time',
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Update campaign (pause/activate/edit)
router.post('/campaigns/:id', async (req, res) => {
  try {
    const { data } = await metaPost(`/${req.params.id}`, req.body);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// List ad sets for a campaign
router.get('/campaigns/:id/adsets', async (req, res) => {
  try {
    const { data } = await meta(`/${req.params.id}/adsets`, {
      fields: 'id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,start_time,end_time',
      limit: 100,
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Update ad set
router.post('/adsets/:id', async (req, res) => {
  try {
    const { data } = await metaPost(`/${req.params.id}`, req.body);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Account insights
router.get('/accounts/:id/insights', async (req, res) => {
  try {
    const { time_range, breakdowns, date_preset } = req.query;
    const params = {
      fields: 'spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,actions,cost_per_action_type',
    };
    if (time_range) params.time_range = time_range;
    if (date_preset) params.date_preset = date_preset;
    if (breakdowns) params.breakdowns = breakdowns;
    const { data } = await meta(`/act_${req.params.id}/insights`, params);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Campaign insights
router.get('/campaigns/:id/insights', async (req, res) => {
  try {
    const { time_range, breakdowns, date_preset } = req.query;
    const params = {
      fields: 'spend,impressions,clicks,ctr,cpc,cpm,reach,actions,cost_per_action_type',
    };
    if (time_range) params.time_range = time_range;
    if (date_preset) params.date_preset = date_preset;
    if (breakdowns) params.breakdowns = breakdowns;
    const { data } = await meta(`/${req.params.id}/insights`, params);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// List audiences
router.get('/accounts/:id/audiences', async (req, res) => {
  try {
    const { data } = await meta(`/act_${req.params.id}/customaudiences`, {
      fields: 'id,name,subtype,approximate_count_lower_bound,approximate_count_upper_bound,delivery_status,operation_status',
      limit: 100,
    });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

// Create audience
router.post('/accounts/:id/audiences', async (req, res) => {
  try {
    const { data } = await metaPost(`/act_${req.params.id}/customaudiences`, req.body);
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: e.message });
  }
});

export default router;
