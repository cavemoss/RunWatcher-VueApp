<template>
    <div
        :style="{ 
            top: attribs.position.top + 'px', 
            left: attribs.position.left + 'px', 
            opacity: attribs.position.visible ? attribs.opacity : 0
        }"
        @mousedown.prevent="startDrag($event, attribs.position)"
        class="item"
    >
        <div class="count">{{ count }}</div>
        <div class="count shadow">{{ count }}</div>
        <img class="icon" :src="attribs.imgSrc">

        <StatsDisplay 
            :stats="attribs.stats" 
            :item-name="name" 
            :set-opacity="(name, opc) => global.Inventory.value[name].opacity = opc"
        />
    </div>
</template>

<script setup>
import { computed, inject, onBeforeMount, watch } from 'vue'
import StatsDisplay from '@/components/Main/StatsDisplay.vue'

const { attribs, name } = defineProps({
    attribs: { type: Object },
    name: { type: String }
})

const global = {
    ItemInfoJson: inject('ItemInfoJson'),
    Survivor: inject('Survivor'),
    Inventory: inject('Inventory'),
    updateCount: inject('updateCount')
}

const count = computed(function() {
    return attribs.count > 1 ? `x${attribs.count}` : ''
})


// Calculating Stats
onBeforeMount(calculateStats)
watch(global.updateCount, calculateStats)

function calculateStats() {
    const itemInfo = global.ItemInfoJson.value[name]
    const itemsStats = attribs.stats
    const inventoryHas = (item) => global.Inventory.value[item]?.stats.enabled ? true : false

    // Find if the item has effect
    itemsStats.enabled = (function() {

        // Does the inventory contain an item that negates the current item?
        for (let [inventoryItemName, inventoryItemAttribs] of Object.entries(global.Inventory.value)) {
            if (inventoryItemAttribs.stats.negates.includes(name)) itemsStats.isNegated = true
            if (itemsStats.isNegated) return false
        }

        // Does the disabled condition exist?
        if (itemInfo?.disabledWithout.length > 0) {

            // Does the inventory contain any of the required items?
            if (itemInfo?.disabledWithout.filter(inventoryHas).length > 0) return true
            else return false
        }

        return true

    }).call()

    // Get other stats if the item has effect
    if (itemsStats.enabled) { 

        itemsStats.supplements = itemInfo?.supplements.filter(inventoryHas)
        itemsStats.synergies = itemInfo?.synergies.filter(inventoryHas)

        itemsStats.goodForChr = itemInfo?.goodOn.includes(global.Survivor.value) ? true : false
        itemsStats.disposable = (function() {

            if (!itemInfo?.disposable) return false
            else if (itemsStats.supplements.length >= 5 && itemsStats.synergies.length >= 3) return false
            else return !itemsStats.goodForChr

        }).call()

        itemsStats.stackPower = (function() {

            if (itemInfo?.stackPower === 1) return null
            return Math.floor(attribs.count / itemInfo?.stackPower ?? 1)

        }).call()
    }

    // Handle special chases
    if (itemInfo?.tags?.split(' ').includes('.irregular')) switch(name) {

        case 'Itm-DeathMark-42': 
            itemsStats.enabled = itemInfo?.disabledWithout.filter(inventoryHas).length >= 4 ? true : false 
            for (let [key] of Object.entries(itemsStats)) delete itemsStats[key]
    }
}


// Handle drag and drop
let activeItem = null
let offsetX = 0
let offsetY = 0

function startDrag (event, item) {  
    activeItem = item
    event.target.style.cursor = 'grabbing'
    offsetX = event.clientX - item.left
    offsetY = event.clientY - item.top
    document.addEventListener('mousemove', drag)
    document.addEventListener('mouseup', stopDrag)
}

function drag (event) {
    if (!activeItem) return
    activeItem.left = event.clientX - offsetX
    activeItem.top = event.clientY - offsetY
    activeItem.customized = true
}

function stopDrag (event) {
    activeItem = null
    event.target.style.cursor = 'grab'
    document.removeEventListener('mousemove', drag)
    document.removeEventListener('mouseup', stopDrag)
}

</script>

<style scoped>
.item {
    display: inline-flex;
    flex-direction: column;
    position: absolute;
    cursor: grab;
    transition: opacity 300ms;
}
.icon {
    width: 70px; 
}
.count {
    z-index: 3;
    pointer-events: none;
    align-self: flex-end;
    position: absolute;
    font-family: Bombardier;
    font-size: 22px;
    color: white;
}
.count.shadow {
    z-index: 2;
    color: black;
    -webkit-text-stroke: 3px;
}
</style>