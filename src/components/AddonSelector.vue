<template>
    <section class="addons-selector container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <div 
            v-for="(addon, index) in availableAddons"
            :title = "addon.description"
        >
            <BFormCheckbox
                :key="index"
                :value="addon.id"
                v-model="selectedAddons"
                :disabled="addon.mutually_exclusive && selectedAddons.includes(addon.mutually_exclusive)"
                button
                :button-variant="selectedAddons.includes(addon.id) ? 'success' : 'secondary'"
            >
            {{ addon.display_name }}
            </BFormCheckbox>
        </div>
    </section>
</template>

<script setup>
const selectedAddons = defineModel({
    type: Array,
    required: true,
    validator(value) {
        return value.every((e) => typeof e === 'string')
    }
})

defineProps({
    title: {
        type: String,
        required: true
    },
    availableAddons: {
        type: Array,
        required: true,
        validator(value) {
            return true
            // return value.every((element) => element.display_name && element.description)
        }
    }
})
</script>

<style scoped>
</style>
