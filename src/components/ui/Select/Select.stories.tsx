// src/components/ui/Select/Select.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];

// Basic Select
export const Basic: Story = {
  args: {
    options,
    value: "",
    onChange: () => {},
    placeholder: "Select an option",
    className: "w-[300px]",
  },
};

// Select with Label
export const WithLabel: Story = {
  args: {
    label: "Choose an option",
    options,
    value: "",
    onChange: () => {},
    placeholder: "Select an option",
    className: "w-[300px]",
  },
};

// Select with Error
export const WithError: Story = {
  args: {
    label: "Choose an option",
    options,
    value: "",
    onChange: () => {},
    error: "Please select an option",
    placeholder: "Select an option",
    className: "w-[300px]",
  },
};

// Disabled Select
export const Disabled: Story = {
  args: {
    label: "Disabled Select",
    options,
    value: "",
    onChange: () => {},
    disabled: true,
    placeholder: "Select is disabled",
    className: "w-[300px]",
  },
};

// Select with Disabled Options
export const WithDisabledOptions: Story = {
  args: {
    label: "Select with disabled options",
    options: [
      { value: "1", label: "Option 1" },
      { value: "2", label: "Option 2", disabled: true },
      { value: "3", label: "Option 3" },
      { value: "4", label: "Option 4", disabled: true },
    ],
    value: "",
    onChange: () => {},
    placeholder: "Select an option",
    className: "w-[300px]",
  },
};

// Pre-selected Value
export const WithPreselectedValue: Story = {
  args: {
    label: "Pre-selected option",
    options,
    value: "2",
    onChange: () => {},
    className: "w-[300px]",
  },
};