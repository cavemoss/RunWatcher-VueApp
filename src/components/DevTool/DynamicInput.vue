<template>
    <div class="dynamic-input">
        <input 
        v-model="itemInfo.tags" 
        @input="highlightWords" 
        />
        <p>
            <span v-for="(word, index) in highlightedWords" :key="index" :style="{ color: word.color }">
                <span v-html="word.html"></span>
            </span>
        </p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const { itemInfo } = defineProps(['itemInfo'])
const highlightedWords = ref([])

function highlightWords() {

    let words = []

    const wordsInput = itemInfo.tags?.split(' ') ?? ['']  
    const specChar = ['.', '!', '?', '-']

    if (wordsInput.length === 1 && wordsInput[0] === '') {
        highlightedWords.value = [{ html: 'No Tags', color: '#aaa' }]
        return
    }

    wordsInput.forEach(word => {
        for (let i = 0; i < specChar.length; i++) {        
            if (word.indexOf(specChar[i]) >= 0) { 
                words.push(specChar[i])
                words.push(word.slice(word.indexOf(specChar[i]) + 1, ))
                var specCharFound = true; break
            }
        }        
        if(!specCharFound) words.push(word)
    })

    highlightedWords.value = words.map(word => {
        switch(word.toLowerCase()) {
            
            // regular tags
            case 'defense': return { html: `${word} `, color: '#2369ff' }
            case 'damage': return { html: `${word} `, color: '#c42727' }
            case 'attack_speed': return { html: `${word} `, color: '#ff007b' }
            case 'healing': return { html: `${word} `, color: '#16a93c' }
            case 'movement_speed': return { html: `${word} `, color: '#00e3ff' }
            case 'proc': return { html: `${word} `, color: '#00ff46' }
            case 'crit': return { html: `${word} `, color: '#ff0000' }
            case 'burst': return { html: `${word} `, color: '#ea004b' }
            case 'aoe': return { html: `${word} `, color: '#eaaf00' }
            case 'on_kill': return { html: `${word} `, color: '#d600ea' }
            case 'elite_kill': return { html: `${word} `, color: '#9f00ea' }
            case 'mobility': return { html: `${word} `, color: '#00e3ff' }
            case 'on_hit': return { html: `${word} `, color: '#00ff46' }
            case 'on_interact': return { html: `${word} `, color: '#9ce707' }
            case 'fire': return { html: `${word} `, color: '#f18614' }
            case 'on_get_hit': return { html: `${word} `, color: '#e34a39' }
            case 'survival': return { html: `${word} `, color: '#1dad13' }
            case 'equip': return { html: `${word} `, color: '#ff7f00' }
            case 'chance': return { html: `${word} `, color: '#ffd500' }
            case 'bleed': return { html: `${word} `, color: '#961403' }
            case 'utility': return { html: `${word} `, color: '#e617d4' }
            case 'allies': return { html: `${word} `, color: '#1864d6' }
            case 'rockets': return { html: `${word} `, color: '#d68018' }
            case 'cooldown_reduction': return { html: `${word} `, color: '#1ee3b8' }
            case 'inflicts': return { html: `${word} `, color: '#ffca00' }
            case 'ice': return { html: `${word} `, color: '#0bf2d9' }
            case 'when_sprinting': return { html: `${word} `, color: '#ef0bf2' }
            case 'money': return { html: `${word} `, color: '#f2eb0b' }

            // must be ignored by supplements
            case 'irregular': return { html: `${word} `, color: '#f4ff00' }
            case 'favorable': return { html: `${word} `, color: '#f4ff00' }

            // special symbols
            case '.': return { html: `${word}`, color: '#f4ff00' }
            case '!': return { html: `${word}`, color: '#f4ff00' }
            case '?': return { html: `${word}`, color: '#f4ff00' }
            case '-': return { html: `${word}`, color: '#f4ff00' }
            
            case '': return { html: `&nbsp;`, color: null }
            default: return { html: `${word} `, color: '#aaa' }
        }
    })
}

onMounted(highlightWords)

</script>

<style scoped>
.dynamic-input {
    display: flex;
    flex-direction: column;
    margin-left: 7px;
}
input {
    width: 1000px;
    position: absolute;
    color: transparent;
    caret-color: white;
    outline: none;
    padding: 0;
    border: none;
    background: none;
    font-family: Bombardier;
    font-size: 16px;
    z-index: 2;
}
input::selection {
    background-color: blue;
    color: white;
}
p {
    pointer-events: none;
    margin: 0;
    font-size: 16px;
}
</style>
