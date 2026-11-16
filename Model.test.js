import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function loadModel() {
  const src = readFileSync(join(import.meta.dir, "Model.js"), "utf8")
    .replace(/^\s*\.pragma\s+library\s*$/m, "");
  const fn = new Function(
    `${src}
return {
  imperial,
  windUnitLabel,
  buildForecastUrl,
};`
  );
  return fn();
}

describe("Model units", () => {
  test("windUnitLabel returns km/h for metric and mph for imperial/default", () => {
    const Model = loadModel();
    expect(Model.windUnitLabel("metric")).toBe("km/h");
    expect(Model.windUnitLabel("imperial")).toBe("mph");
    expect(Model.windUnitLabel("auto")).toBe("mph");
    expect(Model.windUnitLabel(undefined)).toBe("mph");
  });

  test("buildForecastUrl wind_speed_unit matches windUnitLabel", () => {
    const Model = loadModel();
    const metricUrl = Model.buildForecastUrl(51.10286, 17.03006, "metric");
    expect(metricUrl).toContain("temperature_unit=celsius");
    expect(metricUrl).toContain("wind_speed_unit=kmh");
    expect(Model.windUnitLabel("metric")).toBe("km/h");

    const imperialUrl = Model.buildForecastUrl(51.10286, 17.03006, "imperial");
    expect(imperialUrl).toContain("temperature_unit=fahrenheit");
    expect(imperialUrl).toContain("wind_speed_unit=mph");
    expect(Model.windUnitLabel("imperial")).toBe("mph");
  });
});
