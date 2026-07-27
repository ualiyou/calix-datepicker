import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar.js";
import { DatePicker } from "./DatePicker.js";
import { TimeField } from "./TimeField.js";
import { gregorian } from "@calix/adapter-gregorian";
import { jalali } from "@calix/adapter-jalali";

describe("<Calendar>", () => {
  it("renders a grid with weekday headers", () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("selects a day on click and reflects aria-selected", async () => {
    const onChange = vi.fn();
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        onChange={onChange}
      />,
    );
    const grid = screen.getByRole("grid");
    const cell = within(grid).getByRole("gridcell", { name: /15 July 2026/i });
    await userEvent.click(cell);
    expect(onChange).toHaveBeenCalledOnce();
    expect(cell).toHaveAttribute("aria-selected", "true");
  });

  it("disables days outside the min/max window", () => {
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        minDate={new Date(2026, 6, 10)}
      />,
    );
    const early = screen.getByRole("gridcell", { name: "Sunday 5 July 2026" });
    expect(early).toBeDisabled();
  });

  it("navigates months with the next button", async () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByText("July 2026")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("August 2026")).toBeInTheDocument();
  });

  it("lets the user choose a month from the header", async () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    await userEvent.click(screen.getByRole("button", { name: "Choose month and year" }));
    await userEvent.click(screen.getByRole("button", { name: "Jan" }));
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("converts the visible month when the calendar adapter changes", async () => {
    const { rerender } = render(
      <Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />,
    );
    expect(screen.getByText("July 2026")).toBeInTheDocument();

    rerender(<Calendar adapter={jalali} locale="fa-IR" defaultMonth={new Date(2026, 6, 1)} />);
    await waitFor(() => expect(screen.getByText("تیر ۱۴۰۵")).toBeInTheDocument());
  });

  it("moves focus with arrow keys", async () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    const cells = screen.getAllByRole("gridcell");
    const focusable = cells.find((c) => c.getAttribute("tabindex") === "0")!;
    focusable.focus();
    await userEvent.keyboard("{ArrowRight}");
    // Focus should have moved to a different cell.
    expect(document.activeElement).not.toBe(focusable);
  });

  it("commits typed dates", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker.Root adapter={gregorian} locale="en-US" onChange={onChange} defaultOpen>
        <DatePicker.Input pattern="yyyy-MM-dd" aria-label="Birthday" />
      </DatePicker.Root>,
    );
    const input = screen.getByLabelText("Birthday");
    await userEvent.clear(input);
    await userEvent.type(input, "2026-07-03");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 6, 3));
  });

  it("closes the picker after a selection", async () => {
    render(<DatePicker adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    await userEvent.click(screen.getByRole("gridcell", { name: "Saturday 4 July 2026" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates time segments and meridiem", () => {
    const onChange = vi.fn();
    render(
      <TimeField
        hourCycle={12}
        defaultValue={{ hour: 9, minute: 30, second: 0, millisecond: 0 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("Minute"), { target: { value: "31" } });
    expect(onChange).toHaveBeenLastCalledWith({ hour: 9, minute: 31, second: 0, millisecond: 0 });
    fireEvent.click(screen.getByRole("button", { name: "Toggle AM/PM" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 21, minute: 31, second: 0, millisecond: 0 });
  });
});
