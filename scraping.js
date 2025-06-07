let urls = ['https://zheleza.net/', 'https://www.regard.ru', 'https://www.netlab.ru'];
let htmlData = [];

async function FetchDataLoop( targets = [] ) {
    for (url of targets) {
        //console.log(url);
        try {
            let promise = await fetch(url); 
            if (!promise.ok) {
                throw new Error("HTTP error! status: " + promise.status);
            }
            let data = await promise.text();
            htmlData.push(data);
            console.log("url: " + url + " l: " + htmlData.length);
        }
        catch(error) {
            console.error("Error fetching data for item: ", url, error);
        }
    }

    console.log("final l: " + htmlData.length);
};

FetchDataLoop(urls);