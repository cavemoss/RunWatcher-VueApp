<template>
    <div class="warnings">
        <img class="warn">
    </div>
</template>

<script setup>
import { inject } from 'vue'

const { stats, itemName } = defineProps(['stats', 'itemName'])
const Inventory = inject('Inventory')

</script>

<style scoped>
.warnings {
    width: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -40px;
}
.warn {
    background-color: brown;
    width: 30px;
    height: 30px;
}
</style>