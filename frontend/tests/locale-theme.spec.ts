import { test, expect } from "@playwright/test";

test.describe("i18n + theme", () => {
  test("switches locale from navbar", async ({ page, context }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ko");
    await expect(
      page.getByRole("heading", { name: /실시간 익명 투표|Real-time anonymous polls/i })
    ).toBeVisible();

    await page.getByTestId("locale-en").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", { name: /Real-time anonymous polls/i })
    ).toBeVisible();

    const cookies = await context.cookies();
    expect(cookies.some((cookie) => cookie.name === "locale" && cookie.value === "en")).toBe(true);
  });

  test("toggles dark mode", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await expect(page.getByTestId("theme-toggle")).toBeEnabled();
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});

test.describe("core pages", () => {
  test("renders main routes", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /실시간 익명 투표|Real-time anonymous polls/i })
    ).toBeVisible();

    await page.goto("/create");
    await expect(
      page.getByRole("heading", { name: /새로운 투표 만들기|Create a new poll/i })
    ).toBeVisible();

    await page.goto("/polls");
    await expect(
      page.getByRole("heading", { name: /진행 중인 투표|Active polls/i })
    ).toBeVisible();
  });

  test("renders vote page with mocked data", async ({ page }) => {
    await page.route(/.*\/rooms\/demo-01\/results$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          room_uuid: "demo-01",
          results: { "Option A": 1, "Option B": 2 },
          total_votes: 3,
        }),
      });
    });

    await page.route(/.*\/rooms\/demo-01$/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          uuid: "demo-01",
          title: "Demo poll",
          options: ["Option A", "Option B"],
          has_password: false,
          created_at: "2025-01-01",
        }),
      });
    });

    await page.goto("/vote/demo-01");
    await expect(page.getByRole("heading", { name: "Demo poll" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /투표하기|Cast your vote/i })).toBeVisible();
  });
});
