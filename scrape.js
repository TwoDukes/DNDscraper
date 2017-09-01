
const fs = require('fs');
const request = require('request');
const $ = require('jquery');
const himalaya = require('himalaya');
const toHTML = require('himalaya/translate').toHTML

const filePath = '/home/dustin/Documents/node/projects/scraping/DNDscraper/data/magicItems.json';

request('http://5e.d20srd.org/srd/magicItems/magicItemsAToZ.htm', function(error, response, body){
    //if error halt any further parsing
    if(error){
        console.error(error);
        return;
    }
    const html = body;
    //console.log(html);

    const fullHTMLJson = himalaya.parse(html);
    const bodyJson = fullHTMLJson[3].children[1].children[3].children;

    let jsonObj = [];
    let tempObj = [];
    let started = false;
    
    //get all relevent node elements from html into json object
    bodyJson.forEach(e => {
        if(e.tagName == 'h3'){
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
    
    //trims the json object 
    jsonObj.forEach(e => {
        e.forEach(n => {
            filteredJson.push(n);
        });
    });

    let finalJson = [];
    let currentItem = {};
    started = false;

    //organized json object into an easily accesible object before file write
    filteredJson.forEach(e => {
        if(e.tagName == 'h3'){
            if(started){
                finalJson.push(currentItem);
                currentItem = [];
            }
            currentItem = e;
            started = true;

        }else{

            if(e.tagName == 'h3'){
                e.type = 'itemName';
            } else if(e.tagName == 'p'){
                e.type = "desc";           
            } else if(e.tagName == 'table'){
                e.type = 'table';
            }     
            
            currentItem.children.push(e);            
        }
    })
    
    console.log(finalJson);

    fs.writeFileSync(filePath, JSON.stringify(finalJson, null, ' ') , 'utf-8'); 

});