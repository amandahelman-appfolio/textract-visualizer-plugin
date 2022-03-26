// noinspection JSVoidFunctionReturnValueUsed,JSUnusedGlobalSymbols

var textractVisualizer = function() {

    let textractTree = {};
    let blockIdMap = new Map();
    let pageMap = new Map();

    $(document).ready(function() {
        console.log("Textract Visualizer loaded 001")

        // Find the node with the textract json data and hide it
        var bodyChildren = document.body.childNodes;
        var pre = bodyChildren[0];
        pre.hidden = true; // todo add checks that this is actually a textract doc, etc
        //var jsonLength = (pre && pre.innerText || "").length ;

        // add the visualizer content
        addedDiv = document.createElement('div');
        addedDiv.id = "visualizer";
        document.body.appendChild(addedDiv);

        // process the textract json
        processTextract(JSON.parse($("pre").html()));
    })

    function processTextract(textract) {
        let visualizer = $("#visualizer");
        visualizer.append("<p>" + textract.length + "</p>");
        textract.forEach(block => {
            visualizer.append("<p>" + block.block_type + "</p>");
            if (block.block_type == 'PAGE') {
                console.log('saving page');
                pageMap.set(block.page, block);
            } else {
                console.log('saving non-page "' + block.block_type + '"')
                blockIdMap.set(block.id, block);
            }
            /*if (block.relationships) {
                block.relationships.forEach(rlnshipType => {
                    console.log(block.block_type + ' has ' + rlnshipType.type + ' count: ' + rlnshipType.ids.length);
                });
            } else {
                console.log('processed leaf node of type ' + block.block_type);
            }*/
        });
        blockIdMap.forEach(block => {

        });
        console.log('Top level pages: ' + pageMap.size)
        console.log('Full tree: ' + JSON.stringify(textractTree));
    }
}();
