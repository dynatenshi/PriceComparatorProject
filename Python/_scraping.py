from bs4 import BeautifulSoup
import requests
import json

webpages = ['https://zheleza.net/', 'https://www.netlab.ru/', 'https://www.compday.ru/']
categories = ['cpu', 'motherboard', 'videocard', 'hdd', 'ssd']
n = 10
class webQueries:
    class cpu:
        zheleza = 'cpu/'
        netlab  = 'katalog/processory/'
        compday = 'komplektuyuszie/protsessory/'
    class motherboard:
        zheleza  = 'motherboards/'
        netlab = 'katalog/materinskie-platy/'
        compday = 'komplektuyuszie/materinskie-platy/'
    class videocard:
        zheleza  = 'video-card/'
        netlab = 'katalog/videokarty/'
        compday = 'komplektuyuszie/videokarty/'
    class hdd:
        zheleza  = 'hdd/'
        netlab = 'katalog/vinchestery/'
        compday = 'komplektuyuszie/zhestkie-diski/'
    class ssd:
        zheleza  = 'hdd/ssd-hdd/'
        netlab = 'katalog/ssd-nakopiteli/'
        compday = 'komplektuyuszie/ssd-nakopiteli/'

searchQuery = {
    'zheleza' : 'index.php?route=product/search&search=',
    'netlab' : 'poisk/?q=',
    'compday' : 'search/?q='
}

redirectSearch = {
    'zheleza' : {
        'tag' : 'a',
        'class' : 'title'
    },
    'netlab' : {
        'tag' : 'div',
        'class' : 'catalog-element-item__name'
    },
    'compday' : {
        'tag' : 'a',
        'class' : 'name'
    },
}

productPageSearch = {
    'zheleza' : {
        'image' : {
            'tag' : 'img',
            'class' : 'img-responsive'
        },
        'price' : {
            'tag' : 'span',
            'class' : 'current-price'
        },
        'description': {
            'tag' : 'div',
            'class' : 'tab-pane active'
        }
    },
    'netlab' : {
        'price' : {
            'tag' : 'div',
            'class' : 'catalog-detail__price-value'
        }
    },
    'compday' : {
        'price' : {
            'tag' : 'b',
            'class' : 'price'
        }
    },
}

catalog = {}

def FillCatalog(targetUrl = '', numOfEntries = 10, debug = False):
    if debug: print('Catalog Filling Started' + '\n')
    if debug: print('Target: ' + targetUrl)

    pageName = targetUrl.replace('/', '').replace('https:', '').replace('www.', '')
    pageName = pageName[0 : pageName.find('.')]
    if debug: print('Page Name: ' + pageName + '\n')

    for category in categories:       
        catalog.update( { category : {} } )

        if debug: print('//////////////////////')
        if debug: print('Category: ' + category)
        categ = getattr( webQueries, category)
        query = getattr( categ, pageName)
        if debug: print('Query: ' + query)

        fullURL = targetUrl + query
        if debug: print('Full URL: ' + fullURL + '\n')

        req = requests.get(fullURL)
        soup = BeautifulSoup(req.content, 'html.parser')

        if debug: print( 'Soup Brewed' if soup else 'Error: no soup')

        if (targetUrl == webpages[0]):
            targetTag = 'a'
            targetClass = 'title'

        targetTag = redirectSearch[pageName]['tag']    
        targetClass = redirectSearch[pageName]['class'] 
        
        itemList = soup.find_all(targetTag, class_=targetClass)
        if debug: print('Made Items List for ' + category if itemList else 'Failed to make Item List for ' + category)
        if itemList:
            if debug: print(f'Length of Item List: {len(itemList)}')

        stringItemList = []
        for i in range(numOfEntries):
            stringItemList.append( str(itemList[i]) )       
        if debug: print(f'Final Length of Item List: {len(stringItemList)}\n')

        for item in stringItemList:
            if debug: print(item)

            start = item.find('>') + 1
            end = item.rfind('<')
            itemName = item[start : end]
            if debug: print('Item Name: ' + itemName + '\n')
            catalog[category].update( { itemName : { 'description' : '' } } )       
    
    if debug: print('//////////////////////')

def WebSearch(pages = [], debug = False):
    if debug: print('Web Search Started' + '\n')

    for catalogCategories in catalog:
        if debug: print('Current Category: ' + catalogCategories)
        for catalogName in catalog[catalogCategories]:
            if debug: print('Current Item: ' + catalogName)
            for url in pages:
                if debug: print('Target: ' + url)

                pageName = url.replace('/', '').replace('https:', '').replace('www.', '')
                pageName = pageName[0 : pageName.find('.')]
                if debug: print('Page Name: ' + pageName)

                additiveQuery = searchQuery[pageName] + catalogName.replace(' ', '-')
                if debug: print('Additive Query: ' + additiveQuery)

                fullURL = url + additiveQuery
                if debug: print('Full URL: ' + fullURL + '\n')

                req = requests.get(fullURL)
                soup = BeautifulSoup(req.content, 'html.parser')

                targetTag = redirectSearch[pageName]['tag']    
                targetClass = redirectSearch[pageName]['class']

                itemFirst = str( soup.find(targetTag, class_=targetClass) )

                if debug: print( f'Item found: {itemFirst}\n' if itemFirst else 'Item not Found :(\n' )

                start = itemFirst.find('href') + 6
                if url == webpages[0]:
                    end = itemFirst.find('">')
                elif url == webpages[1]:
                    end = itemFirst.find('">')
                else:
                    start = itemFirst.find('href') + 7
                    end = itemFirst.find('m"') + 1
                    
                redirectLink = itemFirst[start : end]
                if url == webpages[2]: 
                    redirectLink = url + redirectLink

                if debug: print('Redirect Link: ' + redirectLink + '\n')
                
                if redirectLink:
                    req = requests.get(redirectLink)
                    soup = BeautifulSoup(req.content, 'html.parser')

                    itemPriceTag = str( soup.find(productPageSearch[pageName]['price']['tag'], class_=productPageSearch[pageName]['price']['class']) )
                    if url == webpages[0]:
                        itemImageTag = str( soup.find(productPageSearch[pageName]['image']['tag'], class_=productPageSearch[pageName]['image']['class']) )
                        itemDesriptionTag = str( soup.find(productPageSearch[pageName]['description']['tag'], class_=productPageSearch[pageName]['description']['class']) )

                    if debug:
                        print('Price found!' if itemPriceTag else 'Price not located :(')
                        if url == webpages[0]:
                            print('Image found!' if itemImageTag else 'Image not located :(')
                            print('Description found!' if itemDesriptionTag else 'Description not located :(')

                    if url == webpages[0]:
                        start = itemImageTag.find('src') + 5
                        end = itemImageTag.find('title=') - 2
                        itemImageLink = itemImageTag[start : end]
                        if debug: print('Item Image Link: ' + itemImageLink)

                        start = itemDesriptionTag.find('<p>') + 3
                        end = itemDesriptionTag.find('</p>') - 1
                        itemDesription = itemDesriptionTag[start : end]
                        if debug: print('Item Description: ' + itemDesription)

                        #catalog[catalogCategories][catalogName].update( { 'description' : itemDesription } )
                        catalog[catalogCategories][catalogName].update( { 'image' : itemImageLink } )

                        start = itemPriceTag.find('>') + 1
                        end = itemPriceTag.rfind('<') -1
                    elif url == webpages[1]:
                        start = itemPriceTag.find('>') + 1
                        end = itemPriceTag.rfind('<') -1
                    else:
                        start = itemPriceTag.find('>') + 1
                        end = itemPriceTag.rfind('::after') - 3

                    itemPrice = itemPriceTag[start : end]
                    if debug: print('Item Price: ' + itemPrice + '\n')

                    catalog[catalogCategories][catalogName].update( { pageName : { 'url' : redirectLink, 'price' : itemPrice } } )

                    if debug: print(catalog[catalogCategories][catalogName])

                else:
                    continue;


FillCatalog(webpages[0], n, True)
WebSearch(webpages, True)
print('Functions Done!\n')

f = open('python_scrap.json', 'w')
outputJSON = json.dumps([{k: catalog[k]} for k in catalog], indent=4, ensure_ascii=False )
f.write(outputJSON)
f.close()

print(outputJSON)