const dataURL = "https://yaqwsx.github.io/jlcparts/data/index.json"

async function getData()
{
    await fetch(dataURL)
                .then( res => res.json())
                .then(res => {
                    let created = res["created"];

                    let prevCreated = window.localStorage.getItem("last-update");
                    if (prevCreated && prevCreated == created) { console.log("Up To Date"); return; }
                    
                    window.localStorage.setItem("last-update", created);
                    
                    var transaction;
                    var store = null;
                    const request = window.indexedDB.open("components", 1);
                    request.onupgradeneeded = (e) => {
                        console.log("Upgrade Needed")
                        var db = e.target.result;
                        db.createObjectStore("PartStore", {keyPath: "part"})
                    }
                    request.onerror = () => {
                        console.log("ERROR")
                    }
                    request.onsuccess = (e) => {
                        console.log("Success")
                        var db = e.target.result
                        transaction = db.transaction("PartStore", "readwrite")
                        store = transaction.objectStore("PartStore") 
                        
                        transaction.oncomplete = () => {
                            console.log("Population transaction complete")
                        }

                        const categories = res["categories"]
    
                        for (const [key, value] of Object.entries(categories))
                        {
                            for(const [k, v] of Object.entries(categories[key]))
                            {
                                populateDB(v["sourcename"], store)
                            }
                        }
                    }

                })
                .catch(e => console.error(e))
}

async function populateDB(category, store)
{
    const stock = await fetch(`https://yaqwsx.github.io/jlcparts/data/${category}.stock.json`)
                            .then(res => res.json())
                            .catch(e => console.error(e))
    
    const mfg = await fetch(`https://yaqwsx.github.io/jlcparts/data/${category}.json.gz`)
                            .then(async res => {
                                const ds = new DecompressionStream("gzip");
                                
                                const blob = await res.blob()
                                const stream = blob.stream().pipeThrough(ds)
                                const out = await new Response(stream);
                                return await out.json()
                            })
                            .catch(e => console.error(e))
    
        for (const [key, qty] of Object.entries(stock))
        {
            for (const idx in mfg["components"])
            {
                const component = mfg["components"][idx]
                if (key == component[0])
                {
                    store.put({part: component[1], quantity: qty})
                    break;
                }
        
            }
        }    
}

function renderContent()
{
    console.log("rendering data")
    const request = window.indexedDB.open("components", 1);
    request.onupgradeneeded = (e) => {
        console.log("Upgrade Required")
        var db = e.target.result;
        db.createObjectStore("PartStore", {keyPath: "part"})
    }
    request.onerror = () => {
        console.log("ERROR")
    }
    request.onsuccess = (e) => {
        console.log("Success")
        var db = e.target.result
        const table = document.getElementById("data-table-0");

        var trans = db.transaction("PartStore", "readwrite")
        var store = trans.objectStore("PartStore") 

        trans.onerror = function(e)
        {
            console.log("Transaction Error", e)
        }
            
        trans.oncomplete = function(e)
        {
            console.log("Transaction complete")
        }

        if (table)
        {
            const header = document.querySelector(".MuiTableHead-root");
            const titleRow = header.childNodes[0];
            const spacerRow = header.childNodes[1];
    
            const alreadyRendered = (titleRow.childNodes[3].hasAttribute("inserted")) ? true : false;
            
            if (!alreadyRendered)
            {
                let myTitle = document.createElement("th");
                myTitle.setAttribute("inserted", "true")
                myTitle.className = "MuiTableCell-root MuiTableCell-head MuiTableCell-sizeMedium tss-css-zzt9ym-tableHeaderCell mui-css-162sqo8";
                myTitle.innerHTML = "JLC Stock";
            
                let mySpacer = document.createElement("th");
                mySpacer.className = "MuiTableCell-root MuiTableCell-head MuiTableCell-paddingNone MuiTableCell-sizeMedium tss-css-1wbmub-tableHeaderCell-tableHeaderSortCell mui-css-aqoflc";
            
                titleRow.insertBefore(myTitle, titleRow.childNodes[3]);
            
                spacerRow.insertBefore(mySpacer, spacerRow.childNodes[3]);
            }
        
            const trs = document.querySelectorAll("tbody tr");
    
            for (let row of trs)
            {
                const partNumberTile = row.childNodes[1];
                const partNumber = partNumberTile.querySelector("a[data-testid]").innerText
                
                var quantity = 0;

                let callback = (q) => {
                    if (alreadyRendered)
                    {
                        row.childNodes[3].innerHTML = quantity;
                    } else {
                        let td = document.createElement("td");
                        td.className = "tss-css-1dzktcq-td";
                        td.style.fontWeight = "bold";
            
                        td.innerHTML = quantity;
            
                        row.insertBefore(td, row.childNodes[3]);
                    }
                }

                var getQty = store.get(partNumber)
                getQty.onsuccess = (e) => {
                    if(e.target.result) {quantity = e.target.result.quantity}
                    else {quantity = 0}

                    callback(quantity)
                }
                getQty.onerror = () => {
                    quantity = 0
                    callback(quantity)
                }
                
                
            }
        }
    }

    console.log("Nothing Happened")

}


const partsRange = document.querySelector("div[data-testid='per-page-selector-container']")

// window.addEventListener("load", renderContent)
window.addEventListener("popstate", renderContent)

const observer = new MutationObserver(() => { 
    renderContent();
})

observer.observe(partsRange, { characterData: true, attributes: true, childList: true, subtree: true })
getData();
renderContent();