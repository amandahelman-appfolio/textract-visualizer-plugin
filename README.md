# textract-visualizer-plugin

This is a chrome browser plugin for redrawing raw textract output files as table data, within the browser window.

Note that it is hardcoded to only redraw documents in the `af-ocr-production-batches-us-east-2 bucket`. If needed for other urls, then the checks in `textract-visualizer.js` and `manifest.json` will need to be changed.

## Installation instructions

1. Check out this code locally
2. Navigate to `chrome://extensions/`
3. In the upper right, turn on Developer Mode
4. Click the button "Load Unpacked"
5. Select the directory containing this extension (the directory containing manifest.json)
6. There should now be a card on the extensions screen for Textract Visualizer
7. If you check out an updated version, or make any changes yourself, you will need to click the "refresh" icon on this card for the changes to take effect on the next page refresh.

Note, if you have the JSON Formatter extension installed, this plugin will still work in parallel - the table will render underneath the JSON tree (so scroll down or collapse the parent node).

## Functions

Renders the textract file as a color-coded table, e.g.:

![](docs/example_render.png)

Each line that contains a node id (like `e1eed86a-1703-440d-bb2f-c2fdeb284b51`) can be clicked on to copy the id to the clipboard.