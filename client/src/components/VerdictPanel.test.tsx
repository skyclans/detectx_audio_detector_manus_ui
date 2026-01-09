/**
 * VerdictPanel Execution Test
 * 
 * Tests using DetectX-provided sample data (DO NOT MODIFY).
 * Verifies that verdict text is rendered verbatim.
 */

import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { VerdictPanel } from "./VerdictPanel";

// Sample data for execution testing (DO NOT MODIFY)
const SAMPLE_OBSERVED = {
  verdict: "AI signal evidence was observed." as const,
  authority: "CR-G" as const,
  exceeded_axes: ["G3_A_BAND_GEOMETRY"],
};

const SAMPLE_NOT_OBSERVED = {
  verdict: "AI signal evidence was not observed." as const,
  authority: "CR-G" as const,
  exceeded_axes: [],
};

describe("VerdictPanel - DetectX Contract Compliance", () => {
  beforeEach(() => {
    cleanup();
  });

  it("renders null result as 'no result yet' state", () => {
    render(<VerdictPanel verdict={null} />);
    expect(
      screen.getByText("Upload and verify an audio file to see results")
    ).toBeTruthy();
  });

  it("renders processing state as 'inspecting structural signals'", () => {
    render(<VerdictPanel verdict={null} isProcessing={true} />);
    expect(
      screen.getByText("Inspecting structural signals...")
    ).toBeTruthy();
  });

  it("renders Observed verdict text verbatim", () => {
    render(<VerdictPanel verdict={SAMPLE_OBSERVED} />);
    expect(
      screen.getByText("AI signal evidence was observed.")
    ).toBeTruthy();
  });

  it("renders Not Observed verdict text verbatim", () => {
    render(<VerdictPanel verdict={SAMPLE_NOT_OBSERVED} />);
    expect(
      screen.getByText("AI signal evidence was not observed.")
    ).toBeTruthy();
  });

  it("displays authority verbatim", () => {
    render(<VerdictPanel verdict={SAMPLE_OBSERVED} />);
    expect(screen.getByText("CR-G")).toBeTruthy();
  });

  it("displays exceeded_axes as contextual information only", () => {
    render(<VerdictPanel verdict={SAMPLE_OBSERVED} />);
    expect(screen.getByText("G3_A_BAND_GEOMETRY")).toBeTruthy();
  });

  it("does not display exceeded_axes section when empty", () => {
    render(<VerdictPanel verdict={SAMPLE_NOT_OBSERVED} />);
    expect(screen.queryByText("Exceeded Axes")).toBeNull();
  });
});
