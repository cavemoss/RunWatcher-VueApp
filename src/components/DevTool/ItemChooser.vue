<template>
    <div class="side-bar">
        <img v-for="(item, index) in itemArray"
            :src="`/icons/${item}.png`"
            :class="{ 'untouched': !itemInfo[item], 'current': index === currentIndex }"
            :key="index"
            @click="updateIndex(index)"
        >
    </div>
</template>

<script setup>
const { itemArray, updateIndex, currentIndex, itemInfo } = defineProps({
    itemArray: { type: Object },
    updateIndex: { type: Function },
    currentIndex: { type: Number },
    itemInfo: { type: Object }
})

</script>

<style scoped>
.side-bar {
    position: fixed;
    background-color: rgb(24, 24, 24);
    right: 0;
    top: 0;
    bottom: 0;
    overflow: scroll;
    width: 70px;
    padding: 22px;
    padding-left: 10px;
    box-shadow: 0 0 0 8px rgb(41, 41, 41);
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 4;
}
img {
    width: 60px;
    min-height: 60px;
    padding: 5px;
    border-radius: 8px;
    background-color: rgb(41, 41, 41);
    transition: all 0.1s;
    cursor: pointer;
}
img:hover {
    transform: scale(1.1);
    background-color: rgb(51, 51, 51);
}
.untouched {
    box-shadow: inset 0 0 14px 8px rgb(196, 193, 47);
}
.current {
    box-shadow: inset 0 0 0 2px rgb(196, 193, 47);
}
</style>