import { expect, test } from "@playwright/test";

test("recorre inicio, catálogo, curso y lección interactiva", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/configuracion");
  await page.getByRole("checkbox", { name: /conectar sin arrastrar/i }).check();

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /aprende practicando/i }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Explorar el catálogo" }).click();
  await expect(
    page.getByRole("heading", { name: "Cursos" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Fundamentos de electricidad" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Fundamentos de electricidad" }).click();
  await expect(
    page.getByRole("heading", { name: "Fundamentos de electricidad" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /comenzar/i })).toBeVisible();

  await page.getByRole("link", { name: /comenzar/i }).click();
  await expect(
    page.getByText(/meta:\s*haz que la ampolleta se encienda/i),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Comprobar" })).toBeVisible();
  await expect(page.getByTestId("switch-toggle")).toBeVisible();

  const origin = page.getByLabel("Origen");
  const destino = page.getByLabel("Destino");
  const unir = page.getByRole("button", { name: "Unir" });

  async function unirTerminales(from: string, to: string) {
    await origin.selectOption({ label: from });
    await destino.selectOption({ label: to });
    await unir.click({ force: true });
  }

  await unirTerminales("Batería · polo +", "Interruptor · borne A");
  await unirTerminales("Interruptor · borne B", "Portalámparas · borne A");
  await unirTerminales("Portalámparas · borne B", "Batería · polo −");
  await page.getByTestId("switch-toggle").click();
  await page.getByRole("button", { name: "Comprobar" }).click();

  await expect(page.getByText(/el circuito está cerrado/i)).toBeVisible();
  await expect(page.getByText(/lección completada/i)).toBeVisible();
  await page.getByRole("button", { name: /^aceptar$/i }).click();
  await expect(
    page.getByRole("link", { name: /siguiente lección/i }),
  ).toBeVisible();
});

test("el interruptor parte cableado y se enciende al cerrarlo", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto(
    "/cursos/fundamentos-de-electricidad/lecciones/el-interruptor",
  );
  await expect(
    page.getByText(/meta:\s*enciende el interruptor/i),
  ).toBeVisible();
  await expect(page.getByTestId("switch-toggle")).toBeVisible();
  await page.getByTestId("switch-toggle").click();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/el circuito está cerrado/i)).toBeVisible();
  await expect(page.getByText(/lección completada/i)).toBeVisible();
});

test("corriente y seguridad parte con un corto en el tablero", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto(
    "/cursos/fundamentos-de-electricidad/lecciones/corriente-y-seguridad",
  );
  await expect(page.getByText(/meta:\s*quita el corto/i)).toBeVisible();
  await page.getByRole("button", { name: "Comprobar" }).click();
  await expect(page.getByText(/hay un corto/i)).toBeVisible();
  await page.locator("path.cable-hit").first().dblclick({ force: true });
  await page.getByRole("button", { name: "Solución" }).click();
  await expect(page.getByText(/lección completada/i)).toBeVisible();
});

test("el botón Solución arma el circuito completo", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(
    "/cursos/fundamentos-de-electricidad/lecciones/circuito-simple",
  );
  await expect(
    page.getByRole("button", { name: "Solución" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Solución" }).click();
  await expect(page.getByText(/esta es una solución/i)).toBeVisible();
  await expect(page.getByText(/la ampolleta se ilumina/i)).toBeVisible();
  await expect(page.getByText(/lección completada/i)).toBeVisible();
});
