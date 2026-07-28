import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "./Calendar.js";
import { DatePicker } from "./DatePicker.js";
import { TimeField, TimePicker } from "./TimeField.js";
import { MonthPicker, YearPicker } from "./PickerViews.js";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";
import { internationalHolidays } from "@alydev/holidays-international";

describe("<Calendar>", () => {
  it("renders a grid with weekday headers", () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
  });

  it("uses configured labels and the light theme", () => {
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        theme="light"
        labels={{ weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"], nextMonth: "Later" }}
      />,
    );
    expect(screen.getByText("Su")).toBeInTheDocument();
    expect(screen.getByLabelText("Later")).toBeInTheDocument();
    expect(screen.getByRole("grid").closest(".calix-calendar")).toHaveAttribute(
      "data-theme",
      "light",
    );
  });

  it("supports callback header and footer slots with calendar actions", async () => {
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        classNames={{ footer: "custom-footer", footerButton: "custom-footer-button" }}
        header={(calendar) => (
          <button type="button" onClick={calendar.goToNextMonth}>
            Custom title
          </button>
        )}
        footer={(calendar) => (
          <button type="button" onClick={calendar.clear}>
            Reset calendar
          </button>
        )}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Custom title" }));
    expect(screen.getByRole("gridcell", { name: "Saturday 1 August 2026" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reset calendar" }));
  });

  it("uses Persian built-in labels for a Jalali locale", () => {
    render(<Calendar adapter={jalali} locale="fa-IR" />);
    expect(screen.getByLabelText("ماه بعد")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "انتخاب ماه و سال" })).toBeInTheDocument();
  });

  it("offers today and clear controls", async () => {
    const onChange = vi.fn();
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultValue={new Date(2026, 6, 4)}
        showToday
        showClear
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    await userEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByRole("gridcell", { current: "date" })).toHaveFocus();
    expect(screen.getByRole("gridcell", { current: "date" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(onChange).toHaveBeenLastCalledWith(gregorian.toDate(gregorian.today()));
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

  it("decorates an opt-in holiday in Gregorian and Jalali views without disabling it", async () => {
    const onChange = vi.fn();
    const holiday = internationalHolidays.find((item) => item.date.getFullYear() === 2026)!;
    const { rerender } = render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={holiday.date}
        holidayData={[holiday]}
        showHolidays
        onChange={onChange}
      />,
    );
    const gregorianDay = screen.getByTitle(holiday.name);
    expect(gregorianDay).toHaveAttribute("data-holiday");
    expect(gregorianDay).toHaveAttribute("data-holiday-name", holiday.name);
    expect(gregorianDay).toBeEnabled();
    await userEvent.click(gregorianDay);
    expect(onChange).toHaveBeenCalledWith(holiday.date);

    rerender(
      <Calendar
        adapter={jalali}
        locale="fa-IR"
        defaultMonth={holiday.date}
        holidayData={[holiday]}
        showHolidays
      />,
    );
    expect(screen.getByTitle(holiday.name)).toHaveAttribute("data-holiday");
  });

  it("hides holidays by default and can make them unavailable", async () => {
    const onChange = vi.fn();
    const holiday = { date: new Date(2026, 6, 15), name: "تعطیلی آزمایشی" };
    const { rerender } = render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={holiday.date}
        holidayData={[holiday]}
        onChange={onChange}
      />,
    );
    expect(screen.queryByTitle(holiday.name)).not.toBeInTheDocument();
    expect(screen.getByRole("gridcell", { name: "Wednesday 15 July 2026" })).toBeEnabled();

    rerender(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={holiday.date}
        holidayData={[holiday]}
        showHolidays
        holidaysSelectable={false}
        onChange={onChange}
      />,
    );
    const day = screen.getByTitle(holiday.name);
    expect(day).toBeDisabled();
    await userEvent.click(day);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("serializes selection output as text or JSON", async () => {
    const text = vi.fn();
    const json = vi.fn();
    const { rerender } = render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        outputPattern="dd/MM/yyyy"
        onOutputChange={text}
      />,
    );
    await userEvent.click(screen.getByRole("gridcell", { name: "Wednesday 15 July 2026" }));
    expect(text).toHaveBeenLastCalledWith("15/07/2026");

    rerender(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        outputFormat="json"
        onOutputChange={json}
      />,
    );
    await userEvent.click(screen.getByRole("gridcell", { name: "Wednesday 15 July 2026" }));
    expect(JSON.parse(json.mock.lastCall![0])).toEqual({
      dateTime: "2026-07-15 00:00:00",
      date: "2026-07-15",
      time: "00:00:00",
      year: 2026,
      month: 7,
      day: 15,
    });
  });

  it("serializes both range endpoints", async () => {
    const onOutputChange = vi.fn();
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        mode="range"
        defaultMonth={new Date(2026, 6, 1)}
        outputFormat="json"
        onOutputChange={onOutputChange}
      />,
    );
    await userEvent.click(screen.getByRole("gridcell", { name: "Wednesday 15 July 2026" }));
    await userEvent.click(screen.getByRole("gridcell", { name: "Friday 17 July 2026" }));
    expect(JSON.parse(onOutputChange.mock.lastCall![0])).toMatchObject({
      start: { date: "2026-07-15", year: 2026, month: 7, day: 15 },
      end: { date: "2026-07-17", year: 2026, month: 7, day: 17 },
    });
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

  it("disables days from the adjacent month until that month is visible", async () => {
    const onChange = vi.fn();
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("gridcell", { name: "Saturday 1 August 2026" })).toBeDisabled();
    await userEvent.click(screen.getByLabelText("Next month"));
    const augustFirst = screen.getByRole("gridcell", { name: "Saturday 1 August 2026" });
    expect(augustFirst).toBeEnabled();
    await userEvent.click(augustFirst);
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 1));
  });

  it("disables September days at the end of an August grid", () => {
    render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 7, 1)}
        numberOfMonths={2}
      />,
    );

    const [augustGrid, septemberGrid] = screen.getAllByRole("grid");
    expect(
      within(augustGrid!).getByRole("gridcell", { name: "Tuesday 1 September 2026" }),
    ).toBeDisabled();
    expect(
      within(septemberGrid!).getByRole("gridcell", { name: "Tuesday 1 September 2026" }),
    ).toBeEnabled();
  });

  it("does not select an adjacent-month day in the date picker", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 7, 1)}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    const septemberFirst = screen.getByRole("gridcell", { name: "Tuesday 1 September 2026" });
    expect(septemberFirst).toBeDisabled();
    await userEvent.click(septemberFirst);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("navigates months with the next button", async () => {
    render(<Calendar adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    expect(screen.getByText("July 2026")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByText("August 2026")).toBeInTheDocument();
  });

  it("supports wheel and touch month navigation when infinite scrolling is enabled", () => {
    const { container } = render(
      <Calendar
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        infiniteScroll
      />,
    );
    const months = container.querySelector(".calix-months")!;

    fireEvent.wheel(months, { deltaY: 30 });
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    fireEvent.touchStart(months, { touches: [{ clientX: 100 }] });
    fireEvent.touchEnd(months, { changedTouches: [{ clientX: 150 }] });
    expect(screen.getByText("July 2026")).toBeInTheDocument();
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

  it("renders standalone month and year pickers", async () => {
    render(
      <>
        <MonthPicker adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />
        <YearPicker adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Jan" }));
    await userEvent.click(screen.getByRole("button", { name: "Next years" }));
    expect(screen.getAllByRole("grid")).toHaveLength(2);
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

  it("masks date input and ignores Enter while composing", () => {
    const onChange = vi.fn();
    render(
      <DatePicker.Root adapter={gregorian} locale="en-US" onChange={onChange}>
        <DatePicker.Input mask aria-label="Masked date" />
      </DatePicker.Root>,
    );
    const input = screen.getByLabelText("Masked date");

    fireEvent.change(input, { target: { value: "20260703" } });
    expect(input).toHaveValue("2026/07/03");
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 6, 3));
  });

  it("shows today in the default compound picker content", () => {
    render(
      <DatePicker.Root adapter={gregorian} locale="en-US" defaultOpen>
        <DatePicker.Input aria-label="Birthday" />
        <DatePicker.Content portal={false} />
      </DatePicker.Root>,
    );
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("closes the picker from the localized cancel control", async () => {
    render(<DatePicker adapter={jalali} locale="fa-IR" defaultOpen />);
    await userEvent.click(screen.getByRole("button", { name: "انصراف" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the picker after a selection", async () => {
    render(<DatePicker adapter={gregorian} locale="en-US" defaultMonth={new Date(2026, 6, 1)} />);
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("gridcell", { name: "Saturday 4 July 2026" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses a text input and calendar button in the default picker", async () => {
    render(<DatePicker adapter={gregorian} locale="en-US" placeholder="Choose a date" />);
    const input = screen.getByPlaceholderText("Choose a date");
    const toggle = screen.getByRole("button", { name: "Choose a date" });

    await userEvent.click(input);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("connects an input to its popover and opens it from the keyboard", async () => {
    render(<DatePicker adapter={gregorian} locale="en-US" placeholder="Choose a date" />);
    const input = screen.getByRole("combobox", { name: "Choose a date" });

    expect(input).toHaveAttribute("aria-haspopup", "dialog");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(input);
    const dialog = screen.getByRole("dialog");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", dialog.id);
    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("clears the default date picker from its input", async () => {
    const onChange = vi.fn();
    render(
      <DatePicker
        adapter={gregorian}
        locale="en-US"
        defaultValue={new Date(2026, 6, 4)}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("dismisses the picker with Escape and an outside click", async () => {
    render(
      <>
        <button type="button">Outside</button>
        <DatePicker adapter={gregorian} locale="en-US" />
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select date" })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("positions the popover below its trigger", async () => {
    const innerWidth = Object.getOwnPropertyDescriptor(window, "innerWidth");
    const clientWidth = Object.getOwnPropertyDescriptor(document.documentElement, "clientWidth");
    const clientHeight = Object.getOwnPropertyDescriptor(document.documentElement, "clientHeight");
    Object.defineProperties(document.documentElement, {
      clientWidth: { configurable: true, value: 1024 },
      clientHeight: { configurable: true, value: 768 },
    });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const popover = this.hasAttribute("data-calix-popover");
        return {
          bottom: popover ? 100 : 40,
          height: popover ? 100 : 20,
          left: popover ? 0 : 100,
          right: popover ? 200 : 200,
          top: popover ? 0 : 20,
          width: popover ? 200 : 100,
        } as DOMRect;
      });

    render(
      <DatePicker.Root adapter={gregorian} locale="en-US" defaultOpen>
        <DatePicker.Trigger>Choose date</DatePicker.Trigger>
        <DatePicker.Content portal={false} />
      </DatePicker.Root>,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveStyle({ position: "fixed" }));
    rect.mockRestore();
    Object.defineProperty(window, "innerWidth", innerWidth!);
    if (clientWidth) Object.defineProperty(document.documentElement, "clientWidth", clientWidth);
    else delete (document.documentElement as { clientWidth?: number }).clientWidth;
    if (clientHeight) Object.defineProperty(document.documentElement, "clientHeight", clientHeight);
    else delete (document.documentElement as { clientHeight?: number }).clientHeight;
  });

  it("keeps the default popover below the trigger when space is limited", async () => {
    const innerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
    const clientWidth = Object.getOwnPropertyDescriptor(document.documentElement, "clientWidth");
    const clientHeight = Object.getOwnPropertyDescriptor(document.documentElement, "clientHeight");
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
    Object.defineProperties(document.documentElement, {
      clientWidth: { configurable: true, value: 1024 },
      clientHeight: { configurable: true, value: 768 },
    });
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const popover = this.hasAttribute("data-calix-popover");
        return {
          bottom: popover ? 100 : 760,
          height: popover ? 100 : 20,
          left: popover ? 0 : 100,
          right: popover ? 200 : 200,
          top: popover ? 0 : 740,
          width: popover ? 200 : 100,
        } as DOMRect;
      });

    render(
      <DatePicker.Root adapter={gregorian} locale="en-US" defaultOpen>
        <DatePicker.Trigger>Choose date</DatePicker.Trigger>
        <DatePicker.Content portal={false} />
      </DatePicker.Root>,
    );
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveStyle({ position: "fixed" }));
    rect.mockRestore();
    Object.defineProperty(window, "innerHeight", innerHeight!);
    if (clientWidth) Object.defineProperty(document.documentElement, "clientWidth", clientWidth);
    else delete (document.documentElement as { clientWidth?: number }).clientWidth;
    if (clientHeight) Object.defineProperty(document.documentElement, "clientHeight", clientHeight);
    else delete (document.documentElement as { clientHeight?: number }).clientHeight;
  });

  it("shows time after selecting a date and includes it in the value", async () => {
    const onChange = vi.fn();
    const onOutputChange = vi.fn();
    render(
      <DatePicker
        adapter={gregorian}
        locale="en-US"
        defaultMonth={new Date(2026, 6, 1)}
        withTime
        onChange={onChange}
        outputFormat="json"
        onOutputChange={onOutputChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Select date" }));
    await userEvent.click(screen.getByRole("gridcell", { name: "Saturday 4 July 2026" }));
    expect(screen.getByRole("group", { name: "Time" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Now" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Hour 14" }));
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 6, 4, 14));
    expect(JSON.parse(onOutputChange.mock.lastCall![0])).toMatchObject({
      dateTime: "2026-07-04 14:00:00",
      date: "2026-07-04",
      time: "14:00:00",
      year: 2026,
      month: 7,
      day: 4,
    });
    expect(screen.getByRole("button", { name: "2026/07/04 14:00" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates time segments and meridiem", () => {
    const onChange = vi.fn();
    render(
      <TimeField
        hourCycle={12}
        theme="light"
        labels={{ minute: "دقیقه", toggleMeridiem: "تغییر صبح/شب" }}
        defaultValue={{ hour: 9, minute: 30, second: 0, millisecond: 0 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByLabelText("دقیقه"), { target: { value: "31" } });
    expect(onChange).toHaveBeenLastCalledWith({ hour: 9, minute: 31, second: 0, millisecond: 0 });
    fireEvent.click(screen.getByRole("button", { name: "تغییر صبح/شب" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 21, minute: 31, second: 0, millisecond: 0 });
    expect(screen.getByRole("group")).toHaveAttribute("data-theme", "light");
  });

  it("supports the analog time view", async () => {
    const onChange = vi.fn();
    render(
      <TimeField
        variant="analog"
        defaultValue={{ hour: 9, minute: 0, second: 0, millisecond: 0 }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("listbox", { name: "Hour" })).toHaveStyle({
      "--calix-clock-hour-angle": "270deg",
      "--calix-clock-minute-angle": "0deg",
    });
    expect(screen.getByRole("option", { name: "Hour 00" })).toHaveStyle({
      "--calix-clock-angle": "0deg",
      "--calix-clock-radius": "3.75rem",
    });
    expect(screen.getByRole("option", { name: "Hour 12" })).toHaveStyle({
      "--calix-clock-angle": "0deg",
      "--calix-clock-radius": "6.75rem",
    });
    await userEvent.click(screen.getByRole("option", { name: "Hour 14" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 14, minute: 0, second: 0, millisecond: 0 });
    expect(screen.getByRole("listbox", { name: "Minute" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Minute 05" })).toHaveStyle({
      "--calix-clock-angle": "30deg",
    });
    await userEvent.click(screen.getByRole("option", { name: "Minute 05" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 14, minute: 5, second: 0, millisecond: 0 });
  });

  it("switches meridiem in the analog 12-hour view", async () => {
    const onChange = vi.fn();
    render(
      <TimeField
        variant="analog"
        hourCycle={12}
        defaultValue={{ hour: 9, minute: 0, second: 0, millisecond: 0 }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Toggle AM/PM" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 21, minute: 0, second: 0, millisecond: 0 });
  });

  it("localizes analog labels and exposes picker actions", async () => {
    const onAccept = vi.fn();
    const onCancel = vi.fn();
    render(
      <TimeField
        variant="analog"
        locale="fa-IR"
        defaultValue={{ hour: 9, minute: 30, second: 0, millisecond: 0 }}
        onAccept={onAccept}
        onCancel={onCancel}
      />,
    );
    expect(screen.getByRole("listbox", { name: "ساعت" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "ساعت ۰۹" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "ثبت" }));
    expect(onAccept).toHaveBeenCalledWith({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    await userEvent.click(screen.getByRole("button", { name: "انصراف" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("opens the time picker from its input and closes it on confirmation", async () => {
    const onAccept = vi.fn();
    render(
      <TimePicker
        defaultValue={{ hour: 9, minute: 30, second: 0, millisecond: 0 }}
        onAccept={onAccept}
      />,
    );
    await userEvent.click(screen.getByRole("textbox", { name: "Time" }));
    expect(screen.getByRole("dialog", { name: "Time" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onAccept).toHaveBeenCalledWith({ hour: 9, minute: 30, second: 0, millisecond: 0 });
    expect(screen.queryByRole("dialog", { name: "Time" })).not.toBeInTheDocument();
  });

  it("resets the time picker from its input", async () => {
    const onChange = vi.fn();
    render(
      <TimePicker
        defaultValue={{ hour: 9, minute: 30, second: 0, millisecond: 0 }}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  });

  it("uses the same action footer for every time picker variant", async () => {
    for (const variant of ["field", "wheel", "analog"] as const) {
      const view = render(<TimePicker variant={variant} />);
      await userEvent.click(screen.getByRole("textbox", { name: "Time" }));
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Now" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
      view.unmount();
    }
  });
});
