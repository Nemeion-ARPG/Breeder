<template>
    <section class="addons-selector container">
        <header>
            <h2>{{ title }}</h2>
        </header>

        <div class="addon-list">
            <div
                class="addon-list-item"
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

.addon-list {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    gap: 0.3rem 0.5rem;
}
</style>
