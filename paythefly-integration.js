/**
 * PayTheFly Crypto Payment Integration (JavaScript)
 *
 * Intent-based on-chain payment system supporting BSC + TRON.
 * Features: Payment links, Withdrawal links, Webhook verification.
 *
 * Docs: https://pro.paythefly.com/docs
 * License: MIT
 *
 * Dependencies: npm install viem
 *
 * Environment Variables:
 *   PTF_PROJECT_ID        — Your PayTheFly project ID
 *   PTF_PROJECT_CONTRACT  — On-chain project contract address (0x...)
 *   PTF_SIGNER_KEY        — Private key for EIP-712 signing (0x...)
 *   PTF_PROJECT_KEY       — HMAC secret for webhook verification
 *   PTF_CHAIN_ID          — Chain ID: 56(BSC), 97(BSC Testnet), 728126428(TRON), 3448148188(TRON Nile)
 *   PTF_TOKEN_ADDRESS     — Token address (0x000...000 for native BNB; omit for native)
 *   PTF_TOKEN_DECIMALS    — Token decimals (18 for BNB, 6 for TRX/USDT)
 */

const crypto = require('crypto');

// ── Configuration ──────────────────────────────────────────────
const config = {
  projectId: process.env.PTF_PROJECT_ID || '',
  projectContract: process.env.PTF_PROJECT_CONTRACT || '',
  signerKey: process.env.PTF_SIGNER_KEY || '',
  projectKey: process.env.PTF_PROJECT_KEY || '',
  chainId: Number(process.env.PTF_CHAIN_ID || '56'),
  tokenAddress: process.env.PTF_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000',
  tokenDecimals: Number(process.env.PTF_TOKEN_DECIMALS || '18'),
};

// TRON native token: T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb (Base58)
// For signing, convert TRON Base58 addresses to 0x hex with tronToHex()

// ── EIP-712 Domain ─────────────────────────────────────────────
// Same for both BSC and TRON. TRON uses standard EIP-712 with hex addresses.
function getDomain() {
  return {
    name: 'PayTheFlyPro',
    version: '1',
    chainId: config.chainId,
    verifyingContract: config.projectContract,
  };
}

// ── EIP-712 Types ──────────────────────────────────────────────
const PaymentRequestTypes = {
  PaymentRequest: [
    { name: 'projectId', type: 'string' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'serialNo', type: 'string' },
    { name: 'deadline', type: 'uint256' },
  ],
};

const WithdrawalRequestTypes = {
  WithdrawalRequest: [
    { name: 'user', type: 'address' },
    { name: 'projectId', type: 'string' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'serialNo', type: 'string' },
    { name: 'deadline', type: 'uint256' },
  ],
};

// ── Helpers ────────────────────────────────────────────────────
function parseUnits(amount, decimals = 18) {
  const [whole, frac = ''] = String(amount).split('.');
  return BigInt(whole + frac.padEnd(decimals, '0').slice(0, decimals));
}

function generateSerialNo(prefix = 'PTF') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Convert TRON Base58 address to 0x hex address.
 * Required for TRON chain EIP-712 signing.
 * Uses tronweb: npm install tronweb
 */
function tronToHex(base58Address) {
  // Requires: const TronWeb = require('tronweb');
  // const hex = TronWeb.address.toHex(base58Address);
  // return '0x' + hex.slice(2).toLowerCase();
  throw new Error('Install tronweb and uncomment tronToHex implementation for TRON support');
}

// ── Payment Link ───────────────────────────────────────────────
/**
 * Generate a signed PayTheFly payment link.
 *
 * @param {string} amount   — Human-readable amount (e.g. "0.01" BNB or "100" TRX)
 * @param {string} serialNo — Unique order identifier
 * @param {Object} [options] — { redirect, brand, lang, inWallet }
 * @returns {Promise<string>} Full PayTheFly payment URL
 */
async function createPaymentLink(amount, serialNo, options = {}) {
  const { createWalletClient, http } = await import('viem');
  const { privateKeyToAccount } = await import('viem/accounts');

  const account = privateKeyToAccount(config.signerKey);
  const walletClient = createWalletClient({ account, transport: http() });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const amountRaw = parseUnits(amount, config.tokenDecimals);

  const signature = await walletClient.signTypedData({
    account,
    domain: getDomain(),
    types: PaymentRequestTypes,
    primaryType: 'PaymentRequest',
    message: {
      projectId: config.projectId,
      token: config.tokenAddress,
      amount: amountRaw,
      serialNo,
      deadline,
    },
  });

  // Build URL — amount is human-readable, NOT raw units
  const url = new URL('https://pro.paythefly.com/pay');
  url.searchParams.set('chainId', String(config.chainId));
  url.searchParams.set('projectId', config.projectId);
  url.searchParams.set('amount', amount);
  url.searchParams.set('serialNo', serialNo);
  url.searchParams.set('deadline', String(deadline));
  url.searchParams.set('signature', signature);
  url.searchParams.set('token', config.tokenAddress);
  if (options.redirect) url.searchParams.set('redirect', options.redirect);
  if (options.brand) url.searchParams.set('brand', options.brand);
  if (options.lang) url.searchParams.set('lang', options.lang);
  if (options.inWallet) url.searchParams.set('in_wallet', '1');

  return url.toString();
}

// ── Withdrawal Link ────────────────────────────────────────────
/**
 * Generate a signed PayTheFly withdrawal/incentive link.
 *
 * @param {string} userAddress — Recipient wallet address (0x... or TRON Base58)
 * @param {string} amount      — Human-readable amount
 * @param {string} serialNo    — Unique withdrawal serial (prevents double-claim)
 * @param {Object} [options]   — { redirect, brand, lang, token, tokenDecimals }
 * @returns {Promise<string>} Full PayTheFly withdrawal URL
 */
async function createWithdrawalLink(userAddress, amount, serialNo, options = {}) {
  const { createWalletClient, http } = await import('viem');
  const { privateKeyToAccount } = await import('viem/accounts');

  const account = privateKeyToAccount(config.signerKey);
  const walletClient = createWalletClient({ account, transport: http() });

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
  const tokenAddr = options.token || config.tokenAddress;
  const decimals = options.tokenDecimals || config.tokenDecimals;
  const amountRaw = parseUnits(amount, decimals);

  const signature = await walletClient.signTypedData({
    account,
    domain: getDomain(),
    types: WithdrawalRequestTypes,
    primaryType: 'WithdrawalRequest',
    message: {
      user: userAddress,
      projectId: config.projectId,
      token: tokenAddr,
      amount: amountRaw,
      serialNo,
      deadline,
    },
  });

  const url = new URL('https://pro.paythefly.com/withdraw');
  url.searchParams.set('chainId', String(config.chainId));
  url.searchParams.set('projectId', config.projectId);
  url.searchParams.set('amount', amount);
  url.searchParams.set('serialNo', serialNo);
  url.searchParams.set('deadline', String(deadline));
  url.searchParams.set('signature', signature);
  url.searchParams.set('user', userAddress);
  if (tokenAddr !== '0x0000000000000000000000000000000000000000') {
    url.searchParams.set('token', tokenAddr);
  }
  if (options.redirect) url.searchParams.set('redirect', options.redirect);
  if (options.brand) url.searchParams.set('brand', options.brand);
  if (options.lang) url.searchParams.set('lang', options.lang);

  return url.toString();
}

// ── Webhook Verification ───────────────────────────────────────
/**
 * Verify PayTheFly webhook signature.
 *
 * Webhook POST body: { "data": "<json string>", "sign": "<hmac hex>", "timestamp": <unix> }
 * Signature: HMAC-SHA256(data + '.' + timestamp, projectKey)
 *
 * Payload fields: project_id, chain_symbol, project_contract, tx_hash,
 *   block_number, block_hash, wallet, contract_address, symbol, value,
 *   fee, serial_no, tx_type (1=payment, 2=withdrawal), confirm, confirmed, create_at
 *
 * Response MUST contain string "success" for PayTheFly to ack delivery.
 *
 * @param {string} data      — The "data" field (JSON string)
 * @param {number} timestamp — The "timestamp" field (unix seconds)
 * @param {string} sign      — The "sign" field (hex HMAC)
 * @returns {Object|null} Parsed payload if valid, null if verification fails
 */
function verifyWebhook(data, timestamp, sign) {
  // Timestamp freshness check (5 min tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) return null;

  // HMAC-SHA256(data + '.' + timestamp, projectKey)
  const message = data + '.' + timestamp;
  const expected = crypto
    .createHmac('sha256', config.projectKey)
    .update(message)
    .digest('hex');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sign))) {
      return null;
    }
  } catch {
    return null;
  }

  return JSON.parse(data);
}

/**
 * Express.js webhook handler.
 *
 * Usage: app.post('/webhook/paythefly', express.json(), handleWebhook);
 */
async function handleWebhook(req, res) {
  const { data, sign, timestamp } = req.body;

  const payload = verifyWebhook(data, timestamp, sign);
  if (!payload) {
    return res.status(401).json({ code: 1, msg: 'Invalid signature' });
  }

  // tx_type: 1 = user payment, 2 = user withdrawal (incentive claim)
  switch (payload.tx_type) {
    case 1:
      console.log(`[PayTheFly] Payment received: ${payload.value} ${payload.symbol}`);
      console.log(`  Serial: ${payload.serial_no}, TX: ${payload.tx_hash}`);
      console.log(`  Wallet: ${payload.wallet}, Confirmed: ${payload.confirmed}`);
      // TODO: Update your order status here
      break;
    case 2:
      console.log(`[PayTheFly] Withdrawal claimed: ${payload.value} ${payload.symbol}`);
      console.log(`  Serial: ${payload.serial_no}, TX: ${payload.tx_hash}`);
      // TODO: Mark incentive as claimed
      break;
  }

  // MUST return "success" in response body
  res.json({ code: 0, msg: 'success' });
}

module.exports = {
  config,
  getDomain,
  PaymentRequestTypes,
  WithdrawalRequestTypes,
  createPaymentLink,
  createWithdrawalLink,
  verifyWebhook,
  handleWebhook,
  generateSerialNo,
  parseUnits,
  tronToHex,
};
