// noinspection JSVoidFunctionReturnValueUsed,JSUnusedGlobalSymbols

var textractVisualizer = function() {

    let textractTree = {};
    let blockIdMap = {};
    let pageMap = {};
    const typeClassMap = {
        'PAGE' : 'page',
        'LINE' : 'line',
        'WORD' : 'word',
        'TABLE' : 'table',
        'CELL' : 'cell',
        'MERGED_CELL' : 'mergedcell',
        'KEY_VALUE_SET' : 'keyvalue'
    }

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
            let blockElementId = `page_${pageNum}`;
            visualizer.append(`<div class='block page' id='${blockElementId}'>Page ${pageNum} of ${Object.keys(pageMap).length}</div>`)
            renderChildNodes(block, blockElementId);
        }
    }

    function renderChildNodes(block, blockElementId) {
        let relationshipMap = block.relationships;
        if (relationshipMap) {
            let currentParent = $(`#${blockElementId}`);
            relationshipMap.forEach(relationshipTypeMap => {
                console.log(`Current ${block.block_type} block has ${relationshipTypeMap.ids.length} ${relationshipTypeMap.type}`);
                relationshipTypeMap.ids.forEach(childId => {
                    let childBlock = blockIdMap[childId];
                    let blockClass = typeClassMap[childBlock.block_type];
                    console.log(`rendering ${childId} which is ${childBlock.block_type} (${blockClass})`);
                    currentParent.append(`<div class='block ${blockClass}' id='${childId}'>${childBlock.block_type}</div>`)
                    currentChild = $(`#${childId}`);
                    currentChild.append(`<div class='blockid'>${childId}</div>`);
                    if (childBlock.block_type == 'WORD') {
                        currentChild.append(`<div class='wordtext'>${childBlock.text}</div>`)
                    }
                    renderChildNodes(childBlock, childId);
                });
            });
        }
    }
}();
