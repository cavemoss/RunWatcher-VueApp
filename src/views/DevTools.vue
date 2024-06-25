<template>
    <div class="page" v-if="loading.complete">
        <div class="icon-panel">
            <div class="top">
                <button @click="navigateTo('prev')" class="btn-left">❮</button>
                <img @mousedown.prevent :src="`/icons/${ItemsArray[index]}.png`">
                <button @click="navigateTo('next')" class="btn-right">❯</button>
            </div>
            <div class="bottom">
                {{ ItemsArray[index] }}
                <DynamicInput :key="forceUpdate" :item-info="CurrentItemInfo" />
            </div>
        </div>
        <div class="settings">
            <div class="inputs">
                <div class="side">
                    <button @click="generateSynergies()">
                        Generate
                    </button>
                    <div>
                        <input type="checkbox" v-model="automatic"> Automatically
                    </div>
                </div>
                <div class="side">
                    <div>
                        <input type="number" min="1" max="10" v-model="CurrentItemInfo.stackPower" :disabled="ifEquip">
                        Big Stack
                    </div>
                    <div>
                        <input type="checkbox" v-model="CurrentItemInfo.disposable" :disabled="ifEquip">
                        Disposable
                    </div>
                </div>
            </div>
            <PickerField v-if="GameData" :key="forceUpdate"
            :mod="pickerFieldMod" 
            :game-data="GameData" 
            :item-info="CurrentItemInfo"
            :set-mod="(newMod) => updatePickerFieldMod(newMod)"
            />
            <button @click="saveGlobalItemInfo()">Save</button>
        </div>
    </div>
    <ItemChooser 
    :item-array="ItemsArray" 
    :update-index="(newIndex) => updateCurrentIndex(newIndex)"
    :current-index="index"
    :item-info="GlobalItemInfo"
    />
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import PickerField from '@/components/DevTool/PickerField.vue'
import ItemChooser from '@/components/DevTool/ItemChooser.vue'
import DynamicInput from '@/components/DevTool/DynamicInput.vue'


// Loading content
onMounted(async() => {
    let response = await fetch('/server-url-list.txt')  
    let urlList = (await response.text()).split('\n')
    connectServer(urlList)
})

function connectServer(urlList) {
    let index = 0

    async function ping() {
        if(index + 1 > urlList.length) 
        { 
            console.error('None of the server url responded');
            return 
        }
        try
        {
            let serverUrl = `${urlList[index]}/api`
            console.log(`Attempting to access server ${serverUrl}`)

            const response = await fetch(serverUrl, { method: 'GET' })
            if (response.ok) 
            {
                let gameData = await response.json()
                console.log(gameData)
                handleInitialResponse(gameData, serverUrl)
            }
            else throw `Unexpected server response ${response.statusText}`
        }
        catch(error)
        {
            console.error(error) 
            index++
            ping()
        }
    } 
    
    ping()
}


// Setting content
const loading = reactive({ complete: false })
let GameData = null
let server = null

async function handleInitialResponse(gameData, serverUrl) {
    
    server = serverUrl
    GameData = gameData
    ItemsArray = [
        ...gameData.Items.Common,
        ...gameData.Items.Uncommon,
        ...gameData.Items.Legendary,
        ...gameData.Items.Boss,
        ...gameData.Items.Lunar,
        ...gameData.Items.Void,
        ...gameData.Equipment
    ]

    try { 
        GlobalItemInfo = await (await fetch('/item-info.json')).json() 
        CurrentItemInfo.value = GlobalItemInfo[ItemsArray[index.value]]
    }
    catch { console.warn('item-info.json not found') }
    
    switchCurrentItem()
    loading.complete = true
    console.log('Connected.')
}


// Working resources
let GlobalItemInfo = { }
const CurrentItemInfo = ref({ })

let ItemsArray
const index = ref(0)

const ifEquip = ref(false)
const automatic = ref(false)
const forceUpdate = ref(0)

const navigateTo = (action) => switchCurrentItem(() => {
    if (action === 'prev') if (index.value !== 0) index.value--
    if (action === 'next') if (index.value +1 !== ItemsArray.length) index.value++
})
const updateCurrentIndex = (newIndex) => switchCurrentItem(() => {
    index.value = newIndex
})

const pickerFieldMod = ref('sup')
const updatePickerFieldMod = (newMod) => {
    pickerFieldMod.value = newMod
    forceUpdate.value++
}

const survivalInfo = {
    "BANDIT2" : ['aoe'],
    "CAPTAIN" : ['movement_speed', 'mobility'],
    "COMMANDO" : ['attack_speed', 'aoe', 'proc'],
    "CROCO" : ['defense', 'movement_speed', 'mobility'],
    "ENGI" : [],
    "HERETIC" : [],
    "HUNTRESS" : ['defense'],
    "LOADER" : [],
    "VOIDSURVIVOR" : [],
    "RAILGUNNER" : [],
    "TREEBOT" : ['movement_speed', 'mobility'],
    "TOOLBOT" : ['movement_speed', 'mobility'],
    "MERC" : [],
    "MAGE" : ['movement_speed']
}


// Working functions
function switchCurrentItem(action = undefined) {
    if (action) {
        let itemName = ItemsArray[index.value]
        GlobalItemInfo[itemName] = CurrentItemInfo.value
        action()
    }
    
    let itemName = ItemsArray[index.value]
    if (GlobalItemInfo[itemName]) 
    {
        CurrentItemInfo.value = GlobalItemInfo[itemName]
        ItemsArray[index.value].indexOf("Eq-") >= 0 ? ifEquip.value = true : ifEquip.value = false
    }
    else if (ItemsArray[index.value].indexOf("Eq-") >= 0) 
    {
        ifEquip.value = true
        CurrentItemInfo.value = {
            tags: 'equip',
            supplements: [],
            synergies: [],
            disabledWithout: [],
            negates: [],
            goodOn: [],
        }
    } 
    else 
    {
        ifEquip.value = false
        CurrentItemInfo.value = {
            tags: null,
            stackPower: 2,
            disposable: false,
            supplements: [],
            synergies: [],
            disabledWithout: [],
            negates: [],
            goodOn: [],
        }
    }
    
    forceUpdate.value++
    if (automatic.value) generateSynergies()
}

function generateSynergies(source = CurrentItemInfo.value) {

    let supplements = [], synergies = [], disabledWithout = [], negates  = [], goodOn = []
    const targetTags = source.tags.split(' ')

    const format = (string, slice = false) => {
        if (!slice) return string.toLowerCase()
        return string.slice(1, ).toLowerCase()
    }

    for (let [itemName, attribs] of Object.entries(GlobalItemInfo)) {
        if (itemName === ItemsArray[index.value]) continue

        let sup, syn, dis, neg
        const itemTags = attribs.tags?.split(' ')  

        function is_sup(targetTag, itemTag) {

            const reg = /[?!.-]/
            if (!reg.test(targetTag) && !reg.test(itemTag)) {
                return format(targetTag) === format(itemTag)
            }
        }

        function is_syn(targetTag, itemTag) {
            
            if ([...targetTag].includes("!")) {
                if ([...itemTag].includes(".")) return format(itemTag, true) === format(targetTag, true)
                return format(itemTag) === format(targetTag, true)
            }

            if ([...itemTag].includes("!")) {
                if ([...targetTag].includes(".")) return format(itemTag, true) === format(targetTag, true)
                return format(itemTag, true) === format(targetTag)
            }
        }

        function is_dis(targetTag, itemTag) {

            if ([...targetTag].includes("?")) {
                return format(itemTag) === format(targetTag, true)
            }
        }

        function is_neg(targetTag, itemTag) {

            if ([...targetTag].includes("-")) {
                return format(itemTag) === format(targetTag, true)
            }
        }        

        if (itemTags) targetTags.forEach(targetTag => {

            itemTags.forEach(itemTag => {
                if(!sup) if(is_sup(targetTag, itemTag)) {
                    supplements.push(itemName); sup = true
                }
                if(!syn) if(is_syn(targetTag, itemTag)) {
                    synergies.push(itemName); syn = true
                }
                if(!dis) if(is_dis(targetTag, itemTag)) {
                    disabledWithout.push(itemName); dis = true
                }
                if(!neg) if(is_neg(targetTag, itemTag)) {
                    negates.push(itemName); neg = true
                }
            })

        })
    }

    targetTags.forEach(targetTag => {

        for (let [survivor, requirements] of Object.entries(survivalInfo)) {
            
            if (targetTag === '.favorable') goodOn.push(survivor)
            else if (requirements.includes(!/[?!.-]/.test(targetTag) ? format(targetTag) : format(targetTag, true))) {

                
                goodOn.push(survivor)
            }
        }
    })

    source.supplements = supplements
    source.synergies = synergies
    source.disabledWithout = disabledWithout
    source.negates = negates
    source.goodOn = [...new Set(goodOn)]
}

async function saveGlobalItemInfo() {
    let itemName = ItemsArray[index.value]
    GlobalItemInfo[itemName] = CurrentItemInfo.value
    
    const response = await fetch(server, { 
        method: 'POST', 
        body: JSON.stringify(GlobalItemInfo) 
    })

    if (response.ok) alert('Update saved.')
}

</script>

<style scoped>
.page {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.icon-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
}
.top {
    display: flex;
    gap: 6px;
}
.top img {
    width: 70px;
    min-height: 70px;
    border: 2px dashed grey;
    box-shadow: inset 0 0 20px 10px rgb(72, 72, 72);
    padding: 15px;
}
.top button {
    border: none;
}
.btn-left {
    border-top-left-radius: 5px; 
    border-bottom-left-radius: 5px
}
.btn-right {
    border-top-right-radius: 5px; 
    border-bottom-right-radius: 5px
}
.bottom {
    font-family: Bombardier;
    color: rgb(231, 231, 231);
    display: flex;
    align-items: center;
}
.settings {
    font-family: Bombardier;
    display: flex;
    gap: 18px;
    flex-direction: column;
}
.settings button {
    font-family: Bombardier;
    font-size: 16px;
}
.inputs {
    color: rgb(231, 231, 231);
    display: flex;
    gap: 10px;
    font-size: 14px;
    justify-content: space-between;
}
.inputs .side {
    display: flex;
    align-items: center;
    gap: 10px;
}
.inputs button {
    font-size: 14px;
}
.inputs input[type="number"] {
    font-family: Bombardier;
    width: 32px;
}
</style>