<template>
    <button class="mb-2 border rounded-xl p-2 text-white flex flex-row justify-center items-center" @click="router.back"                 style="background-color: #1e789f;">
        <ArrowUturnLeftIcon class="h-5 pr-1" />
        Back
    </button>
</template>

<script setup>
import { ArrowUturnLeftIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
</script>

<style scoped></style>
