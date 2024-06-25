# react-utils

## Description

Includes some useful hooks and components for react.

## Install

```bash
npm i react-utils
```

## What inside now

### use-toc

#### Ability

- Automatically scroll to the active element when the page is scrolled.

#### Usage

```tsx
import { useToc } from "react-utils";

const elements = document.querySelectorAll(".toc-item");

const { active, setActive } = useToc(container, elements, headerTop);
```

### use-prompt

#### Ability

- Automatically show a window.confirm prompt or you can custom your own prompt.

#### Usage

```tsx
import { usePrompt } from "react-utils";

usePrompt({
  when: isDirty,
  // nullable, if set, will use window.confirm to show a prompt
  message,
  customFn,
});
```
