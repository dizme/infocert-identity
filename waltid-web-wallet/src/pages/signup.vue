<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="mx-auto w-full max-w-lg p-5 lg:rounded-xl shadow-lg lg:bg-white lg:bg-opacity-65 lg:backdrop-blur-md">
            <div class="text-center">
                <img :src="logoImg" alt="Company Logo" class="h-20 w-auto mx-auto" />
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Get Your Wallet Today</h2>
            </div>

            <div class="mt-8">
                <form class="space-y-6" @submit.prevent="register">
                    <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="name">
                            <span class="flex flex-row items-center">
                                <UserIcon class="h-5 mr-1" />
                                Name
                            </span>
                        </label>
                        <div class="mt-2">
                            <input id="name" v-model="nameInput" autocomplete="name" autofocus
                                class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 text-gray-600"
                                name="name" required="" type="text" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="email">
                            <span class="flex flex-row items-center">
                                <AtSymbolIcon class="h-5 mr-1" />
                                Email Address
                            </span>
                        </label>
                        <div class="mt-2">
                            <input id="email" v-model="emailInput" autocomplete="email"
                                class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 text-gray-600"
                                name="email" required="" type="email" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="password">
                            <span class="flex flex-row items-center">
                                <LockClosedIcon class="h-5 mr-1" />
                                Password
                            </span>
                        </label>
                        <div class="mt-2">
                            <input id="password" v-model="passwordInput" autocomplete="current-password"
                                class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 text-gray-600"
                                name="password" required="" type="password" />
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="block text-sm font-medium leading-6 text-gray-900" for="password">
                            <span class="flex flex-row items-center">
                                <LockClosedIcon class="h-5 mr-1" />
                                Confirm Password
                            </span>
                        </label>
                        <div class="mt-2">
                            <input id="confirm-password" v-model="passwordConfirmInput" autocomplete="off"
                                class="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 text-gray-600"
                                name="confirmPassword" required="" type="password" />
                        </div>
                        <span v-if="passwordInput !== passwordConfirmInput">Password and Confirm Password should
                            match</span>
                    </div>

                    <div>
                        <button type="submit"
                            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                            style="background-color: #1e789f;" onmouseover="this.style.backgroundColor='#0B2E4F'"
                            onmouseout="this.style.backgroundColor='#1e789f'" onfocus="this.style.borderColor='#01A6D8';"
                            onblur="this.style.borderColor='transparent';">
                            Create Account
                            <svg v-if="isProgress" class="animate-spin ml-1.5 mr-3 h-5 w-5 text-white" fill="none"
                                viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                                </circle>
                                <path class="opacity-75"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    fill="currentColor"></path>
                            </svg>
                            <CheckCircleIcon v-else class="ml-1.5 h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <div class="overflow-hidden max-h-screen absolute inset-0 w-full h-full -z-10">
            <img :src="bgImg" alt="Background image" class="absolute inset-0 h-full w-full object-cover" />
            <!-- Dark Overlay -->
            <div class="absolute inset-0 bg-black opacity-55"></div>
        </div>
    </div>
</template>


<script lang="ts" setup>
import { ArrowRightOnRectangleIcon, EnvelopeIcon, IdentificationIcon, KeyIcon, AtSymbolIcon, LockClosedIcon, UserIcon, CheckCircleIcon } from "@heroicons/vue/20/solid";
import ActionResultModal from "~/components/modals/ActionResultModal.vue";
import useModalStore from "~/stores/useModalStore";
import { useTenant } from "~/composables/tenants";

const tenant = await (useTenant()).value
const bgImg = tenant?.bgImage
const name = tenant?.name
const logoImg = tenant?.logoImage
const showWaltidLoadingSpinner = tenant?.showWaltidLoadingSpinner

const isProgress = ref(false);
const success = ref(false);
const store = useModalStore();

let nameInput = "";
let emailInput = "";
let passwordInput = "";
let passwordConfirmInput = "";

async function register() {
    if (!validatePassword()) {
        store.openModal({
            component: ActionResultModal,
            props: {
                title: "Error",
                message: "Passwords don't match",
                isError: true,
            },
        });
    } else {
        submit();
    }
}

async function submit() {
    isProgress.value = true;

    const user = {
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        type: "email",
    };
    await $fetch("/wallet-api/auth/create", {
        method: "POST",
        body: user,
    })
        .then((response) => {
            isProgress.value = false;

            store.openModal({
                component: ActionResultModal,
                props: {
                    title: "Account registered",
                    message: "Welcome, " + nameInput + "! You can now login with your email address " + emailInput + " and your chosen password.",
                    isError: false,
                },
            });

            // wait for modal close, then navigate
            nextTick(() => {
                watch(store.$state, () => {
                    navigateTo("/");
                });
            });
        })
        .catch((err) => {
            isProgress.value = false;
            store.openModal({
                component: ActionResultModal,
                props: {
                    title: "Error",
                    message: err.data,
                    isError: true,
                },
            });
        });
}

function validatePassword(): boolean {
    return passwordInput === passwordConfirmInput;
}

definePageMeta({
    title: "Register for your wallet - walt.id",
    layout: "minimal",
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/",
    },
});

useHead({
    title: "Register for your wallet - walt.id",
});
</script>

<style scoped>
@keyframes zoom-in {

    25%,
    100% {
        transform: scale(2);
        //opacity: 0;
        filter: blur(1rem);
    }
}

@keyframes zoom-out {
    0% {
        transform: scale(2);
    }

    100% {
        transform: scale(1);
    }
}

.zoom-in {
    animation: zoom-in 0.4s normal forwards;
}

.zoom-out {
    animation: zoom-out 0.5s normal forwards;
    //animation: none;
}</style>
