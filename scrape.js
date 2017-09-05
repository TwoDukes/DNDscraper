
const fs = require('fs');
const request = require('request');
const $ = require('jquery');
const himalaya = require('himalaya');
const toHTML = require('himalaya/translate').toHTML

const filePath = '/home/dustin/Documents/node/projects/scraping/DNDscraper/data/scraped';

let urls = [
    'http://5e.d20srd.org/srd/magicItems/magicItemsAToZ.htm',
    'http://5e.d20srd.org/srd/equipment/equipment.htm',
    'http://5e.d20srd.org/srd/equipment/armor.htm'
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

        //find and set body of the html document
        let bodyJson;
        fullHTMLJson.forEach(e => {
            if(e.tagName == '?xml' && e.attributes.version == 1){
                    bodyJson =  e.children[1].children[3].children;
            }
        })

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
        //jsonObj.push(tempObj);
        
        let filteredJson = []
        
        //trims the json object 
        jsonObj.forEach(e => {
            e.forEach(n => {
                filteredJson.push(n);
            });
        });

        let firstArrangedJson = [];
        let currentItem = {};
        started = false;

        //organized json object into an easily accesible object before file write
        filteredJson.forEach(e => {
            //if object is a header set its type to name of item and
            //set currentItem to copy of this. if not first header push last
            //header to the finalJson object
            if(e.tagName == 'h3'){
                if(started){
                    firstArrangedJson.push(currentItem);
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
        firstArrangedJson.push(currentItem);

        let finalArrangedJson = [];
        currentItem = {};
        started = false;


        //format all json data into an easily usable and accesible json object
        firstArrangedJson.forEach(e => {
            if(e.tagName == 'h3'){
                if(started){
                    finalArrangedJson.push(currentItem);
                    currentItem = {};
                }
                currentItem.name = e.type;
                currentItem.desc = '';
                currentItem.data = [];
                started = true;

                e.children.forEach(child => {
                    if(child.tagName == 'p'){
                        if(child.children[0].type == "Element"){
                            if(child.children[0].children[0] != undefined)
                                currentItem.desc += (" " + child.children[0].children[0].content);
                        }else if(child.children[0].type == "Text"){
                            if(child.children[0] != undefined)
                                currentItem.desc += (" " + child.children[0].content);
                        }
                    
        
                    } else {
                        if(child.content != "\n\n" && child.tagName != 'a'){
                            if(child.tagName == 'table' || child.tagName == 'ul' || child.tagName == 'h5' || child.tagName == 'h1'){
                                currentItem.data.push(toHTML(child));
                            }else {
                                currentItem.data.push(child);
                            }
                        }
                    }
                }) 
            } 
        });
        finalArrangedJson.push(currentItem);
        
        //write json to external file
        fs.writeFileSync(filePath +`${i}.json`, JSON.stringify(finalArrangedJson, null, ' ') , 'utf-8'); 
        
        console.log(`succesfully scraped url ${i}`);
    });
}