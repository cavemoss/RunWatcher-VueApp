<template>
    <div style="width: 200px; display: none">
        <div v-for="(value, key) of stats" style="color: white">
            {{ key }} : <span style="color: yellow">{{ value }}</span>
        </div>
    </div>
    <div class="warn">

        <div v-if="!stats.enabled">
            disabled
        </div>

        <div v-if="stats.disposable">
            disposable
        </div>
        
    </div>
    <div class="stats">

        <div v-if="stats.goodForChr"> <!-- good for character -->
            <div class="icon" style="background-color: green"> </div>
            <div class="desc">
                <span class="text">favorable</span>
                <span class="hide"> ♥ </span>
            </div>
        </div>

        <div v-if="stats.stackPower"> <!-- stack power -->
            <div class="icon" style="background-color: #9c9c9c"> </div>
            <div class="desc">
                <span class="text" v-if="stats.stackPower === 1">big stack</span>
                <span class="text" v-if="stats.stackPower === 2">king stack</span>
                <span class="text" v-if="stats.stackPower > 3">epic stack</span>
                <span class="hide">x{{ stats.stackPower }}</span>
            </div>
        </div>
        
        <!-- supplements --> <div 
            v-if="stats.supplements?.length > 0" 
            @mouseover="onMouseOver(stats.supplements)" 
            @mouseout="onMouseOut(stats.supplements)"
        > 
            <div class="icon" style="background-color: #0095ff"> </div>
            <div class="desc">
                <span class="text">supplements:</span>
                <span>{{ stats.supplements.length }}</span>
            </div>
        </div>

        <!-- synergies --> <div 
            v-if="stats.synergies?.length > 0"
            @mouseover="onMouseOver(stats.synergies)" 
            @mouseout="onMouseOut(stats.synergies)"
        >
            <div class="icon" style="background-color: #9c35cc"> </div>
            <div class="desc">
                <span class="text">synergies:</span>
                <span>{{ stats.synergies.length }}</span>
            </div>
        </div>
  
    </div>
</template>

<script setup>
import { inject } from 'vue'

const { stats, itemName, setOpacity } = defineProps(['stats', 'itemName', 'setOpacity'])
const Inventory = inject('Inventory')

function onMouseOver(source) {
    for (let [name] of Object.entries(Inventory.value)) {
        if (!source.includes(name) && name !== itemName) setOpacity(name, 0.2)
    }
}

function onMouseOut(source) {
    for (let [name] of Object.entries(Inventory.value)) {
        if (!source.includes(name) && name !== itemName) setOpacity(name, 1)
    }
}

</script>

<style scoped>
.icon {
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 10px;
}
.stats {
    display: flex;
    flex-direction: column;
    margin-top: 6px;
    gap: 24px;
}
.warn {
    font-family: Bombardier;
    width: 70px;
    text-align: center;
    position: absolute;
    margin-top: -25px;
    color: red;
    animation: blink 2s infinite;
}
.desc {
    position: absolute;
    font-family: Bombardier;
    background-color: rgba(100, 100, 100, 0.4);
    color: white;
    width:max-content;
    height: 20px;
    border-radius: 10px;
    padding-left: 26px;
    padding-right: 10px;
    display: flex;
    gap: 4px;
}
.text {
    display: none;
}
.desc:hover .text {
    display: block;
}
.desc:hover .hide {
    display: none;
}
@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>