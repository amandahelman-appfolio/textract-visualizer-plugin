// noinspection JSVoidFunctionReturnValueUsed,JSUnusedGlobalSymbols

var textractVisualizer = function() {

    let textractTree = {};
    let blockIdMap = {};
    let pageMap = {};

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
        renderTree();
    })

    function processTextract(textract) {
        textract.forEach(block => {
            if (block.block_type == 'PAGE') {
                console.log('saving page');
                pageMap[block.page] = block;
            } else {
                console.log('saving non-page "' + block.block_type + '"')
                blockIdMap[block.id] = block;
            }
        });
        printOutRelationships(pageMap);
        printOutRelationships(blockIdMap);
        console.log('Full tree: ' + JSON.stringify(textractTree));
    }

    function printOutRelationships(blockMap) {
        for (const key in blockMap) {
            let block = blockMap[key];
            let relationshipMap = block.relationships;
            if (relationshipMap) {
                relationshipMap.forEach(rlnshipType => {
                    console.log(block.block_type + ' has ' + rlnshipType.ids.length + ' ' + rlnshipType.type);
                });
            } else {
                console.log(block.block_type + ' has no relationships');
            }
        }
    }

    function renderTree() {
        let visualizer = $("#visualizer");
        for (const pageNum in pageMap) {
            let block = pageMap[pageNum];
            visualizer.append(`<div class='block page' id='page_${pageNum}'>Page ${pageNum}</div>`)
            let relationshipMap = block.relationships;
            if (relationshipMap) {
                let currentPage = $("#page_" + pageNum);
                relationshipMap.forEach(relationshipTypeMap => {
                    console.log(pageNum + ' has ' + relationshipTypeMap.ids.length + ' ' + relationshipTypeMap.type);
                    relationshipTypeMap.ids.forEach(childId => {
                        let childBlock = blockIdMap[childId];
                        console.log(`rendering ${childId} which is ${childBlock.block_type}`);
                        currentPage.append(`<div class='block line'>Node ${childBlock.block_type}</div>`)
                    });
                });
            }
        }
    }
}();
