import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import { Calendar } from "@calix/react";
import { gregorian } from "@calix/adapter-gregorian";
import { jalali } from "@calix/adapter-jalali";

const meta: Meta<typeof Calendar> = {
  title: "Calendar",
  component: Calendar,
  args: { adapter: gregorian, locale: "en-US" },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const Single: Story = {};

export const Range: Story = {
  args: { mode: "range", numberOfMonths: 2 },
};

export const Multiple: Story = {
  args: { mode: "multiple", max: 3 },
};

export const Jalali: Story = {
  args: { adapter: jalali, locale: "fa-IR", dir: "rtl" },
};

export const BusinessDaysOnly: Story = {
  args: { businessDaysOnly: true },
};

export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole("grid");
    await expect(grid).toBeInTheDocument();
    const focusable = canvas.getAllByRole("gridcell").find((el) => el.getAttribute("tabindex") === "0");
    if (focusable) {
      focusable.focus();
      await userEvent.keyboard("{ArrowRight}{ArrowDown}");
    }
  },
};
