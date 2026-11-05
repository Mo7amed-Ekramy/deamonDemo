import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("marketing, proposed plans and complete account flows", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A whole campaign.",
  );
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Pricing", exact: true })
    .click();
  await expect(page).toHaveURL(/#pricing/);
  await expect(
    page.locator(".dp-price").filter({ hasText: "Pricing to be announced" }),
  ).toHaveCount(2);
  await page.getByRole("link", { name: "Explore Agency" }).click();
  await expect(
    page.getByRole("button", { name: "Agency", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByLabel("Agency name").fill("Sample Studio");
  await page.getByLabel("Email address").fill("local@example.com");
  await page.locator("#password").fill("sample-passphrase");
  await page.locator("#confirm").fill("different-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("alert")).toContainText("passwords don’t match");
  await page.locator("#confirm").fill("sample-passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hello, possibility.",
  );
  await page.getByRole("link", { name: "Open demo workspace" }).click();
  await expect(page.locator(".sidebar-profile")).toContainText("Sample Studio");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "sample-passphrase",
  );
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "local@example.com",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill("local@example.com");
  await page.locator("#password").fill("sample-passphrase");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hello, possibility.",
  );
  await page.goto("/forgot-password");
  await page.getByLabel("Email address").fill("reset@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Check your inbox.",
  );
  await page.getByRole("link", { name: "Preview the reset link" }).click();
  await page.locator("#password").fill("fresh-passphrase");
  await page.locator("#confirm").fill("fresh-passphrase");
  await page.getByRole("button", { name: "Show new password" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Reset password", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "You’re all set.",
  );
  expect(errors).toEqual([]);
});

test("project chats update one durable plan, approvals track versions, projects stay isolated", async ({
  page,
}) => {
  await page.goto("/app");
  await page
    .locator(".dc-nav")
    .getByRole("button", { name: "New chat in Morrow Coffee", exact: true })
    .click();
  await page
    .getByRole("button", { name: "+ Add a product reel", exact: true })
    .click();
  await expect(page.locator(".dc-header")).toContainText("Shared plan v2");
  await page
    .getByRole("navigation", { name: "Project conversations" })
    .getByRole("button", { name: "Campaign planning" })
    .click();
  await expect(page.locator(".dc-messages .dc-user")).toHaveCount(1);
  await page.getByRole("button", { name: /^Outputs/ }).click();
  await expect(
    page.getByRole("complementary", { name: "Shared project outputs" }),
  ).toContainText("Product reel");
  await page.reload();
  await expect(page.locator(".dc-header")).toContainText("Shared plan v2");
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Campaign map" })
    .click();
  await page
    .getByRole("button", { name: /Product reel 15s storyboard/ })
    .click();
  await page.getByRole("button", { name: "Preview storyboard" }).click();
  await page.getByRole("button", { name: "10–15s · Invite" }).click();
  await expect(page.locator(".dc-ad-title")).toContainText("Starts at Morrow");
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Campaign map" })
    .click();
  await page.locator(".canvas-card-project .canvas-card-content").click();
  await page.getByRole("button", { name: "Approve plan v2" }).click();
  await expect(page.locator(".dc-status")).toHaveText("Approved · demo");
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Chat", exact: true })
    .click();
  await page
    .getByLabel("Message the agent about this project")
    .fill("Set the ad budget to EGP 4,000.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Campaign map" })
    .click();
  await expect(page.locator(".dc-status")).toHaveText("Changes need review");
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Chat", exact: true })
    .click();
  await page
    .getByLabel("Message the agent about this project")
    .fill("Make the campaign 21 days");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: /^Outputs/ }).click();
  await page
    .getByLabel("Output language", { exact: true })
    .selectOption("English");
  await expect(page.locator(".dc-header")).toContainText("Shared plan v5");
  await page
    .getByRole("navigation", { name: "Campaign views" })
    .getByRole("button", { name: "Ad preview" })
    .click();
  await expect(page.locator(".dc-caption")).toHaveAttribute("lang", "en");
  await page
    .locator(".dc-nav")
    .getByRole("button", { name: "New project", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Project / business name")
    .fill("Noura Studio");
  await page
    .getByRole("dialog")
    .getByLabel("What are we working on?")
    .fill("Introduce a furniture collection in Cairo.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page.locator(".dc-header")).toContainText("Noura Studio");
  await expect(page.locator(".dc-header")).toContainText("Shared plan v1");
  await page.getByRole("button", { name: /^Outputs/ }).click();
  await expect(
    page
      .getByRole("complementary", { name: "Shared project outputs" })
      .getByRole("button", { name: /^Product reel/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Morrow Coffee", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Project conversations" })
    .getByRole("button", { name: "Campaign planning", exact: true })
    .click();
  await expect(page.locator(".dc-header")).toContainText("Shared plan v5");
  await page.reload();
  await expect(page.locator(".dc-header")).toContainText("Shared plan v5");
  await page
    .getByLabel("Message the agent about this project")
    .fill("Remove the product reel.");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByRole("button", { name: /^Outputs/ }).click();
  await expect(
    page
      .getByRole("complementary", { name: "Shared project outputs" })
      .getByRole("button", { name: /^Product reel/ }),
  ).toHaveCount(0);
});

test("responsive layouts, light theme, keyboard navigation and accessibility", async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/app",
      "/app?view=map",
      "/app?view=preview",
    ]) {
      await page.goto(route);
      const dimensions = await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${route} at ${width}px`).toBeLessThanOrEqual(
        width + 1,
      );
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  for (const theme of ["light", "dark"]) {
    await page.evaluate((t) => {
      localStorage.setItem("daemon.theme", t);
    }, theme);
    for (const route of ["/", "/login", "/signup", "/app", "/app?view=map"]) {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          elements: v.nodes.map((n) => n.target),
        })),
        `${route}, ${theme}`,
      ).toEqual([]);
    }
  }
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "Welcome back." }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.goto("/not-a-page");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "different direction",
  );
});
