// This file was coded (or vibe coded?) with the help of AI.
// Came out fairly clean, I believe.
import * as dotenv from 'dotenv'
import process from 'process'

dotenv.config()

const inventoryApiBaseUrl = process.env.INVENTORY_API_BASE_URL
if (!inventoryApiBaseUrl) {
  console.error('INVENTORY_API_BASE_URL is not set in the .env file.')
  process.exit(1)
}

const ordersApiBaseUrl = process.env.ORDERS_API_BASE_URL
if (!ordersApiBaseUrl) {
  console.error('ORDERS_API_BASE_URL is not set in the .env file.')
  process.exit(1)
}

type RestockPayload = {
  sku: string
  units: number
  lotId: string
}

type OrderPayload = {
  orderId: string
  sku: string
  units: number
  price: number
  userId: string
}

const restockRequests: RestockPayload[] = [
  { sku: 'APPLES', units: 100, lotId: 'APP001' },
  { sku: 'APPLES', units: 150, lotId: 'APP002' },
  { sku: 'APPLES', units: 200, lotId: 'APP003' },
  { sku: 'APPLES', units: 175, lotId: 'APP004' },
  { sku: 'APPLES', units: 190, lotId: 'APP005' },
  { sku: 'GRAPES', units: 1000, lotId: 'GRA001' },
  { sku: 'GRAPES', units: 500, lotId: 'GRA002' },
  { sku: 'GRAPES', units: 250, lotId: 'GRA003' },
  { sku: 'GRAPES', units: 800, lotId: 'GRA004' },
  { sku: 'GRAPES', units: 1200, lotId: 'GRA005' },
  { sku: 'ORANGES', units: 175, lotId: 'ORA001' },
  { sku: 'ORANGES', units: 100, lotId: 'ORA002' },
  { sku: 'ORANGES', units: 300, lotId: 'ORA003' },
  { sku: 'ORANGES', units: 220, lotId: 'ORA004' },
  { sku: 'ORANGES', units: 180, lotId: 'ORA005' },
  { sku: 'ORANGES', units: 275, lotId: 'ORA006' },
  { sku: 'ORANGES', units: 310, lotId: 'ORA007' },
  { sku: 'ORANGES', units: 90, lotId: 'ORA008' },
  { sku: 'ORANGES', units: 450, lotId: 'ORA009' },
  { sku: 'ORANGES', units: 120, lotId: 'ORA010' },
  { sku: 'ORANGES', units: 333, lotId: 'ORA011' },
  { sku: 'ORANGES', units: 87, lotId: 'ORA012' },
  { sku: 'ORANGES', units: 275, lotId: 'ORA013' },
  { sku: 'ORANGES', units: 150, lotId: 'ORA014' },
  { sku: 'ORANGES', units: 199, lotId: 'ORA015' },
  { sku: 'ORANGES', units: 340, lotId: 'ORA016' },
  { sku: 'ORANGES', units: 220, lotId: 'ORA017' },
  { sku: 'ORANGES', units: 310, lotId: 'ORA018' },
  { sku: 'ORANGES', units: 98, lotId: 'ORA019' },
  { sku: 'ORANGES', units: 265, lotId: 'ORA020' },
  { sku: 'ORANGES', units: 180, lotId: 'ORA021' },
  { sku: 'ORANGES', units: 145, lotId: 'ORA022' },
  { sku: 'ORANGES', units: 400, lotId: 'ORA023' },
  { sku: 'ORANGES', units: 160, lotId: 'ORA024' },
  { sku: 'ORANGES', units: 215, lotId: 'ORA025' },
]

const orderRequests: OrderPayload[] = [
  { orderId: 'ORD001', sku: 'APPLES', units: 1500000, price: 15.99, userId: 'MARIA' },
  { orderId: 'ORD002', sku: 'GRAPES', units: 15, price: 17.99, userId: 'JOHN' },
  { orderId: 'ORD003', sku: 'ORANGES', units: 20, price: 19.99, userId: 'ALICE' },
  { orderId: 'ORD004', sku: 'APPLES', units: 25, price: 21.99, userId: 'MARIA' },
  { orderId: 'ORD005', sku: 'GRAPES', units: 30, price: 23.99, userId: 'JOHN' },
  { orderId: 'ORD006', sku: 'ORANGES', units: 10, price: 25.99, userId: 'ALICE' },
  { orderId: 'ORD007', sku: 'APPLES', units: 15, price: 27.99, userId: 'MARIA' },
  { orderId: 'ORD008', sku: 'GRAPES', units: 20, price: 15.99, userId: 'JOHN' },
  { orderId: 'ORD009', sku: 'ORANGES', units: 25, price: 17.99, userId: 'ALICE' },
  { orderId: 'ORD010', sku: 'APPLES', units: 30, price: 19.99, userId: 'MARIA' },
  { orderId: 'ORD011', sku: 'GRAPES', units: 10, price: 120000.99, userId: 'JOHN' },
  { orderId: 'ORD012', sku: 'ORANGES', units: 15, price: 23.99, userId: 'ALICE' },
  { orderId: 'ORD013', sku: 'APPLES', units: 20, price: 25.99, userId: 'MARIA' },
  { orderId: 'ORD014', sku: 'GRAPES', units: 25, price: 27.99, userId: 'JOHN' },
  { orderId: 'ORD015', sku: 'ORANGES', units: 30, price: 15.99, userId: 'ALICE' },
  { orderId: 'ORD016', sku: 'APPLES', units: 10, price: 17.99, userId: 'MARIA' },
  { orderId: 'ORD017', sku: 'GRAPES', units: 15, price: 19.99, userId: 'JOHN' },
  { orderId: 'ORD018', sku: 'ORANGES', units: 20, price: 21.99, userId: 'ALICE' },
  { orderId: 'ORD019', sku: 'APPLES', units: 25, price: 23.99, userId: 'MARIA' },
  { orderId: 'ORD020', sku: 'GRAPES', units: 30, price: 25.99, userId: 'JOHN' },
  { orderId: 'ORD021', sku: 'ORANGES', units: 1500000, price: 27.99, userId: 'ALICE' },
  { orderId: 'ORD022', sku: 'APPLES', units: 15, price: 15.99, userId: 'MARIA' },
  { orderId: 'ORD023', sku: 'GRAPES', units: 20, price: 17.99, userId: 'JOHN' },
  { orderId: 'ORD024', sku: 'ORANGES', units: 25, price: 19.99, userId: 'ALICE' },
  { orderId: 'ORD025', sku: 'APPLES', units: 30, price: 21.99, userId: 'MARIA' },
  { orderId: 'ORD026', sku: 'GRAPES', units: 10, price: 23.99, userId: 'JOHN' },
  { orderId: 'ORD027', sku: 'ORANGES', units: 15, price: 25.99, userId: 'ALICE' },
  { orderId: 'ORD028', sku: 'APPLES', units: 20, price: 27.99, userId: 'MARIA' },
  { orderId: 'ORD029', sku: 'GRAPES', units: 25, price: 15.99, userId: 'JOHN' },
  { orderId: 'ORD030', sku: 'ORANGES', units: 30, price: 17.99, userId: 'ALICE' },
  { orderId: 'ORD031', sku: 'APPLES', units: 10, price: 120000.99, userId: 'MARIA' },
  { orderId: 'ORD032', sku: 'GRAPES', units: 15, price: 21.99, userId: 'JOHN' },
  { orderId: 'ORD033', sku: 'ORANGES', units: 20, price: 23.99, userId: 'ALICE' },
  { orderId: 'ORD034', sku: 'APPLES', units: 25, price: 25.99, userId: 'MARIA' },
  { orderId: 'ORD035', sku: 'GRAPES', units: 30, price: 27.99, userId: 'JOHN' },
  { orderId: 'ORD036', sku: 'ORANGES', units: 10, price: 15.99, userId: 'ALICE' },
  { orderId: 'ORD037', sku: 'APPLES', units: 15, price: 17.99, userId: 'MARIA' },
  { orderId: 'ORD038', sku: 'GRAPES', units: 20, price: 19.99, userId: 'JOHN' },
  { orderId: 'ORD039', sku: 'ORANGES', units: 25, price: 21.99, userId: 'ALICE' },
  { orderId: 'ORD040', sku: 'APPLES', units: 30, price: 23.99, userId: 'MARIA' },
  { orderId: 'ORD041', sku: 'GRAPES', units: 1500000, price: 25.99, userId: 'JOHN' },
  { orderId: 'ORD042', sku: 'ORANGES', units: 15, price: 27.99, userId: 'ALICE' },
  { orderId: 'ORD043', sku: 'APPLES', units: 20, price: 15.99, userId: 'MARIA' },
  { orderId: 'ORD044', sku: 'GRAPES', units: 25, price: 17.99, userId: 'JOHN' },
  { orderId: 'ORD045', sku: 'ORANGES', units: 30, price: 19.99, userId: 'ALICE' },
  { orderId: 'ORD046', sku: 'APPLES', units: 10, price: 21.99, userId: 'MARIA' },
  { orderId: 'ORD047', sku: 'GRAPES', units: 15, price: 23.99, userId: 'JOHN' },
  { orderId: 'ORD048', sku: 'ORANGES', units: 20, price: 25.99, userId: 'ALICE' },
  { orderId: 'ORD049', sku: 'APPLES', units: 25, price: 27.99, userId: 'MARIA' },
  { orderId: 'ORD050', sku: 'GRAPES', units: 30, price: 15.99, userId: 'JOHN' },
  { orderId: 'ORD051', sku: 'ORANGES', units: 10, price: 120000.99, userId: 'ALICE' },
  { orderId: 'ORD052', sku: 'APPLES', units: 15, price: 19.99, userId: 'MARIA' },
  { orderId: 'ORD053', sku: 'GRAPES', units: 20, price: 21.99, userId: 'JOHN' },
  { orderId: 'ORD054', sku: 'ORANGES', units: 25, price: 23.99, userId: 'ALICE' },
  { orderId: 'ORD055', sku: 'APPLES', units: 30, price: 25.99, userId: 'MARIA' },
  { orderId: 'ORD056', sku: 'GRAPES', units: 10, price: 27.99, userId: 'JOHN' },
  { orderId: 'ORD057', sku: 'ORANGES', units: 15, price: 15.99, userId: 'ALICE' },
  { orderId: 'ORD058', sku: 'APPLES', units: 20, price: 17.99, userId: 'MARIA' },
  { orderId: 'ORD059', sku: 'GRAPES', units: 25, price: 19.99, userId: 'JOHN' },
  { orderId: 'ORD060', sku: 'ORANGES', units: 30, price: 21.99, userId: 'ALICE' },
  { orderId: 'ORD061', sku: 'APPLES', units: 10, price: 23.99, userId: 'MARIA' },
  { orderId: 'ORD062', sku: 'GRAPES', units: 15, price: 25.99, userId: 'JOHN' },
  { orderId: 'ORD063', sku: 'ORANGES', units: 20, price: 27.99, userId: 'ALICE' },
  { orderId: 'ORD064', sku: 'APPLES', units: 25, price: 15.99, userId: 'MARIA' },
  { orderId: 'ORD065', sku: 'GRAPES', units: 30, price: 17.99, userId: 'JOHN' },
  { orderId: 'ORD066', sku: 'ORANGES', units: 10, price: 19.99, userId: 'ALICE' },
  { orderId: 'ORD067', sku: 'APPLES', units: 15, price: 21.99, userId: 'MARIA' },
  { orderId: 'ORD068', sku: 'GRAPES', units: 20, price: 23.99, userId: 'JOHN' },
  { orderId: 'ORD069', sku: 'ORANGES', units: 25, price: 25.99, userId: 'ALICE' },
  { orderId: 'ORD070', sku: 'APPLES', units: 30, price: 27.99, userId: 'MARIA' },
  { orderId: 'ORD071', sku: 'GRAPES', units: 10, price: 0.99, userId: 'JOHN' },
  { orderId: 'ORD072', sku: 'ORANGES', units: 15, price: 0.99, userId: 'ALICE' },
  { orderId: 'ORD073', sku: 'APPLES', units: 20, price: 19.99, userId: 'MARIA' },
  { orderId: 'ORD074', sku: 'GRAPES', units: 25, price: 21.99, userId: 'JOHN' },
  { orderId: 'ORD075', sku: 'ORANGES', units: 30, price: 23.99, userId: 'ALICE' },
]

/**
 *
 */
async function restockSku(payload: RestockPayload): Promise<void> {
  const res = await fetch(`${inventoryApiBaseUrl}/api/v1/inventory/restockSku`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://localhost',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Restock Sku (${payload.sku}, ${payload.lotId}) failed: ${res.status}\n${errorText}`)
    return
  }

  console.info(`Restock Sku (${payload.sku}, ${payload.lotId}) ok`)
}

/**
 *
 */
async function placeOrder(payload: OrderPayload): Promise<void> {
  const res = await fetch(`${ordersApiBaseUrl}/api/v1/orders/placeOrder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://localhost',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Place Order (${payload.orderId}) failed: ${res.status}\n${errorText}`)
    return
  }

  console.info(`Place Order (${payload.orderId}) ok`)
}

/**
 *
 */
async function run(): Promise<void> {
  console.log('\n\nRestocking skus...\n')
  for (const r of restockRequests) {
    await restockSku(r)
  }

  console.log('\n\nPlacing orders...\n')
  for (const o of orderRequests) {
    await placeOrder(o)
  }

  console.log('\n\nDone.\n')
}

run().catch((err) => {
  console.error('Unexpected failure:', err)
  process.exit(1)
})
