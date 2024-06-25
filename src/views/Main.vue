<template>
    <ItemTable :inventory="Inventory" >
        <Item v-for="(item, itemName, index) in Inventory" :key="index" :attribs="item" :name="itemName" />
    </ItemTable>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import Item from '@/components/Main/Item.vue'
import ItemTable from '@/components/Main/ItemTable.vue'

let eventSource = null

function connectWebHook(urlList) {

    let index = 0

    async function connect() {
   
        if(index + 1 > urlList.length) { console.error('None of the webhook url worked'); return }

        try 
        {
            let webHookUrl = `${urlList[index]}/webhook`
            console.log(`Attempting to connect to webhook ${webHookUrl}`)
            
            const response = await fetch(webHookUrl, { method: 'POST' })

            if (response.ok) setupEventSource(webHookUrl)
            else console.error('Failed to register for updates', response.statusText)
        } 
        catch(error) 
        { 
            console.error(`Error connecting to the webhook ${serverUrl}`, error) 
            index++
            connect()
        }
    }

    connect()
}

function setupEventSource(url) {
    console.log('Connected.')
    eventSource = new EventSource(url)

    eventSource.onmessage = function(event) {
        try 
        {
            const data = JSON.parse(event.data)
            if (!Survivor.value) Survivor.value = data.SurvivorName
            updateInventory(data)
        } 
        catch (error) { console.error('Error parsing update', error) }
    }

    eventSource.onerror = function(event) {
        console.error('Error receiving updates', event)
        eventSource.close()
    }
}

onMounted(async() => {
    let response = await fetch('/server-url-list.txt')  
    let urlList = (await response.text()).split('\n')
    connectWebHook(urlList)

    try { ItemInfoJson.value = await (await fetch('/item-info.json')).json() }
    catch { console.warn('item-info.json not found') }
})

onBeforeUnmount(() => {
    if (eventSource) eventSource.close()
})


// Working Recourses
let prevInventory = []

const Inventory = ref({ })
provide('Inventory', Inventory)

const updateCount = ref(0)
provide('updateCount', updateCount)

const Survivor = ref(null)
provide('Survivor', Survivor)

const ItemInfoJson = ref({ })
provide('ItemInfoJson', ItemInfoJson)


// Working Functions
function updateInventory(json) {

    json.Items.forEach((item) => {
        handleNewItem(item.name, item.tier, item.count, `/icons/${item.name}.png`)
    })
    
    handleRemovedItems(json.Items)

    json.Items.forEach((item) => {
        prevInventory.push(item.name)
    })

    updateCount.value++
}

function handleNewItem(name, tier, count, imgSrc) {

    // Update the items' count if it's already present in the inventory
    if (Inventory.value[name]) { Inventory.value[name].count = count; return } 

    // Add the new item to the inventory
    Inventory.value[name] = {
        tier, count, imgSrc,
        position: { top: 0, left: 0, customized: false, visible: false },
        opacity: 1,
        type: null,
        stats: {
            enabled: true,
            stackPower: null,
            supplements: [],
            synergies: [],
            negates: [],
            isNegated: false,
            disposable: false,
            goodForChr: false
        }
    }

    console.log(`${name} Received`)
}

function handleRemovedItems(Items) {
    for (let itemNameToFind of prevInventory) {

        for (let i = 0; i < Items.length; i++) {
            var found = true  
            if (itemNameToFind === Items[i].name) break
            found = false
        } 

        if (found) continue // otherwise delete the item

        delete Inventory.value[itemNameToFind]
        console.log(`${itemNameToFind} Gone`)
    }

    prevInventory = []
}

</script>

<style>
@font-face {
    font-family: Bombardier;
    src: url(/fonts/BOMBARD_.ttf);
}
::selection {
    background: none;
}
body {
    background-color: rgb(18, 18, 21);
}
</style>