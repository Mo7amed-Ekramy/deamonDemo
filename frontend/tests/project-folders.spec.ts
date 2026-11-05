import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("project folders disclose their own chats and can start chats across projects", async ({
  page,
}) => {
  await page.goto("/app");
  const sidebar = page.getByRole("complementary", {
    name: "Workspace navigation",
  });
  const morrow = sidebar.getByRole("button", { name: "Morrow Coffee", exact: true });
  await expect(morrow).toHaveAttribute("aria-expanded", "true");
  await morrow.focus();
  await page.keyboard.press("Enter");
  await expect(morrow).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.getByRole("button", { name: "Campaign planning" })).toBeHidden();

  await sidebar.getByRole("button", { name: "New project", exact: true }).click();
  const create = page.getByRole("dialog", { name: "Create a project." });
  await create.getByLabel("Project / business name").fill("Noura Studio");
  await create.getByLabel("What are we working on?").fill("Launch new furniture.");
  await create.getByRole("button", { name: "Create project", exact: true }).click();
  const noura = sidebar.getByRole("button", { name: "Noura Studio", exact: true });
  await expect(noura).toHaveAttribute("aria-expanded", "true");
  await morrow.click();
  await expect(noura).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".dc-header")).toContainText("Noura Studio");
  await sidebar.getByRole("button", { name: "Campaign planning" }).click();
  await expect(page.locator(".dc-header")).toContainText("Morrow Coffee");

  await sidebar.getByRole("button", { name: "New chat in Noura Studio" }).click();
  await expect(noura).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".dc-header")).toContainText("Noura Studio");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New chat");
  await expect(sidebar.getByRole("button", { name: "New chat", exact: true }))
    .toHaveAttribute("aria-current", "page");

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => localStorage.setItem("daemon.theme", value), theme);
    await page.reload();
    await expect(noura).toHaveAttribute("aria-expanded", "true");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((node) => node.target),
    }))).toEqual([]);
  }
});
