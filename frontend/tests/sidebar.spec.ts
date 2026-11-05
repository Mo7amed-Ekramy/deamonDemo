import { test, expect } from "@playwright/test";

test("sidebar groups project conversations, keeps long conversations contained, and collapses", async ({
  page,
}) => {
  await page.goto("/app");
  const sidebar = page.getByRole("complementary", {
    name: "Workspace navigation",
    exact: true,
  });
  await expect(
    sidebar.getByRole("button", { name: "New project", exact: true }),
  ).toBeVisible();
  const views = page.getByRole("navigation", { name: "Campaign views" });
  await expect(sidebar.getByRole("button", { name: "Campaign map" })).toHaveCount(0);
  await expect(sidebar.getByRole("button", { name: "Creative preview" })).toHaveCount(0);
  await views.getByRole("button", { name: "Campaign map" }).click();
  await expect(page.locator(".campaign-canvas")).toBeVisible();
  await views.getByRole("button", { name: "Ad preview" }).click();
  await expect(page.locator(".dc-social")).toBeVisible();
  await sidebar
    .getByRole("navigation", { name: "Project conversations" })
    .getByRole("button", { name: "Campaign planning", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Campaign planning",
  );
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("daemon.workspace.v1")!);
    const project = state.projects[0];
    project.chats.push(
      ...Array.from({ length: 24 }, (_, index) => ({
        id: `conversation-${index}`,
        title: `Campaign conversation ${index} with a long descriptive title`,
        messages: [],
        draft: "",
      })),
    );
    project.activeChat = "conversation-23";
    localStorage.setItem("daemon.workspace.v1", JSON.stringify(state));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "daemon.workspace.v1",
        newValue: JSON.stringify(state),
      }),
    );
  });
  await expect(
    sidebar
      .getByRole("navigation", { name: "Project conversations" })
      .getByRole("button"),
  ).toHaveCount(26);
  await page.reload();
  const list = sidebar.getByRole("navigation", {
    name: "Project conversations",
  });
  await expect(list.getByRole("button")).toHaveCount(26);
  await expect(list.locator('[aria-current="page"]')).toBeInViewport();
  const layout = await sidebar.locator(".sidebar-folders").evaluate((el) => ({
    content: el.scrollHeight,
    height: el.clientHeight,
  }));
  expect(layout.content).toBeGreaterThan(layout.height);
  await expect(sidebar.locator(".sidebar-profile")).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(1001);
  await sidebar.getByRole("button", { name: "Hide project sidebar" }).click();
  await expect(sidebar).not.toBeVisible();
  await page.getByRole("button", { name: "Show project sidebar" }).click();
  await expect(sidebar).toBeVisible();
  await sidebar.getByRole("button", { name: "New chat in Morrow Coffee", exact: true }).click();
  await expect(list.getByRole("button")).toHaveCount(27);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("New chat");
});
