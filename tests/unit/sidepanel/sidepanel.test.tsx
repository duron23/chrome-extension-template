//import { it, expect, describe } from "vitest";
//no need for this statement as globals is true in config file vitest.config.ts, also types root disable
// and types mentioned in tsconfig
//import "@testing-library/jest-dom/vitest"; // not needed because of setup.ts file
import { render, screen } from "@testing-library/react";
import SidePanel from "../../../src/sidepanel/sidepanel";

//import userEvent from "@testing-library/user-event";
import React from "react";

describe("Template", () => {
  it("should be successful", () => {
    render(<SidePanel />);

    const sidepanel = screen.getByRole("heading");

    expect(sidepanel).toBeInTheDocument();
  });
});
