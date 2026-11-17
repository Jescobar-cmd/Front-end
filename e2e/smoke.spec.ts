import { test, expect } from "@playwright/test";

const EMAIL = "devin.cliente@firstgig.test";
const PASSWORD = "DevinTest1234";

test.describe("FirstGig E2E", () => {
  test("la landing page carga con su contenido", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("un visitante puede ir a la pantalla de login", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("login con credenciales validas lleva al dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    // Tras login exitoso ya no estamos en /login
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("la navegacion principal responde", async ({ page }) => {
    const respuesta = await page.goto("/");
    expect(respuesta?.ok()).toBeTruthy();
  });
});
