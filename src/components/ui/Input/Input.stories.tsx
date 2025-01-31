// src/components/ui/Input/Input.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { Mail, Lock, Search } from "lucide-react";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel"],
    },
    disabled: {
      control: "boolean",
    },
    error: {
      control: "text",
    },
    clearable: {
      control: "boolean",
    },
    showPassword: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input
export const Basic: Story = {
  args: {
    placeholder: "Enter text...",
    className: "w-[300px]",
  },
};

// Input with Label
export const WithLabel: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    className: "w-[300px]",
  },
};

// Input with Left Icon
export const WithLeftIcon: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    leftIcon: <Mail className="h-4 w-4" />,
    className: "w-[300px]",
  },
};

// Input with Error
export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    error: "Please enter a valid email address",
    className: "w-[300px]",
  },
};

// Password Input
export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
    showPassword: true,
    leftIcon: <Lock className="h-4 w-4" />,
    className: "w-[300px]",
  },
};

// Clearable Input
export const Clearable: Story = {
  args: {
    label: "Search",
    placeholder: "Search...",
    leftIcon: <Search className="h-4 w-4" />,
    clearable: true,
    className: "w-[300px]",
    value: "Search term",
  },
};

// Disabled Input
export const Disabled: Story = {
  args: {
    label: "Disabled Input",
    placeholder: "This input is disabled",
    disabled: true,
    className: "w-[300px]",
  },
};