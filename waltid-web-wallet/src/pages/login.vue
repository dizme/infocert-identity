<template>
    <div class="flex items-center justify-center min-h-screen">
        <div class="mx-auto w-full max-w-lg p-5 lg:rounded-xl shadow-lg lg:bg-white lg:bg-opacity-65 lg:backdrop-blur-md">
            <div class="text-center">
                <img :src="logoImg" alt="Company Logo" class="h-20 w-auto mx-auto" />
                <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Access Your Wallet</h2>
                <p class="mt-2 text-sm text-gray-600">
                    Don't have an account?
                    <NuxtLink class="font-medium text-indigo-600 hover:text-indigo-500" to="/signup">Create one now
                    </NuxtLink>
                </p>
            </div>
            <!-- Email and Password Form -->
            <form class="mt-6 space-y-6" @submit.prevent="login">
                <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900" for="email">
                        <span class="flex flex-row items-center">
                            <AtSymbolIcon class="h-5 mr-1" />
                            Email address
                        </span>
                    </label>
                    <div class="mt-2">
                        <input id="email" v-model="emailInput" autocomplete="email" autofocus
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            name="email" required type="email" />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium leading-6 text-gray-900" for="password">
                        <span class="flex flex-row items-center">
                            <LockClosedIcon class="h-5 mr-1" />
                            Password
                        </span>
                    </label>
                    <div class="mt-2">
                        <input id="password" v-model="passwordInput" autocomplete="current-password"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                            name="password" required type="password" />
                    </div>
                </div>

                <!-- The rest of your form components like "Forgot your password?" link and "Remember me" checkbox can be added here if needed -->
                <div>
                    <button type="submit"
                        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                        style="background-color: #1e789f;" onmouseover="this.style.backgroundColor='#0B2E4F'"
                        onmouseout="this.style.backgroundColor='#1e789f'" onfocus="this.style.borderColor='#01A6D8';"
                        onblur="this.style.borderColor='transparent';">
                        Login
                    </button>
                </div>
            </form>
            <!-- Or Continue With Section -->
            <div class="relative mt-6">
                <div aria-hidden="true" class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300" />
                </div>
                <div class="relative flex justify-center text-sm">
                    <span class="bg-white px-2 text-gray-500 rounded-3xl">Or continue with</span>
                </div>
            </div>
            <div class="mt-8">
                <div class="grid grid-cols-1 gap-4">
                    <button class="btn-crypto" @click="openWeb3()">
                        Sign In with Crypto Wallet
                        <svg class="ml-3 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>

                    <button class="btn-oidc" @click="connectOidc()">
                        Sign In with OIDC
                        <svg class="ml-3 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>

                </div>
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
import { ArrowRightOnRectangleIcon, BookmarkSquareIcon, EnvelopeIcon, IdentificationIcon, QuestionMarkCircleIcon, AtSymbolIcon, LockClosedIcon } from "@heroicons/vue/20/solid";
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from "@headlessui/vue";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { usePageLeave, useParallax } from "@vueuse/core";
import ConnectWalletModal from "~/components/modals/ConnectWalletModal.vue";
import useModalStore from "~/stores/useModalStore";
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";
import { useTenant } from "~/composables/tenants";
import { CRYPTO_JWT_TTL } from "@walletconnect/core";
import { decodeJWT } from "@walletconnect/relay-auth";

const store = useModalStore();

const tenant = await useTenant().value;
const bgImg = tenant?.bgImage;
const name = tenant?.name;
const logoImg = tenant?.logoImage;
const showWaltidLoadingSpinner = tenant?.showWaltidLoadingSpinner;

const isLoggingIn = ref(false);
const error = ref({});
const success = ref(false);

let emailInput = "";
let passwordInput = "";

const userStore = useUserStore();
const { user } = storeToRefs(userStore);

const { status, data, signIn } = useAuth();

const signInRedirectUrl = ref("/");

async function connectOidc() {
    navigateTo("/wallet-api/auth/oidc-login", { external: true });
}

async function login() {
    console.log("logging in");
    isLoggingIn.value = true;

    const userData = {
        email: emailInput,
        password: passwordInput,
    };

    // try {
    await signIn({ email: emailInput, password: passwordInput, type: "email" }, { callbackUrl: signInRedirectUrl.value })
        .then((data) => {

            user.value = {
                id: "",
                email: userData.email,
            };
        })
        .catch((err) => {
            console.log("Could not sign in", err);
            error.value = {
                isError: true,
                message: "Please check that you have entered your correct email address and password!", //(await response.text())
            };
            isLoggingIn.value = false;
        });
}

function closeModal() {
    error.value = {};
}

function openWeb3() {
    console.log("open web3");

    store.openModal({
        component: ConnectWalletModal,
    });
}

definePageMeta({
    title: "Login to your wallet - walt.id",
    layout: "minimal",
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: "/",
    },
});
const container = ref(null);
const parallax = reactive(useParallax(container));
const isLeft = reactive(usePageLeave());
const cardStyle = computed(() => ({
    overflow: "hidden",
    transition: ".5s ease-out all",
    transform: `rotateX(${parallax.source == "mouse" && (isLeft.value || parallax.roll == 0.5) ? 0 : parallax.roll * 60}deg) rotateY(
    ${parallax.source == "mouse" && (isLeft.value || parallax.tilt == -0.5) ? 0 : parallax.tilt * 60}deg)`,
}));

useHead({
    title: "Login to your InfoCert wallet",
});

const route = useRoute();
if (route.redirectedFrom != undefined) {
    console.log(`Redirected from: ${JSON.stringify(route.redirectedFrom)}`);
    signInRedirectUrl.value = route.redirectedFrom.fullPath;
}

const isOidcLogin = ref(route.query.oidc_login == "true");

async function tryLoginWithOidcSession() {
    const token = await fetch("/wallet-api/auth/oidc-token", {
        redirect: "manual",
    });

    console.log(token);

    const tokenText = await token.text();
    console.log(tokenText);

    await signIn(
        {
            email: emailInput,
            token: tokenText,
            type: "oidc",
        },
        { callbackUrl: signInRedirectUrl.value },
    )
        .then(() => {
            user.value = {
                token: tokenText,
                id: "",
                email: decodeJWT(tokenText).payload.email,
                name: decodeJWT(tokenText).payload.name,
                oidcSession: true
            };

            console.log("Wrote to user: " + JSON.stringify(user.value))
        })
        .catch((err) => {
            console.log("Could not sign in", err);
            error.value = {
                isError: true,
                message: "Your OIDC sign in failed.",
            };
            isLoggingIn.value = false;
            isOidcLogin.value = false;
        });
}

if (isOidcLogin.value) {
    tryLoginWithOidcSession();
}
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
}

.btn-crypto {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 6px 24px;
    border: none;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    font-weight: medium;
    border-radius: 8px;
    color: white;
    background: linear-gradient(to right, #1e789f, #0B2E4F);
    transition: background 0.3s ease;
}

.btn-crypto:hover {
    background: linear-gradient(to right, #0B2E4F, #1A6D8);
}

.btn-crypto:focus {
    border-color: #01A6D8;
    outline: none;
}

.btn-crypto:focus:not(:focus-visible) {
    border-color: transparent;
}

.btn-oidc {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 6px 24px;
    border: none;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    font-weight: medium;
    border-radius: 8px;
    color: white;
    background: linear-gradient(to right, #18515b, #019DC8);
    transition: background 0.3s ease, border-color 0.3s ease;
}

.btn-oidc:hover {
    background: linear-gradient(to right, #18515b, #019DC8);
}

.btn-oidc:focus {
    border-color: #818387;
    outline: none;
}

.btn-oidc:focus:not(:focus-visible) {
    border-color: transparent;
}
</style>

