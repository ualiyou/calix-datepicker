import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, screen } from "@storybook/test";
import { DatePicker } from "@alydev/datepicker";
import { gregorian } from "@alydev/adapter-gregorian";
import { jalali } from "@alydev/adapter-jalali";

const meta: Meta<typeof DatePicker> = {
  title: "DatePicker",
  component: DatePicker,
  args: { adapter: gregorian, locale: "en-US" },
};
export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const Range: Story = { args: { mode: "range" } };

export const Jalali: Story = { args: { adapter: jalali, locale: "fa-IR", dir: "rtl" } };

export const OpensOnClick: Story = {
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>(".calix-trigger");
    if (trigger) {
      await userEvent.click(trigger);
      // The popover renders in a portal at the body.
      await expect(await screen.findByRole("dialog")).toBeInTheDocument();
    }
  },
};
