<template>
    <div class="mods">
        <button @click="setMod(`sup`)" :class="{ 'current': mod === `sup` }">
            Supplements: {{ itemInfo.supplements.length }}
        </button>
        <button @click="setMod(`syn`)" :class="{ 'current': mod === `syn` }">
            Synergies: {{ itemInfo.synergies.length }}
        </button>
        <button @click="setMod(`dis`)" :class="{ 'current': mod === `dis` }" >
            Disabled Without: {{ itemInfo.disabledWithout.length }}
        </button>
        <button @click="setMod(`neg`)" :class="{ 'current': mod === `neg` }">
            Negates: {{ itemInfo.negates.length }}
        </button>
        <button @click="setMod(`good`)" :class="{ 'current': mod === `good` }">
            Good On: {{ itemInfo.goodOn.length }}
        </button>
    </div>
    <div class="picker">    
        <div class="body" v-if="content === `items`">
            <div class="block" v-for="(ItemTier, key, index) in gameData.Items" :key="index">
                <img v-for="(item, index) in ItemTier"
                    :name="item"
                    :class="isChosen(item)"
                    :src="`/icons/${item}.png`"
                    :key="index" 
                    @click="choose"
                >
            </div>
        </div> 
        <div class="body" v-if="content === `items`">
            <div class="block">
                <img v-for="(equip, index) in gameData.Equipment"
                    :name="equip"
                    :class="isChosen(equip)"
                    :src="`/icons/${equip}.png`"
                    :key="index" 
                    @click="choose"
                >
            </div>
        </div> 
        <div class="body" v-if="content === `survivors`">
            <div class="block">
                <img v-for="(surv, index) in gameData.Survivors"
                    :name="surv.split('-')[1]"
                    :class="isChosen(surv.split('-')[1])"
                    :src="`/icons/${surv}.png`"
                    :key="index" 
                    @click="choose"
                >
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
const { mod, gameData, itemInfo, setMod } = defineProps({
    mod: { type: String },
    gameData: { type: Object },
    itemInfo: { type: Object },
    setMod: { type: Function }
})

const content = computed(() => {
    let options = ['items', 'survivors']
    switch (mod) {
        case 'sup': return options[0]
        case 'syn': return options[0]
        case 'dis': return options[0]
        case 'neg': return options[0]
        case 'good': return options[1]
    }
})

function findArray() {
    switch (mod) {
        case 'sup': return itemInfo.supplements
        case 'syn': return itemInfo.synergies
        case 'dis': return itemInfo.disabledWithout
        case 'neg': return itemInfo.negates
        case 'good': return itemInfo.goodOn
    }
}

function overwriteArray(newArray) {
    switch (mod) {
        case 'sup': itemInfo.supplements = newArray; break
        case 'syn': itemInfo.synergies = newArray; break
        case 'dis': itemInfo.disabledWithout = newArray; break
        case 'neg': itemInfo.negates = newArray; break
        case 'good': itemInfo.goodOn = newArray; break
    }
}

function isChosen(entity) {
    if (findArray().includes(entity)) return 'chosen'
    return null
} 

function choose(event) {
    if (event.target.className === 'chosen') {
        overwriteArray([...findArray().filter(entity => entity !== event.target.name)])
        event.target.className = null
    } else {
        overwriteArray([...findArray(), event.target.name])
        event.target.className = 'chosen'
    }
}

</script>

<style>
.picker {
    width: fit-content;
    height: 600px;
    background-color: rgb(24, 24, 24);
    border: 14px solid rgb(24, 24, 24);
    border-right: none;
    border-left: none;
    box-shadow: 0 0 0 8px rgb(41, 41, 41);
    border-radius: 10px;
    overflow: scroll;
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.mods {
    display: flex;
    justify-content: space-between;
}
.mods button {
    font-family: Bombardier;
    font-size: 14px;
}
.body {
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.block {
    width: calc(70px * 8 + 8px * 7);
    display: flex;
    margin: 6px 0;
    row-gap: 8px;
    column-gap: 8px;
    padding: 0 14px;
    flex-wrap: wrap;
}
.block img {
    width: 60px;
    height: 60px;
    padding: 5px;
    border-radius: 8px;
    background-color: rgb(41, 41, 41);
    transition: all 0.1s;
    cursor: pointer;
}
.block img:hover {
    transform: scale(1.1);
    background-color: rgb(51, 51, 51);
}
.chosen {
    box-shadow: inset 0 0 14px 8px rgb(196, 193, 47);
}
.current {
    box-shadow: 0 0 0 4px rgb(189, 188, 133);
    color: rgb(117, 117, 95);
}
</style>