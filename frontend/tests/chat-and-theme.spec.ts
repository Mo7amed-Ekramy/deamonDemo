import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("conversation stays prominent; outputs and navigation are optional", async ({
  page,
}) => {
  for (const width of [1440, 1024, 390, 320]) {
    await page.setViewportSize({ width, height: 780 });
    await page.goto("/app");
    await expect(
      page.getByRole("complementary", { name: "Shared project outputs" }),
    ).toHaveCount(0);
    const messages = await page.locator(".dc-messages").boundingBox();
    expect(messages!.height).toBeGreaterThan(390);
    const composer = await page.locator(".dc-composer").boundingBox();
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(781);
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeLessThanOrEqual(781);
    await page.getByRole("button", { name: /^Outputs/ }).click();
    await expect(
      page.getByRole("complementary", { name: "Shared project outputs" }),
    ).toBeVisible();
    if (width <= 1100) {
      await expect(
        page.getByRole("dialog", { name: "Project outputs", exact: true }),
      ).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations.map((v) => v.id)).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: /^Outputs/ }),
      ).toBeFocused();
    } else {
      await page.getByRole("button", { name: "Close project outputs" }).click();
      await page.getByRole("button", { name: "Hide project sidebar" }).click();
      await expect(page.locator(".dc-nav")).not.toBeVisible();
      await page.getByRole("button", { name: "Show project sidebar" }).click();
    }
    await expect(
      page.getByRole("complementary", { name: "Shared project outputs" }),
    ).toHaveCount(0);
    await page
      .getByLabel("Message the agent about this project")
      .fill("Add a 15-second product reel");
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    await expect(page.locator(".dc-messages")).toContainText("shared plan");
    await page.getByRole("button", { name: /^Outputs/ }).click();
    await expect(
      page
        .getByRole("complementary", { name: "Shared project outputs" })
        .getByRole("button", { name: /^Product reel/ }),
    ).toBeVisible();
  }
});

test("theme reveal runs and preserves position; reduced motion and fallback work", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page.evaluate(() =>
        document
          .getAnimations()
          .some(
            (a) =>
              (a.effect as KeyframeEffect | null)?.pseudoElement ===
              "::view-transition-new(root)",
          ),
      ),
    )
    .toBe(true);
  await expect(page.locator("html")).not.toHaveClass(/theme-revealing/);
  await expect(
    page.getByRole("button", { name: "Switch to dark mode" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveClass(/theme-revealing/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("html")).not.toHaveClass(
    /theme-revealing|theme-fading/,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() =>
    Object.defineProperty(document, "startViewTransition", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).not.toHaveClass(/theme-fading/);
  expect(errors).toEqual([]);
});
