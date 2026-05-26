# ChineseStrokeLearningApp

A simple touch-friendly app for learning Chinese 筆劃.

Students can choose common characters or radicals, add their own practice words, watch stroke-order demonstrations, and trace each character with a mouse or finger. Custom practice characters are saved locally in the browser with `localStorage`.

The app uses the EDB Chinese lexicon radical list as a reference:

https://www.edbchinese.hk/lexlist_ch/

## Features

- Stroke-count radical selector
- Expanded common-character practice list
- Custom word input that splits words into individual characters
- Local cache for added practice characters
- Mouse and touch tracing with Hanzi Writer
- Stroke-order demonstration mode
- Responsive mobile layout

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
