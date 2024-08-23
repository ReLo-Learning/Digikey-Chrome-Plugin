function renderContent()
{
    const table = document.getElementById("data-table-0");
    
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
            const partNumberHref = partNumberTile.querySelector("a[data-testid]")
            
            if (alreadyRendered)
            {
                row.childNodes[3].innerHTML = partNumberHref.innerText;
            } else {
                let td = document.createElement("td");
                td.className = "tss-css-1dzktcq-td";
    
                td.innerHTML = partNumberHref.innerText;
    
                row.insertBefore(td, row.childNodes[3]);
            }

        }
    }
}

const partsRange = document.querySelector("div[data-testid='per-page-selector-container']")

window.addEventListener("load", renderContent)
window.addEventListener("popstate", renderContent)
// document.addEventListener("onreadystatechange", renderContent)
const observer = new MutationObserver(() => { 
    console.log("*** NEW MUTATION ***")

    renderContent();
})

observer.observe(partsRange, { characterData: true, attributes: true, childList: true, subtree: true })


