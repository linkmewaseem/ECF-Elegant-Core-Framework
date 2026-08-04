# @ecf/extensions

This package groups optional extension modules and feature add-ons for the ECF ecosystem. It is intended to host reusable extension patterns such as soft-delete behavior, UUID generation, timestamps, and slugging helpers.

## What is included

- extension-oriented feature modules
- reusable domain helpers
- package-level audit and compatibility notes

## Usage

```js
import { SluggableExtension } from "@ecf/extensions/sluggable";

const slugger = new SluggableExtension();
console.log(slugger.slugify("Hello World"));
```

## Notes

This package is currently a consolidation layer for extension-friendly features and is expected to grow as more feature packs are standardized.
