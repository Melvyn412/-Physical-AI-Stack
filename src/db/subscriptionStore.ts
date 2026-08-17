import fs from 'fs';
import path from 'path';

export interface StoredSubscription {
  orderId: string;
  payerId?: string;
  payerEmail: string;
  payerName?: string;
  tier: 'developer' | 'pro' | 'team' | 'enterprise';
  billingCycle: 'monthly' | 'annual';
  status: 'CREATED' | 'APPROVED' | 'COMPLETED' | 'ACTIVE' | 'CANCELLED' | 'REFUNDED' | 'DENIED';
  amount: number;
  currency: string;
  licenseKey: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
  lastWebhookEvent?: string;
}

export interface WebhookLog {
  id: string;
  eventType: string;
  summary: string;
  verified: boolean;
  receivedAt: string;
  resourceId?: string;
  resourceType?: string;
  payloadExcerpt: any;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'subscriptions.json');
const LOGS_FILE = path.join(DATA_DIR, 'webhook_logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('[DB] Could not create data directory:', err);
  }
}

// In-memory caches backed by filesystem
let subscriptionsCache: Map<string, StoredSubscription> = new Map();
let webhookLogsCache: WebhookLog[] = [];

// Load initial data from disk
function loadFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const array: StoredSubscription[] = JSON.parse(data);
      subscriptionsCache = new Map(array.map(s => [s.orderId, s]));
    }
  } catch (err) {
    console.warn('[DB] Could not load subscriptions from disk:', err);
  }

  try {
    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      webhookLogsCache = JSON.parse(data);
    }
  } catch (err) {
    console.warn('[DB] Could not load webhook logs from disk:', err);
  }
}

function persistSubscriptions() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const array = Array.from(subscriptionsCache.values());
    fs.writeFileSync(DB_FILE, JSON.stringify(array, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist subscriptions to disk:', err);
  }
}

function persistLogs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Keep last 100 logs
    const trimmed = webhookLogsCache.slice(-100);
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DB] Failed to persist webhook logs to disk:', err);
  }
}

// Initialize on module load
loadFromDisk();

export const SubscriptionDatabase = {
  /**
   * Save or update a subscription in the database
   */
  upsert(subscription: StoredSubscription): StoredSubscription {
    const now = new Date().toISOString();
    const existing = subscriptionsCache.get(subscription.orderId);
    
    const record: StoredSubscription = {
      ...subscription,
      createdAt: existing?.createdAt || subscription.createdAt || now,
      updatedAt: now,
    };

    subscriptionsCache.set(record.orderId, record);
    persistSubscriptions();
    console.log(`[DB] Upserted subscription ${record.orderId} for ${record.payerEmail} (Tier: ${record.tier}, Status: ${record.status})`);
    return record;
  },

  /**
   * Find subscription by PayPal Order ID
   */
  findByOrderId(orderId: string): StoredSubscription | null {
    return subscriptionsCache.get(orderId) || null;
  },

  /**
   * Find subscription by user email (finds latest active or matching)
   */
  findByEmail(email: string): StoredSubscription | null {
    const normalized = email.trim().toLowerCase();
    const list = Array.from(subscriptionsCache.values()).filter(
      s => s.payerEmail.trim().toLowerCase() === normalized
    );
    if (list.length === 0) return null;
    
    // Sort by latest updatedAt
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list[0];
  },

  /**
   * Find subscription by License Key or API Key
   */
  findByKey(key: string): StoredSubscription | null {
    for (const sub of subscriptionsCache.values()) {
      if (sub.licenseKey === key || sub.apiKey === key) {
        return sub;
      }
    }
    return null;
  },

  /**
   * Update subscription status (e.g. from webhook events)
   */
  updateStatus(
    orderIdOrEmail: string, 
    status: StoredSubscription['status'], 
    updates?: Partial<StoredSubscription>
  ): StoredSubscription | null {
    let sub = subscriptionsCache.get(orderIdOrEmail) || this.findByEmail(orderIdOrEmail);
    
    if (!sub) {
      // If doesn't exist yet, construct a placeholder subscription to update
      sub = {
        orderId: orderIdOrEmail.startsWith('PAYPAL-') ? orderIdOrEmail : `PAYPAL-ORD-${Date.now().toString(36).toUpperCase()}`,
        payerEmail: orderIdOrEmail.includes('@') ? orderIdOrEmail : 'customer@paypal.com',
        tier: updates?.tier || 'pro',
        billingCycle: updates?.billingCycle || 'monthly',
        status,
        amount: updates?.amount || 79,
        currency: updates?.currency || 'USD',
        licenseKey: updates?.licenseKey || `PAYPAL-AIGEN-PRO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        apiKey: updates?.apiKey || `pp_key_${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
    } else {
      sub = {
        ...sub,
        ...updates,
        status,
        updatedAt: new Date().toISOString()
      };
    }

    subscriptionsCache.set(sub.orderId, sub);
    persistSubscriptions();
    console.log(`[DB] Updated subscription status for ${sub.orderId} -> ${status} (Plan: ${sub.tier})`);
    return sub;
  },

  /**
   * Log incoming webhook event
   */
  logWebhook(entry: Omit<WebhookLog, 'receivedAt'>): WebhookLog {
    const log: WebhookLog = {
      ...entry,
      receivedAt: new Date().toISOString(),
    };
    webhookLogsCache.unshift(log);
    persistLogs();
    return log;
  },

  /**
   * Get all active subscriptions
   */
  getAll(): StoredSubscription[] {
    return Array.from(subscriptionsCache.values());
  },

  /**
   * Get recent webhook logs
   */
  getLogs(limit = 25): WebhookLog[] {
    return webhookLogsCache.slice(0, limit);
  }
};
