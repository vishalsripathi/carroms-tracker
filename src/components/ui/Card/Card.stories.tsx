// src/components/ui/Card/Card.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import { Button } from "../Button";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "ghost", "outline", "elevated"],
    },
    hover: {
      control: "boolean",
    },
    clickable: {
      control: "boolean",
    },
    loading: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Card
export const Basic: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    ),
  },
};

// Card with Header
export const WithHeader: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
      </>
    ),
  },
};

// Interactive Card
export const Interactive: Story = {
  args: {
    className: "w-[350px]",
    hover: true,
    clickable: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardDescription>This card has hover and click effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
      </>
    ),
  },
};

// Card with Footer
export const WithFooter: Story = {
  args: {
    className: "w-[350px]",
    children: (
      <>
        <CardHeader>
          <CardTitle>Card with Footer</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </CardFooter>
      </>
    ),
  },
};

// Loading Card
export const Loading: Story = {
  args: {
    className: "w-[350px]",
    loading: true,
    children: (
      <>
        <CardHeader>
          <CardTitle>Loading Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This content will be hidden while loading</p>
        </CardContent>
      </>
    ),
  },
};