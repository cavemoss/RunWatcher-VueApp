<script setup>
import { ref, onMounted } from 'vue'
const { inventory } = defineProps(['inventory'])

const table = ref(null)

onMounted(() => {
    updateDefaultPosition()
    setInterval(updateDefaultPosition, 500)
})

function updateDefaultPosition() {

    let newItems = []
    
    for (let [itemName, { position }] of Object.entries(inventory)) {
        if (!position.customized) newItems.push({ itemName, position })
    }

    let itemPerLine = 0
    let line = 0

    for (let index = 0; index < newItems.length; index++) { 
        
        let leftOffset = 20 + 80 * (index - itemPerLine * line) 

        if (leftOffset > table.value.clientWidth - 90) line++
        leftOffset = 20 + 80 * (index - itemPerLine * line) 
        var topOffset = 60 + 180 * line
        
        if (line === 0) itemPerLine = index + 1

        newItems[index].position.left = leftOffset
        newItems[index].position.top = topOffset
        newItems[index].position.visible = true
    }
}

</script>

<template>
    <div class="item-table" ref="table">
        <slot />
    </div>
</template>

<style scoped>
.item-table {
    margin: 20px;
    padding: 16px;
    border: 2px dashed grey;
    position: fixed;
    bottom: 0;
    right: 0;
    top: 0;
    left: 0;
    overflow-x: hidden;
    overflow-y: scroll;
}
</style>