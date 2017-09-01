
const fs = require('fs');
const request = require('request');
const $ = require('jquery');
const himalaya = require('himalaya');
const toHTML = require('himalaya/translate').toHTML

const filePath = '/home/dustin/Documents/node/projects/scraping/DNDscraper/data/scraped';

let urls = [
    'http://5e.d20srd.org/srd/magicItems/magicItemsAToZ.htm',
    'http://5e.d20srd.org/srd/equipment/equipment.htm'
];

for(let i = 0; i < urls.length; i++){
    //fetch page based on url
    request(urls[i], function(error, response, body){
        //if error halt any further parsing
        if(error){
            console.error(error);
            return;
        }
        const html = body;

        const fullHTMLJson = himalaya.parse(html);
        const bodyJson = fullHTMLJson[3].children[1].children[3].children;

        let jsonObj = [];
        let tempObj = [];
        let started = false;
        
        //get all relevent body node elements from fetched html into json object
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
            //if object is a header set its type to name of item and
            //set currentItem to copy of this. if not first header push last
            //header to the finalJson object
            if(e.tagName == 'h3'){
                if(started){
                    finalJson.push(currentItem);
                    currentItem = [];
                }
                e.type = e.children[0].attributes.name;
                currentItem = e;
                started = true;

            }else{
                //if not a header set type to predifined label and 
                //child yourself to the current header object

                if(e.tagName == 'p'){
                    e.type = "desc";           
                } else if(e.tagName == 'table'){
                    e.type = 'table';
                }     
                
                currentItem.children.push(e);            
            }
        })
        
        
        fs.writeFileSync(filePath +`${i}.json`, JSON.stringify(finalJson, null, ' ') , 'utf-8'); 
        
        console.log(`succesfully scraped url ${i}`);
    });
}