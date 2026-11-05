import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("free canvas pans, zooms, moves cards and restores its layout independently of the plan", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/app?view=map");
  await expect(page.locator(".canvas-card")).toHaveCount(6);
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(5);
  await expect(
    page.getByRole("complementary", { name: "Selected campaign details" }),
  ).toHaveCount(0);
  const pane = await page.locator(".react-flow__pane").boundingBox();
  const before = await page
    .locator(".react-flow__viewport")
    .getAttribute("style");
  await page.mouse.move(pane!.x + 25, pane!.y + 150);
  await page.mouse.down();
  await page.mouse.move(pane!.x + 125, pane!.y + 230, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".react-flow__viewport")).not.toHaveAttribute(
    "style",
    before!,
  );
  const zoomBefore = Number(
    (await page.locator(".canvas-zoom").textContent())!.replace("%", ""),
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect
    .poll(async () =>
      Number(
        (await page.locator(".canvas-zoom").textContent())!.replace("%", ""),
      ),
    )
    .toBeGreaterThan(zoomBefore);
  await page.getByRole("button", { name: "Fit all campaign cards" }).click();
  await expect(page.locator(".canvas-zoom")).toHaveText("100%");
  const handle = page.locator(
    '.react-flow__node[data-id="overview"] .canvas-card-handle',
  );
  await expect(handle).toBeInViewport();
  const box = await handle.boundingBox();
  await page.mouse.move(box!.x + 120, box!.y + 20);
  await page.mouse.down();
  await page.mouse.move(box!.x + 215, box!.y + 85, { steps: 10 });
  await page.mouse.up();
  const read = () =>
    page.evaluate(() =>
      JSON.parse(
        localStorage.getItem("daemon.canvas.v1:morrow-coffee") || "null",
      ),
    );
  await expect
    .poll(async () => (await read())?.positions?.overview?.x)
    .not.toBe(0);
  const moved = (await read()).positions.overview;
  expect(moved.x % 20).toBe(0);
  expect(moved.y % 20).toBe(0);
  const version = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("daemon.workspace.v1")!).projects[0].plan
        .version,
  );
  expect(version).toBe(1);
  await page.reload();
  await expect(page.locator(".canvas-card")).toHaveCount(6);
  expect((await read()).positions.overview).toEqual(moved);
  await page.locator(".canvas-card-project .canvas-card-content").click();
  await expect(
    page.getByRole("complementary", { name: "Selected campaign details" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close campaign details" }).click();
  await page.getByRole("button", { name: "Arrange campaign cards" }).click();
  await expect
    .poll(async () => (await read()).positions.overview)
    .toEqual({ x: 0, y: 0 });
  const violations = (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()
  ).violations;
  expect(
    violations.map((v) => ({ id: v.id, target: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  expect(errors).toEqual([]);
});

test("mobile canvas starts on the project and live plan changes keep custom positions", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.goto("/app?view=map");
  await expect(page.locator(".canvas-card")).toHaveCount(6);
  await expect(page.locator(".canvas-card-project")).toBeInViewport({
    ratio: 0.95,
  });
  const box = await page.locator(".canvas-card-project").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(391);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(781);
  const another = await context.newPage();
  await another.goto("/app");
  await another
    .getByLabel("Message the agent about this project")
    .fill("Add a product reel");
  await another
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect(page.locator('.react-flow__node[data-id="reel"]')).toHaveCount(
    1,
  );
  await expect(page.locator(".react-flow__edge-path")).toHaveCount(6);
  await page.getByRole("button", { name: "Fit all campaign cards" }).click();
  await page.locator(".canvas-card-project .canvas-card-content").click();
  await expect(
    page.getByRole("complementary", { name: "Selected campaign details" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close campaign details" }).click();
  await another
    .getByLabel("Message the agent about this project")
    .fill("Remove the product reel");
  await another
    .getByRole("button", { name: "Send message", exact: true })
    .click();
  await expect(page.locator('.react-flow__node[data-id="reel"]')).toHaveCount(
    0,
  );
  await another.close();
});
