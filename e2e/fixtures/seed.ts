import { readFileSync } from 'fs'
import * as path from 'path'

export interface SeedData {
  branchId: number
  branchName: string
  departmentId: number
  departmentName: string
  groupId: number
  groupName: string
  clientId: number
  clientName: string
  providerId: number
  providerName: string
  hsCodeId: number
  quoteId: number
  shipmentId: number
  consolidationId: number
  leadId: number
  opportunityId: number
  activityId: number
}

const seedPath = path.join(__dirname, '../../playwright/.auth/seed.json')

export const seed: SeedData = JSON.parse(readFileSync(seedPath, 'utf-8'))
