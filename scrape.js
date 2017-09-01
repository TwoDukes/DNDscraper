/*COPY AND PASTE THIS IN CONSOLE ON http://5e.d20srd.org/srd/magicItems/magicItemsAToZ.htm 
  TO RECIEVE AN ARRAY OF ALL ITEMS COPIED TO YOUR CLIPBOARD*/
const jquery = require("node_modules/jquery/dist/jquery.min.js");
let html;

$.ajax({ 
    url: 'http://5e.d20srd.org/srd/magicItems/magicItemsAToZ.htm', 
    success: function(data) { html = data } 
});

let doms = Array.from(document.body.querySelectorAll('*'));
let jsonObj = []
let tempObj = []
let started = false;

doms.forEach(e => {
    if(e.tagName == 'H3'){
        if(started){
            jsonObj.push(tempObj);
            tempObj = [];
        }
        started = true;
    }
    
    if(started){
        tempObj.push(e);
    }
    
});

let filteredJson = []

jsonObj.forEach(e => {
    e.forEach(n => {
        filteredJson.push(n.outerHTML);
    })
    filteredJson.push("XXX"); //makes parsing the seperate objects easier
})

copy(filteredJson);