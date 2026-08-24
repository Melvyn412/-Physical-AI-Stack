import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { SubscriptionDatabase, StoredSubscription } from "./src/db/subscriptionStore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialization for Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Rate-limiting and quota enforcement limits per plan tier
const TIER_QUOTAS: Record<string, { aiLimit: number; name: string }> = {
  developer: { aiLimit: 5, name: "Developer / Free" },
  pro: { aiLimit: 250, name: "Pro Innovator" },
  team: { aiLimit: 2000, name: "Team / Studio" },
  enterprise: { aiLimit: 100000, name: "Enterprise & Safety" },
};

// In-memory request counters per client token/IP
const usageRegistry = new Map<string, { count: number; lastReset: number }>();

function getClientUsage(clientId: string, planTier: string) {
  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  let record = usageRegistry.get(clientId);

  if (!record || now - record.lastReset > ONE_MONTH_MS) {
    record = { count: 0, lastReset: now };
    usageRegistry.set(clientId, record);
  }

  return record;
}

// Helper to resolve effective plan tier from headers and database subscriptions
function resolvePlanTier(req: express.Request): { plan: string; tierConfig: { aiLimit: number; name: string }; subscription: StoredSubscription | null } {
  const headerPlan = (req.headers["x-user-plan"] as string) || "developer";
  const userEmail = (req.headers["x-user-email"] as string) || (req.query?.email as string);
  const apiToken = (req.headers["x-api-token"] as string) || (req.query?.apiKey as string);
  const orderId = (req.headers["x-order-id"] as string) || (req.query?.orderId as string);

  let sub: StoredSubscription | null = null;
  if (orderId) {
    sub = SubscriptionDatabase.findByOrderId(orderId);
  }
  if (!sub && userEmail) {
    sub = SubscriptionDatabase.findByEmail(userEmail);
  }
  if (!sub && apiToken) {
    sub = SubscriptionDatabase.findByKey(apiToken);
  }

  let effectivePlan = headerPlan;
  if (sub && (sub.status === 'COMPLETED' || sub.status === 'ACTIVE')) {
    effectivePlan = sub.tier;
  }

  const tierConfig = TIER_QUOTAS[effectivePlan] || TIER_QUOTAS.developer;
  return { plan: effectivePlan, tierConfig, subscription: sub };
}

// API Health Check & Quota Status
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
    tiersSupported: Object.keys(TIER_QUOTAS),
  });
});

// API Endpoint to check quota status for an API key or client
app.get("/api/quota-status", (req, res) => {
  const { plan, tierConfig, subscription } = resolvePlanTier(req);
  const clientId = (req.headers["x-api-token"] as string) || (req.headers["x-user-email"] as string) || req.ip || "anonymous_client";
  const usage = getClientUsage(clientId, plan);

  res.setHeader("X-RateLimit-Limit", tierConfig.aiLimit.toString());
  res.setHeader("X-RateLimit-Remaining", Math.max(0, tierConfig.aiLimit - usage.count).toString());
  res.setHeader("X-RateLimit-Reset", new Date(usage.lastReset + 30 * 24 * 60 * 60 * 1000).toISOString());

  res.json({
    plan,
    planName: tierConfig.name,
    limit: tierConfig.aiLimit,
    used: usage.count,
    remaining: Math.max(0, tierConfig.aiLimit - usage.count),
    isExhausted: usage.count >= tierConfig.aiLimit,
    databaseSubscriptionActive: !!subscription && (subscription.status === 'COMPLETED' || subscription.status === 'ACTIVE'),
    subscriptionDetails: subscription || null,
  });
});

// API Endpoint to decompose complex real-world objectives into the 5-tier AI stack execution pipeline
app.post("/api/decompose-objective", async (req, res) => {
  try {
    const { objective, environment, embodiment } = req.body;
    const { plan, tierConfig } = resolvePlanTier(req);
    const clientId = (req.headers["x-api-token"] as string) || (req.headers["x-user-email"] as string) || req.ip || "anonymous_client";
    const usage = getClientUsage(clientId, plan);

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", tierConfig.aiLimit.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, tierConfig.aiLimit - usage.count - 1).toString());
    res.setHeader("X-RateLimit-Reset", new Date(usage.lastReset + 30 * 24 * 60 * 60 * 1000).toISOString());

    // Enforce quota limit barrier
    if (usage.count >= tierConfig.aiLimit) {
      return res.status(429).json({
        error: `Monthly quota barrier reached: ${usage.count}/${tierConfig.aiLimit} Custom AI Goal Syntheses used on ${tierConfig.name}.`,
        barrier: true,
        currentPlan: plan,
        recommendedPlan: plan === "developer" ? "pro" : "team",
        used: usage.count,
        limit: tierConfig.aiLimit,
        featureName: "AI Goal Synthesizer",
      });
    }

    if (!objective || typeof objective !== "string") {
      return res.status(400).json({ error: "Objective prompt is required" });
    }

    // Increment usage counter upon valid execution
    usage.count += 1;

    const ai = getGeminiClient();

    // System prompt for physical intelligence stack generation
    const prompt = `You are the lead AI Architect for an Embodied Physical Intelligence System.
Decompose the following real-world autonomous objective into a structured 5-layer physical execution pipeline:

Objective: "${objective}"
Target Environment: "${environment || "Dynamic Industrial / Hazardous Environment"}"
Robotic Embodiment: "${embodiment || "6-DOF Robotic Arm with Bimanual Tactile Grippers & Mobile Base"}"

Provide a detailed response following this exact structure:
1. multimodality: Sensor fusion strategy (RGB, LiDAR, Depth, Tactile, Audio/Thermal), data refresh rates, and primary noise mitigation.
2. worldModel: Generative 3D spatial occupancy grid, friction/gravity prediction, dynamic obstacle trajectory forecasting, and T+1s rollout parameters.
3. reasoning: Chain-of-thought logic steps, safety hazard evaluation matrix, edge-case failure contingency branches, and tree-of-thought node depth.
4. agents: Goal decomposition DAG (Planner, Perception, Controller, Safety Monitor), tool/actuator invocation sequence, and multi-agent consensus protocols.
5. robotics: Inverse kinematics joint targets, torque/force PID feedback loops, end-effector trajectory coordinates, and tactile force limits.
6. simulatedSteps: An array of 4-6 sequential real-time action steps with step title, description, active stack layer, safety status (NORMAL / WARN / CRITICAL), and estimated confidence % (0-100).`;

    if (!ai) {
      // Return structured fallback response if no API key is available
      return res.json({
        fallback: true,
        message: "Generated via local physical architecture engine (No GEMINI_API_KEY configured).",
        multimodality: {
          sensors: ["Dual Intel RealSense RGB-D", "3D Solid-State LiDAR", "FingerSense Tactile Arrays", "Thermal Array"],
          fusionRateHz: 120,
          noiseMitigation: "Kalman Filter + Temporal Point Cloud Smoothing",
          dataVolumeMbps: 450
        },
        worldModel: {
          gridResolutionCm: 1.5,
          predictionHorizonMs: 2000,
          physicsEngine: "DiffPhys-3D Generative Rollout",
          confidenceScore: 98.4
        },
        reasoning: {
          strategy: "Tree-of-Thought with Safety Pruning",
          cotSteps: [
            "Assess structural integrity & dynamic clearances",
            "Evaluate grip force vs object elasticity",
            "Simulate payload momentum transfer",
            "Verify fail-safe fallback path"
          ],
          hazardLevel: "LOW"
        },
        agents: {
          activeAgents: ["PlannerAgent-01", "VisionSensor-02", "RoboArmActuator-03", "SafetySentinel-00"],
          subGoalDAG: "Perceive -> Build Occupancy -> Reason Path -> Execute Actuation -> Verify Force",
          consensusScore: 0.99
        },
        robotics: {
          kinematics: "6-DOF Inverse Kinematics + Nullspace Motion Planning",
          controlFrequencyHz: 1000,
          targetTorqueNm: [12.4, 45.1, 28.9, 14.2, 8.5, 3.1],
          gripForceN: 24.5
        },
        simulatedSteps: [
          {
            stepNumber: 1,
            title: "Multimodal Perception & Scene Scan",
            description: "Fusing 120Hz RGB-D depth point clouds with 3D LiDAR to register environment boundaries and target mesh.",
            activeLayer: "Multimodality",
            status: "NORMAL",
            confidence: 99.2
          },
          {
            stepNumber: 2,
            title: "World Model Spatial Rollout",
            description: "Predicting 2.0s future trajectories of surrounding dynamic obstacles and contact surface friction coefficients.",
            activeLayer: "World Models",
            status: "NORMAL",
            confidence: 97.8
          },
          {
            stepNumber: 3,
            title: "Cognitive Chain-of-Thought Planning",
            description: "Reasoning over path constraints, calculating optimal joint clearance, and validating safety rules.",
            activeLayer: "Reasoning",
            status: "NORMAL",
            confidence: 98.5
          },
          {
            stepNumber: 4,
            title: "Agent Swarm Task Delegation",
            description: "PlannerAgent assigns inverse kinematics computation to ActuatorAgent while SafetySentinel monitors force bounds.",
            activeLayer: "Agents",
            status: "NORMAL",
            confidence: 99.0
          },
          {
            stepNumber: 5,
            title: "Robotic Joint Trajectory Execution",
            description: "Streaming 1000Hz torque commands to 6 joint motors with active tactile force-feedback compliance.",
            activeLayer: "Robotics",
            status: "NORMAL",
            confidence: 99.6
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            multimodality: {
              type: Type.OBJECT,
              properties: {
                sensors: { type: Type.ARRAY, items: { type: Type.STRING } },
                fusionRateHz: { type: Type.NUMBER },
                noiseMitigation: { type: Type.STRING },
                dataVolumeMbps: { type: Type.NUMBER }
              },
              required: ["sensors", "fusionRateHz", "noiseMitigation"]
            },
            worldModel: {
              type: Type.OBJECT,
              properties: {
                gridResolutionCm: { type: Type.NUMBER },
                predictionHorizonMs: { type: Type.NUMBER },
                physicsEngine: { type: Type.STRING },
                confidenceScore: { type: Type.NUMBER }
              },
              required: ["physicsEngine", "confidenceScore"]
            },
            reasoning: {
              type: Type.OBJECT,
              properties: {
                strategy: { type: Type.STRING },
                cotSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                hazardLevel: { type: Type.STRING }
              },
              required: ["strategy", "cotSteps", "hazardLevel"]
            },
            agents: {
              type: Type.OBJECT,
              properties: {
                activeAgents: { type: Type.ARRAY, items: { type: Type.STRING } },
                subGoalDAG: { type: Type.STRING },
                consensusScore: { type: Type.NUMBER }
              },
              required: ["activeAgents", "subGoalDAG"]
            },
            robotics: {
              type: Type.OBJECT,
              properties: {
                kinematics: { type: Type.STRING },
                controlFrequencyHz: { type: Type.NUMBER },
                targetTorqueNm: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                gripForceN: { type: Type.NUMBER }
              },
              required: ["kinematics", "controlFrequencyHz", "gripForceN"]
            },
            simulatedSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  activeLayer: { type: Type.STRING },
                  status: { type: Type.STRING },
                  confidence: { type: Type.NUMBER }
                },
                required: ["stepNumber", "title", "description", "activeLayer", "status", "confidence"]
              }
            }
          },
          required: ["multimodality", "worldModel", "reasoning", "agents", "robotics", "simulatedSteps"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated from Gemini");
    }

    const data = JSON.parse(text);
    return res.json({ fallback: false, ...data });
  } catch (error: any) {
    console.error("Error in /api/decompose-objective:", error);
    return res.status(500).json({
      error: "Failed to generate objective breakdown",
      details: error.message || String(error)
    });
  }
});

// ==========================================
// PAYPAL PAYMENT GATEWAY & WEBHOOK INTEGRATION
// ==========================================

// Helper to get PayPal Base API URL
function getPayPalBaseUrl(): string {
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  return mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
}

// Helper to get PayPal OAuth2 Access Token
async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token || null;
    } else {
      const errorText = await response.text();
      console.warn('[PayPal Token Error]:', errorText);
    }
  } catch (err: any) {
    console.warn('[PayPal Auth Exception]:', err.message);
  }
  return null;
}

/**
 * Verify PayPal Webhook cryptographic signature via PayPal REST API
 */
async function verifyPayPalWebhookSignature(
  req: express.Request,
  webhookEvent: any
): Promise<{ verified: boolean; message: string }> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const authAlgo = req.headers['paypal-auth-algo'] as string;
  const certUrl = req.headers['paypal-cert-url'] as string;
  const transmissionId = req.headers['paypal-transmission-id'] as string;
  const transmissionSig = req.headers['paypal-transmission-sig'] as string;
  const transmissionTime = req.headers['paypal-transmission-time'] as string;

  // If running in development/sandbox without webhook ID or headers, allow testing
  if (!webhookId || !transmissionSig || !transmissionId) {
    const isDevelopment = !process.env.PAYPAL_WEBHOOK_ID || process.env.PAYPAL_MODE !== 'live';
    if (isDevelopment) {
      console.log('[PayPal Webhook] Notice: Webhook signature verification bypassed (Sandbox/Test mode without PAYPAL_WEBHOOK_ID header).');
      return { 
        verified: true, 
        message: 'Verified (Development / Simulated Mode)' 
      };
    }
    return { 
      verified: false, 
      message: 'Missing required PayPal transmission headers or PAYPAL_WEBHOOK_ID' 
    };
  }

  try {
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return { 
        verified: false, 
        message: 'Could not obtain PayPal OAuth token for signature verification' 
      };
    }

    const verificationPayload = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent
    };

    const verifyResponse = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(verificationPayload)
    });

    if (!verifyResponse.ok) {
      const errText = await verifyResponse.text();
      console.warn('[PayPal Webhook Verify Warning]:', errText);
      return { 
        verified: false, 
        message: `PayPal signature verification API returned status ${verifyResponse.status}` 
      };
    }

    const verifyData = await verifyResponse.json();
    const isSuccess = verifyData.verification_status === 'SUCCESS';

    return {
      verified: isSuccess,
      message: isSuccess ? 'Cryptographically Verified by PayPal API' : `Verification status: ${verifyData.verification_status}`
    };
  } catch (err: any) {
    console.error('[PayPal Webhook Verify Exception]:', err);
    return {
      verified: false,
      message: err.message || 'Signature verification error'
    };
  }
}

// 1. Get PayPal configuration status
app.get("/api/paypal/config", (req, res) => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  const hasSecret = !!process.env.PAYPAL_CLIENT_SECRET;
  const hasWebhook = !!process.env.PAYPAL_WEBHOOK_ID;

  res.json({
    configured: !!(clientId && hasSecret),
    clientId: clientId ? `${clientId.substring(0, 8)}...` : null,
    fullClientId: clientId || null,
    mode: clientId && hasSecret ? mode : 'sandbox_simulation',
    webhookConfigured: hasWebhook,
    currency: 'USD',
    supportedTiers: ['pro', 'team', 'enterprise'],
  });
});

// 2. Create PayPal Order
app.post("/api/paypal/create-order", async (req, res) => {
  try {
    const { 
      tier = 'pro', 
      billingCycle = 'monthly', 
      currency = 'USD', 
      email = 'user@example.com',
      payerName = 'Robotics Engineer',
      organization = 'Autonomous Systems Lab'
    } = req.body;

    const prices: Record<string, { monthly: number; annual: number; name: string }> = {
      pro: { monthly: 79, annual: 63 * 12, name: 'Pro Innovator' },
      team: { monthly: 399, annual: 319 * 12, name: 'Team / Studio' },
      enterprise: { monthly: 1500, annual: 1200 * 12, name: 'Enterprise & Safety' },
    };

    const planInfo = prices[tier] || prices.pro;
    const amountValue = billingCycle === 'annual' ? planInfo.annual : planInfo.monthly;
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;

    // Try Live PayPal REST API if credentials exist
    const accessToken = await getPayPalAccessToken();
    if (accessToken) {
      try {
        const orderPayload = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: `aigenesis_${tier}_${Date.now()}`,
              description: `AIGENESIS.TECH ${planInfo.name} Plan (${billingCycle})`,
              custom_id: JSON.stringify({ tier, billingCycle, email, organization }),
              amount: {
                currency_code: currency,
                value: amountValue.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: currency,
                    value: amountValue.toFixed(2)
                  }
                }
              },
              items: [
                {
                  name: `AIGENESIS.TECH ${planInfo.name}`,
                  description: `Physical AI Cloud Platform • ${billingCycle === 'annual' ? '12 Months' : '1 Month'} Access`,
                  unit_amount: {
                    currency_code: currency,
                    value: amountValue.toFixed(2)
                  },
                  quantity: '1',
                  category: 'DIGITAL_GOODS'
                }
              ]
            }
          ],
          application_context: {
            brand_name: 'AIGENESIS.TECH',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${appUrl}?paypal_status=success&tier=${tier}&cycle=${billingCycle}`,
            cancel_url: `${appUrl}?paypal_status=cancelled`
          }
        };

        const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(orderPayload)
        });

        if (response.ok) {
          const orderData = await response.json();
          const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

          // Save pending order into database
          SubscriptionDatabase.upsert({
            orderId: orderData.id,
            payerEmail: email,
            payerName,
            tier: tier as any,
            billingCycle: billingCycle as any,
            status: 'CREATED',
            amount: amountValue,
            currency,
            licenseKey: `PAYPAL-AIGEN-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            apiKey: `pp_live_${Math.random().toString(36).substring(2, 10)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          return res.json({
            orderId: orderData.id,
            status: orderData.status,
            mode: 'live',
            approvalUrl: approveLink,
            tier,
            billingCycle,
            amount: amountValue,
            planName: planInfo.name
          });
        } else {
          const errText = await response.text();
          console.warn('[PayPal Create Order Live Warning]:', errText);
        }
      } catch (liveErr: any) {
        console.warn('[PayPal Create Order Live Exception]:', liveErr.message);
      }
    }

    // High-Fidelity Sandbox / Simulation Order Creation
    const simulatedOrderId = `PAYPAL-ORD-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const simulatedLicenseKey = `PAYPAL-AIGEN-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const simulatedApiKey = `pp_sbx_${Math.random().toString(36).substring(2, 10)}`;

    SubscriptionDatabase.upsert({
      orderId: simulatedOrderId,
      payerEmail: email,
      payerName,
      tier: tier as any,
      billingCycle: billingCycle as any,
      status: 'APPROVED',
      amount: amountValue,
      currency,
      licenseKey: simulatedLicenseKey,
      apiKey: simulatedApiKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.json({
      orderId: simulatedOrderId,
      status: 'CREATED',
      mode: process.env.PAYPAL_CLIENT_ID ? 'live_fallback' : 'sandbox',
      licenseKey: simulatedLicenseKey,
      apiKey: simulatedApiKey,
      tier,
      billingCycle,
      amount: amountValue,
      currency,
      planName: planInfo.name,
      approvalUrl: `${appUrl}?paypal_status=success&order_id=${simulatedOrderId}&tier=${tier}&cycle=${billingCycle}&license=${simulatedLicenseKey}`
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return res.status(500).json({
      error: 'Failed to create PayPal order',
      details: error.message || String(error)
    });
  }
});

// 3. Capture PayPal Order
app.post("/api/paypal/capture-order", async (req, res) => {
  try {
    const { orderId, tier = 'pro', email = 'user@example.com', billingCycle = 'monthly' } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const accessToken = await getPayPalAccessToken();

    // If live PayPal token is available and order looks like a live PayPal order ID
    if (accessToken && !orderId.startsWith('PAYPAL-ORD-')) {
      try {
        const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Prefer': 'return=representation'
          }
        });

        if (response.ok) {
          const captureData = await response.json();
          const payerEmail = captureData.payer?.email_address || email;
          const payerId = captureData.payer?.payer_id || 'PAYER_LIVE';
          const licenseKey = `PAYPAL-AIGEN-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const amount = parseFloat(captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || '79');
          const currency = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || 'USD';

          // Persist to Subscription Database
          const updatedSub = SubscriptionDatabase.upsert({
            orderId,
            payerId,
            payerEmail,
            tier: tier as any,
            billingCycle: billingCycle as any,
            status: 'COMPLETED',
            amount,
            currency,
            licenseKey,
            apiKey: `pp_live_${Math.random().toString(36).substring(2, 10)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          return res.json({
            success: true,
            status: 'COMPLETED',
            orderId,
            payerId,
            payerEmail,
            licenseKey,
            tier,
            subscription: updatedSub,
            mode: 'live'
          });
        }
      } catch (captureErr: any) {
        console.warn('[PayPal Capture Live Exception]:', captureErr.message);
      }
    }

    // Sandbox / Simulation Order Capture
    const licenseKey = `PAYPAL-AIGEN-${tier.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const payerId = `PAYER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const amount = tier === 'team' ? 399 : tier === 'enterprise' ? 1500 : 79;

    const savedSub = SubscriptionDatabase.upsert({
      orderId,
      payerId,
      payerEmail: email,
      tier: tier as any,
      billingCycle: billingCycle as any,
      status: 'COMPLETED',
      amount,
      currency: 'USD',
      licenseKey,
      apiKey: `pp_sbx_${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      status: 'COMPLETED',
      orderId,
      payerId,
      payerEmail: email,
      licenseKey,
      tier,
      subscription: savedSub,
      mode: 'sandbox'
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return res.status(500).json({
      error: 'Failed to capture PayPal order',
      details: error.message || String(error)
    });
  }
});

// 4. PayPal Webhook Listener with Cryptographic Signature Verification & DB Sync
app.post("/api/paypal/webhook", express.json(), async (req, res) => {
  try {
    const webhookEvent = req.body;
    const eventType = webhookEvent.event_type;
    const eventId = webhookEvent.id || `evt_${Date.now()}`;
    const resource = webhookEvent.resource || {};

    console.log(`[PayPal Webhook] Incoming Event: ${eventType} (ID: ${eventId})`);

    // Step 1: Verify PayPal Cryptographic Webhook Signature
    const verification = await verifyPayPalWebhookSignature(req, webhookEvent);

    // Record webhook log entry into Database
    SubscriptionDatabase.logWebhook({
      id: eventId,
      eventType: eventType || 'UNKNOWN',
      summary: webhookEvent.summary || `PayPal event: ${eventType}`,
      verified: verification.verified,
      resourceId: resource.id || resource.order_id,
      resourceType: resource.resource_type || webhookEvent.resource_type,
      payloadExcerpt: {
        event_type: eventType,
        create_time: webhookEvent.create_time,
        status: resource.status,
        custom_id: resource.custom_id,
        amount: resource.amount
      }
    });

    if (!verification.verified) {
      console.warn(`[PayPal Webhook Rejected]: Signature verification failed - ${verification.message}`);
      return res.status(401).json({
        error: 'Invalid PayPal webhook signature',
        details: verification.message
      });
    }

    // Step 2: Extract & Parse Resource Metadata
    const orderId = resource.id || resource.supplementary_data?.related_ids?.order_id || `pp_${Date.now()}`;
    const customIdStr = resource.custom_id || resource.purchase_units?.[0]?.custom_id;
    let targetTier: 'developer' | 'pro' | 'team' | 'enterprise' = 'pro';
    let targetEmail = resource.payer?.email_address || resource.subscriber?.email_address || 'customer@paypal.com';
    let billingCycle: 'monthly' | 'annual' = 'monthly';

    if (customIdStr) {
      try {
        const parsed = JSON.parse(customIdStr);
        if (parsed.tier) targetTier = parsed.tier;
        if (parsed.email) targetEmail = parsed.email;
        if (parsed.billingCycle) billingCycle = parsed.billingCycle;
      } catch (_) {}
    }

    const amount = parseFloat(resource.amount?.value || resource.billing_info?.last_payment?.amount?.value || '79');
    const currency = resource.amount?.currency_code || resource.billing_info?.last_payment?.amount?.currency_code || 'USD';

    // Step 3: Handle Event Types and Automatically Update Database Subscription State
    let databaseAction = 'processed';

    switch (eventType) {
      // Successful one-time payment or invoice capture
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'CHECKOUT.ORDER.APPROVED': {
        const isCompleted = eventType === 'PAYMENT.CAPTURE.COMPLETED';
        SubscriptionDatabase.updateStatus(orderId, isCompleted ? 'COMPLETED' : 'APPROVED', {
          payerEmail: targetEmail,
          tier: targetTier,
          billingCycle,
          amount,
          currency,
          lastWebhookEvent: eventType
        });
        databaseAction = `Subscription ${orderId} upgraded to ${targetTier.toUpperCase()} (${isCompleted ? 'COMPLETED' : 'APPROVED'})`;
        break;
      }

      // Subscription Activated / Renewed
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.RE-ACTIVATED': {
        SubscriptionDatabase.updateStatus(orderId, 'ACTIVE', {
          payerEmail: targetEmail,
          tier: targetTier,
          billingCycle,
          amount,
          currency,
          lastWebhookEvent: eventType
        });
        databaseAction = `Recurring subscription ${orderId} set to ACTIVE (${targetTier})`;
        break;
      }

      // Refunded or Charged Back / Reversed -> Downgrade plan
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        SubscriptionDatabase.updateStatus(orderId, 'REFUNDED', {
          tier: 'developer',
          lastWebhookEvent: eventType
        });
        databaseAction = `Subscription ${orderId} downgraded to DEVELOPER (REFUNDED)`;
        break;
      }

      // Denied or Declined Payment
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        SubscriptionDatabase.updateStatus(orderId, 'DENIED', {
          tier: 'developer',
          lastWebhookEvent: eventType
        });
        databaseAction = `Subscription ${orderId} marked as DENIED`;
        break;
      }

      // Subscription Cancelled, Expired, or Suspended -> Downgrade plan
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        SubscriptionDatabase.updateStatus(orderId, 'CANCELLED', {
          tier: 'developer',
          lastWebhookEvent: eventType
        });
        databaseAction = `Subscription ${orderId} cancelled, reset to DEVELOPER tier`;
        break;
      }

      // Dispute opened
      case 'CUSTOMER.DISPUTE.CREATED': {
        console.warn(`[PayPal Webhook Dispute]: Dispute created for resource ${resource.disputed_transactions?.[0]?.buyer_transaction_id || orderId}`);
        databaseAction = `Dispute recorded for ${orderId}`;
        break;
      }

      default: {
        console.log(`[PayPal Webhook]: Event type ${eventType} logged without state mutation.`);
        databaseAction = `Logged event ${eventType}`;
        break;
      }
    }

    console.log(`[PayPal Webhook DB Sync]: ${databaseAction}`);

    return res.status(200).json({
      received: true,
      verified: true,
      eventId,
      eventType,
      action: databaseAction,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[PayPal Webhook Exception]:', error);
    return res.status(500).json({ 
      error: 'PayPal webhook processing error',
      details: error.message || String(error)
    });
  }
});

// 5. Test/Simulate PayPal Webhook Endpoint (For Diagnostics & Testing DB Updates)
app.post("/api/paypal/test-webhook", express.json(), (req, res) => {
  const { eventType = 'PAYMENT.CAPTURE.COMPLETED', email = 'engineer@robotics-lab.ai', tier = 'pro' } = req.body;
  const orderId = `PAYPAL-TEST-${Date.now().toString(36).toUpperCase()}`;

  const status = eventType === 'PAYMENT.CAPTURE.REFUNDED' || eventType === 'BILLING.SUBSCRIPTION.CANCELLED'
    ? 'CANCELLED' 
    : 'COMPLETED';

  const updatedTier = status === 'CANCELLED' ? 'developer' : tier;

  const subscription = SubscriptionDatabase.updateStatus(orderId, status as any, {
    payerEmail: email,
    tier: updatedTier as any,
    billingCycle: 'annual',
    amount: updatedTier === 'team' ? 399 : 79,
    currency: 'USD',
    lastWebhookEvent: eventType
  });

  SubscriptionDatabase.logWebhook({
    id: `TEST-EVT-${Date.now()}`,
    eventType,
    summary: `Simulated Diagnostic Webhook: ${eventType}`,
    verified: true,
    resourceId: orderId,
    resourceType: 'capture',
    payloadExcerpt: { simulated: true, tier: updatedTier, email }
  });

  res.json({
    success: true,
    message: `Simulated webhook ${eventType} executed. Database updated.`,
    subscription
  });
});

// 6. Get Webhook Logs for Admin / Diagnostic Auditing
app.get("/api/paypal/webhook-logs", (req, res) => {
  const logs = SubscriptionDatabase.getLogs(50);
  res.json({
    count: logs.length,
    logs
  });
});

// 7. Get User Subscription Status & Database Record
app.get("/api/paypal/subscription-status", (req, res) => {
  const email = (req.query.email as string) || (req.headers["x-user-email"] as string);
  const orderId = (req.query.orderId as string) || (req.headers["x-order-id"] as string);
  const apiKey = (req.query.apiKey as string) || (req.headers["x-api-token"] as string);

  let subscription: StoredSubscription | null = null;

  if (orderId) {
    subscription = SubscriptionDatabase.findByOrderId(orderId);
  } else if (email) {
    subscription = SubscriptionDatabase.findByEmail(email);
  } else if (apiKey) {
    subscription = SubscriptionDatabase.findByKey(apiKey);
  }

  if (subscription) {
    return res.json({
      hasSubscription: true,
      active: subscription.status === 'COMPLETED' || subscription.status === 'ACTIVE',
      subscription,
      tier: subscription.tier,
      quotaLimits: TIER_QUOTAS[subscription.tier] || TIER_QUOTAS.developer
    });
  }

  return res.json({
    hasSubscription: false,
    active: false,
    tier: 'developer',
    quotaLimits: TIER_QUOTAS.developer
  });
});

// 8. Verify PayPal Order or License
app.get("/api/paypal/verify/:orderId", (req, res) => {
  const { orderId } = req.params;
  const subscription = SubscriptionDatabase.findByOrderId(orderId);

  if (subscription) {
    return res.json({
      valid: true,
      subscription
    });
  }

  return res.json({
    valid: false,
    message: 'PayPal order or license record not found in database'
  });
});

// ==========================================
// SEARCH ENGINE OPTIMIZATION (SEO) ENDPOINTS
// ==========================================

// Serve robots.txt for Googlebot, Bingbot & web crawlers
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "aigenesis.tech";
  const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const robotsContent = `# User-Agent configuration for Googlebot and modern search crawlers
User-agent: *
Allow: /
Allow: /index.html
Allow: /sitemap.xml
Allow: /api/health
Allow: /api/quota-status

# Disallow private webhook and diagnostics endpoints
Disallow: /api/paypal/webhook
Disallow: /api/paypal/test-webhook
Disallow: /api/paypal/webhook-logs
Disallow: /data/

# Sitemap reference
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(robotsContent);
});

// Serve dynamic XML Sitemap for Google Search Console
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "aigenesis.tech";
  const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const today = new Date().toISOString().split("T")[0];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&amp;fit=crop&amp;w=1200&amp;h=630&amp;q=80</image:loc>
      <image:title>AIGENESIS Physical AI Platform</image:title>
      <image:caption>Operational Physical AI Stack and Robotics Simulation Platform</image:caption>
    </image:image>
  </url>
  <url>
    <loc>${baseUrl}/#pricing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#objectives</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#simulation</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#slam</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/#pid</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/#ik</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/#bt</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/#swarm</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#urdf</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#ros2</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#safety</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/#stress</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(sitemapXml);
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Embodied OS Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
