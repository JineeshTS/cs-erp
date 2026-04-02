import { describe, it, expect } from "vitest";
import { parseBaplie, type BaplieContainer } from "@/lib/engines/baplie-parser";

describe("parseBaplie", () => {
  it("extracts container from LOC+EQD+MEA segments", () => {
    // Minimal valid BAPLIE message with one container
    const edifact = [
      "UNH+1+BAPLIE:D:95B:UN",
      "LOC+147+010203:ZZZ:5",
      "EQD+CN+MSCU1234567+22G1",
      "MEA+AAE+VGM+KGM:28500",
      "UNT+5+1",
    ].join("'");

    const containers = parseBaplie(edifact);

    expect(containers).toHaveLength(1);
    expect(containers[0].containerNumber).toBe("MSCU1234567");
    expect(containers[0].position.bay).toBe("01");
    expect(containers[0].position.row).toBe("02");
    expect(containers[0].position.tier).toBe("03");
    expect(containers[0].containerType).toBe("22G1");
    expect(containers[0].grossWeight).toBe(28500);
  });

  it("extracts multiple containers", () => {
    const edifact = [
      "UNH+1+BAPLIE:D:95B:UN",
      "LOC+147+010102:ZZZ:5",
      "EQD+CN+TCLU1111111+22G1",
      "MEA+AAE+VGM+KGM:15000",
      "LOC+147+030204:ZZZ:5",
      "EQD+CN+MSKU2222222+42G1",
      "MEA+AAE+G+KGM:32000",
      "UNT+8+1",
    ].join("'");

    const containers = parseBaplie(edifact);

    expect(containers).toHaveLength(2);

    // First container
    expect(containers[0].containerNumber).toBe("TCLU1111111");
    expect(containers[0].position.bay).toBe("01");
    expect(containers[0].position.row).toBe("01");
    expect(containers[0].position.tier).toBe("02");
    expect(containers[0].grossWeight).toBe(15000);

    // Second container
    expect(containers[1].containerNumber).toBe("MSKU2222222");
    expect(containers[1].position.bay).toBe("03");
    expect(containers[1].position.row).toBe("02");
    expect(containers[1].position.tier).toBe("04");
    expect(containers[1].containerType).toBe("42G1");
    expect(containers[1].grossWeight).toBe(32000);
  });

  it("handles empty input", () => {
    const containers = parseBaplie("");
    expect(containers).toHaveLength(0);
    expect(containers).toEqual([]);
  });

  it("handles input with no container segments", () => {
    const edifact = "UNH+1+BAPLIE:D:95B:UN'UNT+2+1";
    const containers = parseBaplie(edifact);
    expect(containers).toHaveLength(0);
  });

  it("skips non-stowage LOC segments (LOC+6 = port, not position)", () => {
    const edifact = [
      "UNH+1+BAPLIE:D:95B:UN",
      "LOC+6+USMIA",
      "EQD+CN+ABCD1234567+22G1",
      "MEA+AAE+VGM+KGM:20000",
      "UNT+5+1",
    ].join("'");

    const containers = parseBaplie(edifact);
    // LOC+6 is not a stowage position, so no container should be extracted
    expect(containers).toHaveLength(0);
  });

  it("handles weight measurement type WT", () => {
    const edifact = [
      "LOC+147+050102:ZZZ:5",
      "EQD+CN+HLCU9876543+45G1",
      "MEA+AAE+WT+KGM:41200",
    ].join("'");

    const containers = parseBaplie(edifact);

    expect(containers).toHaveLength(1);
    expect(containers[0].grossWeight).toBe(41200);
  });

  it("handles container with missing weight (defaults to 0)", () => {
    const edifact = [
      "LOC+147+020304:ZZZ:5",
      "EQD+CN+XINU5555555+22G1",
    ].join("'");

    const containers = parseBaplie(edifact);

    expect(containers).toHaveLength(1);
    expect(containers[0].containerNumber).toBe("XINU5555555");
    expect(containers[0].grossWeight).toBe(0);
  });

  it("parses position with short string (padded to 6 digits)", () => {
    const edifact = [
      "LOC+147+1234:ZZZ:5",
      "EQD+CN+PADC0000001+22G1",
    ].join("'");

    const containers = parseBaplie(edifact);

    expect(containers).toHaveLength(1);
    // "1234" padded to "001234" => bay=00, row=12, tier=34
    expect(containers[0].position.bay).toBe("00");
    expect(containers[0].position.row).toBe("12");
    expect(containers[0].position.tier).toBe("34");
  });
});
