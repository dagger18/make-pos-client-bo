import { test as setup, expect } from '@playwright/test'
import { writeFileSync } from 'fs'
import * as path from 'path'

const seedPath = path.join(__dirname, '../../playwright/.auth/seed.json')

setup('seed shared test data', async ({ request }) => {
  const seed: Record<string, unknown> = {}

  // Branch
  const branchRes = await request.post('/api/branch', {
    multipart: { name: 'E2E Test Branch' },
  })
  expect(branchRes.ok(), `branch create failed: ${await branchRes.text()}`).toBeTruthy()
  const branch = await branchRes.json()
  seed.branchId = branch.id
  seed.branchName = 'E2E Test Branch'

  // Department
  const deptRes = await request.post('/api/department', {
    multipart: { name: 'E2E Test Department' },
  })
  expect(deptRes.ok(), `department create failed: ${await deptRes.text()}`).toBeTruthy()
  const dept = await deptRes.json()
  seed.departmentId = dept.id
  seed.departmentName = 'E2E Test Department'

  // User Group
  const groupRes = await request.post('/api/user-group', {
    multipart: { name: 'E2E Test Group' },
  })
  expect(groupRes.ok(), `user-group create failed: ${await groupRes.text()}`).toBeTruthy()
  const group = await groupRes.json()
  seed.groupId = group.id
  seed.groupName = 'E2E Test Group'

  // Client
  const clientRes = await request.post('/api/client', {
    multipart: { name: 'E2E Test Client' },
  })
  expect(clientRes.ok(), `client create failed: ${await clientRes.text()}`).toBeTruthy()
  const client = await clientRes.json()
  seed.clientId = client.id
  seed.clientName = 'E2E Test Client'

  // Provider
  const providerRes = await request.post('/api/provider', {
    multipart: { name: 'E2E Test Provider' },
  })
  expect(providerRes.ok(), `provider create failed: ${await providerRes.text()}`).toBeTruthy()
  const provider = await providerRes.json()
  seed.providerId = provider.id
  seed.providerName = 'E2E Test Provider'

  // HS Code
  const hsRes = await request.post('/api/hs-code', {
    multipart: { code: '999999', description: 'E2E Test HS Code' },
  })
  expect(hsRes.ok(), `hs-code create failed: ${await hsRes.text()}`).toBeTruthy()
  const hs = await hsRes.json()
  seed.hsCodeId = hs.id

  // Quote (requires client)
  const quoteRes = await request.post('/api/quote', {
    multipart: {
      name: 'E2E Test Quote',
      transportType: 'sea',
      clientId: String(seed.clientId),
    },
  })
  expect(quoteRes.ok(), `quote create failed: ${await quoteRes.text()}`).toBeTruthy()
  const quote = await quoteRes.json()
  seed.quoteId = quote.id

  // Shipment (requires client)
  const shipmentRes = await request.post('/api/shipment', {
    multipart: {
      reference: 'E2E-SHIP-001',
      transportType: 'sea',
      clientId: String(seed.clientId),
    },
  })
  expect(shipmentRes.ok(), `shipment create failed: ${await shipmentRes.text()}`).toBeTruthy()
  const shipment = await shipmentRes.json()
  seed.shipmentId = shipment.id

  // Consolidation
  const consRes = await request.post('/api/consolidation', {
    multipart: {
      name: 'E2E Test Consolidation',
      transportType: 'sea',
    },
  })
  expect(consRes.ok(), `consolidation create failed: ${await consRes.text()}`).toBeTruthy()
  const cons = await consRes.json()
  seed.consolidationId = cons.id

  // CRM Lead (JSON body)
  const leadRes = await request.post('/api/crm/lead', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ firstName: 'E2E', lastName: 'Lead', email: 'e2e-lead@test.invalid' }),
  })
  expect(leadRes.ok(), `lead create failed: ${await leadRes.text()}`).toBeTruthy()
  const lead = await leadRes.json()
  seed.leadId = lead.id

  // CRM Opportunity (JSON body)
  const oppRes = await request.post('/api/crm/opportunity', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ name: 'E2E Test Opportunity', leadId: seed.leadId }),
  })
  expect(oppRes.ok(), `opportunity create failed: ${await oppRes.text()}`).toBeTruthy()
  const opp = await oppRes.json()
  seed.opportunityId = opp.id

  // CRM Activity (JSON body)
  const actRes = await request.post('/api/crm/activity', {
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({ type: 'call', subject: 'E2E Test Activity' }),
  })
  expect(actRes.ok(), `activity create failed: ${await actRes.text()}`).toBeTruthy()
  const act = await actRes.json()
  seed.activityId = act.id

  writeFileSync(seedPath, JSON.stringify(seed, null, 2))
})
