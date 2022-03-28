// noinspection JSVoidFunctionReturnValueUsed,JSUnusedGlobalSymbols

var textractVisualizer = function() {

    let blockIdMap = {};
    let pageMap = {};
    const typeClassMap = { // maps types to css class name
        'PAGE' : 'page',
        'LINE' : 'line',
        'WORD' : 'word',
        'TABLE' : 'table',
        'CELL' : 'cell',
        'MERGED_CELL' : 'mergedcell',
        'KEY_VALUE_SET' : 'keyvalue'
    }

    $(document).ready(function() {
        if (document.URL.match(/https:\/\/af-ocr-production-batches-us-east-2.s3.us-east-2.amazonaws.com\/batch.+\/document_.+\/textract_output_.+?/)) {
            console.log("Textract Visualizer loaded")

            // Find the node with the textract json data and hide it
            var bodyChildren = document.body.childNodes;
            var pre = bodyChildren[0];

            // hide the raw json data
            pre.hidden = true;

            // add the visualizer content
            addedDiv = document.createElement('div');
            addedDiv.id = "visualizer";
            document.body.appendChild(addedDiv);

            // process the textract json
            processTextract(JSON.parse($("pre").html()));
            renderTree();
         } else {
            console.log(`Url did not match target for Textract Visualizer (${document.URL})`);
        }
    })

    function processTextract(textract) {
        // Save each block in the list. Pages are at top level so they go in a map by page number.
        // All other blocks are in a map by the block GUID
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
        // iterate through the pages, and for each page render all the nodes underneath it
        let visualizer = $("#visualizer");
        for (const pageNum in pageMap) {
            let block = pageMap[pageNum];
            let blockElementId = `page_${pageNum}`;
            visualizer.append(`<div class='block page' id='${blockElementId}'>Page ${pageNum} of ${Object.keys(pageMap).length}</div>`)
            renderChildNodes(block, blockElementId);
        }
    }

    function renderChildNodes(block, blockElementId) {
        // recursively render all the nodes that are in relationship lists of the passed-in node
        let relationshipMap = block.relationships;
        if (relationshipMap) {
            let currentParent = $(`#${blockElementId}`);
            relationshipMap.forEach(relationshipTypeMap => {
                console.log(`Current ${block.block_type} block has ${relationshipTypeMap.ids.length} ${relationshipTypeMap.type}`);
                currentParent.append(`<div class="block relationshiplabel">List of ${relationshipTypeMap.type} relationships</div>`);
                if (block.block_type == 'TABLE') {
                    currentParent.append(`<div class="tablecellcontainer" id="${blockElementId}_headers"></div>`);
                    currentParent.append(`<div class="tablecellcontainer" id="${blockElementId}_cells"></div>`);
                    currentParent.append(`<div class="tablecellcontainer" id="${blockElementId}_mergedcells"></div>`);
                }
                relationshipTypeMap.ids.forEach(childId => {
                    let childBlock = blockIdMap[childId];
                    let blockClass = typeClassMap[childBlock.block_type];
                    let entityType = '';
                    let entityTypeText = '';
                    if (childBlock.entity_types) {
                        if (childBlock.entity_types.length > 1) {
                            console.error(`unexpected: block ${block.id} of type ${block.block_type} has multiple entity_types: ${childBlock.entity_types}`);
                        }
                        entityType = childBlock.entity_types[0];
                        entityTypeText = `<p class='metadatalabel'>entity type: </p>${entityType}`;
                    }

                    console.log(`rendering ${childId} which is ${childBlock.block_type} (${blockClass})`);
                    let childContainer = currentParent;
                    if (block.block_type == 'TABLE') {
                        if (childBlock.block_type == 'CELL') {
                            if (entityType && entityType == 'COLUMN_HEADER') {
                                childContainer = $(`#${blockElementId}_headers`);
                            } else {
                                childContainer = $(`#${blockElementId}_cells`);
                            }
                        } else if (childBlock.block_type == 'MERGED_CELL') {
                            childContainer = $(`#${blockElementId}_mergedcells`);
                        }
                    }
                    let childElementId = `${blockElementId}_${childId}`;
                    childContainer.append(`<div class='block ${blockClass}' id='${childElementId}'>${entityTypeText} <p class='metadatalabel'>block type: </p>${childBlock.block_type}</div>`)
                    currentChild = $(`#${childElementId}`);
                    currentChild.append(`<div class='blockid' onclick="navigator.clipboard.writeText('${childId}')">${childId}</div>`);
                    if (childBlock.block_type == 'WORD') {
                        currentChild.append(`<div class='wordtext'>${childBlock.text}</div>`)
                    }

                    // render all the children of the current childBlock
                    renderChildNodes(childBlock, childElementId);
                });
            });
        }
    }
}();
