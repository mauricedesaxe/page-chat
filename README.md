# Page Chat - Talk to LLMs about your browser page

This Chrome extension uses OpenAI API to let you chat with LLMs about your browser page. Built with [Plasmo](https://docs.plasmo.com/).

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

If you're trying to read and understand the code, here's a quick guide:

- `background.ts` is the main file that runs when the extension is installed. It sets up the context menu, listens for keyboard shortcuts, and so on.
- `popup.tsx` is the main UI of the extension and points to other components.
- `utils/pageDownloader.ts` is a utility function that downloads the page you're currently on and converts it to markdown.
- other files are self-explanatory or less important and pointed at by the above files.