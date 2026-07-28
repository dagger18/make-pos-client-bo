import { test as setup } from '@playwright/test'
import * as path from 'path'
import { LoginPage } from '../pages/LoginPage'

const authFile = path.join(__dirname, '../../playwright/.auth/user.json')

setup('authenticate', async ({ page }) => {
  const login = new LoginPage(page)
  await login.goto()
  await login.login(process.env.E2E_USERNAME!, process.env.E2E_PASSWORD!)
  await page.waitForURL(url => !url.pathname.includes('/login'))
  await page.context().storageState({ path: authFile })
})
