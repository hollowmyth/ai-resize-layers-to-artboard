/*

  License: GPLv2 or later

  Adobe Illustrator jsx script to loop through and resize each layer's artwork to fit proportionally inside the artboard. This is based on the work of Carlos Canto, dbburgess and Ruandre Janse Van Rensburg. 

  Works in CC2014 (should work in later versions).
  Doesn't work in CS3 (and probably won't work in earlier versions).


  Based on the fine work of these folks:

      Carlos Canto, dbburgess and ruandre
      
        https://forums.adobe.com/message/4164590
        http://aiscripts.com/2012/09/fit-object-to-artboard/
        https://gist.github.com/ruandre/7b47cbf2a4c55dac9adb
        
  How to use:
    Run the script from the File > Scripts > Other Script menu. 
    Or copy it into the following folder to make it available directly from the Scripts menu:
      Adobe Illustrator CC 2014 > Presets > en_US > Scripts

*/
  
// Artboard bounds helper (used above):
function getArtboardBounds(artboard) {

  var bounds = artboard.artboardRect,

      left   = bounds[0],
      top    = bounds[1],
      right  = bounds[2],
      bottom = bounds[3],

      width  = right - left,
      height = top - bottom,

      props  = {
        left   : left,
        top    : top,
        width  : width,
        height : height
      };

  return props;
}



// Bounds difference helper (used at the top):
function itemBoundsDiff(item) {

  var itemVB = item.visibleBounds,
      itemVW = itemVB[2] - itemVB[0],
      itemVH = itemVB[1] - itemVB[3],

      itemGB = item.geometricBounds,
      itemGW = itemGB[2] - itemGB[0],
      itemGH = itemGB[1] - itemGB[3],

      deltaX = itemVW - itemGW,
      deltaY = itemVH - itemGH,

      diff   = {
        deltaX: deltaX,
        deltaY: deltaY
      };

    return diff;
}



// Fit item helper (used at the top):
function fitItem(item, props, diff) {

  // Cache current values:
  var oldWidth  = item.width; // alert(oldWidth);
  var oldHeight = item.height; // alert(oldHeight);

  // Wide or tall?
  if (item.width > item.height) {

    // alert('wide');
//    item.width = props.width - diff.deltaX;
    item.width = props.width;

    // Scale height using ratio from width:
    var ratioW  = item.width / oldWidth;
    item.height = oldHeight * ratioW;

  } else {

    // alert('tall');
//    item.height = props.height - diff.deltaY;
    item.height = props.height;

    // Scale width using ratio from height:
    var ratioH = item.height / oldHeight;
    //alert('item width: ' + item.width + ' item oldWidth: ' + oldWidth + ' ratioH: ' + ratioH);
    item.width = oldWidth * ratioH;

  }

  // Center:
  item.top  = 0 - ((props.height / 2) - (item.height / 2));
  item.left = (props.width / 2) - (item.width / 2);

  // Deselect:
  item.selected = false;

}

var idoc        = app.activeDocument;  
var totalLayers = idoc.layers.length;
var newLayer    = idoc.layers.add();

for (i=1; i<=totalLayers; i++) {  
  var ilayer = idoc.layers[i];
  if (ilayer.locked == false) {
    ilayer.visible = true;
    var newGroup = newLayer.groupItems.add();
    var activePageItems = ilayer.pageItems.length;
    for (s = 0; s < activePageItems; s++) {
      var item = ilayer.pageItems[s].duplicate(newGroup,ElementPlacement.PLACEATBEGINNING);
    }
    ilayer.pageItems.removeAll();
    newGroup.move(ilayer,ElementPlacement.PLACEATBEGINNING);



    var abActive   = idoc.artboards[idoc.artboards.getActiveArtboardIndex()];
    var abProps    = getArtboardBounds(abActive);
    var boundsDiff = itemBoundsDiff(newGroup);

    //alert(abActive, abProps,boundsDiff);

    // Scale object to fit artboard:
    fitItem(newGroup, abProps, boundsDiff);

    var groupPageItemTotal = newGroup.pageItems.length;
    for (j=0;j < groupPageItemTotal;j++){
      newGroup.pageItems[j].duplicate(ilayer,ElementPlacement.PLACEATBEGINNING);
    }
    newGroup.remove();
  }
}
newLayer.remove();

//hide all layers but the first
for (i=1; i<idoc.layers.length; i++) {  
    var currentLayer = idoc.layers[i];
    currentLayer.visible = false;
}

