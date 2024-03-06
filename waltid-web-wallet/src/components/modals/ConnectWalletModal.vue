<template>
    <div class="p-6 max-w-xs mx-auto bg-white rounded-lg shadow-xl overflow-hidden transform transition-all sm:w-full sm:max-w-md">
        <div class="flex justify-end">
            <CloseButton class="cursor-pointer" />
        </div>
        <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-300 mb-4">
            Sign in with Web3:
        </h3>

        <div class="mt-2 grid grid-cols-1 gap-4">
            <div class="flex justify-center items-center gap-2">
                <w3m-connect-button label="Login with WalletConnect" class="w-full" />
            </div>
            <div>
                <a
                    class="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    href="#"
                    @click.prevent="loginWithNear"
                >
                    <img aria-hidden="true" class="h-6 w-6 mr-2" src="/svg/near.svg" alt="NEAR logo" />
                    Login with NEAR
                </a>
            </div>
            <div>
                <a
                    class="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-teal-600 hover:bg-gradient-to-l focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    href="#"
                    @click.prevent="connectToMyAlgo"
                >
                    <img aria-hidden="true" class="h-6 w-6 mr-2" src="/svg/algorand-algo-logo.svg" alt="Algorand logo" />
                    Login with Algorand
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import CloseButton from "./CloseButton.vue";
import ActionResultModal from "~/components/modals/ActionResultModal.vue";
import useModalStore from "~/stores/useModalStore";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import { useUserStore } from "~/stores/user";
import { storeToRefs } from "pinia";

import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
//TODO: generates "ReferenceError: Buffer is not defined" at runtime
// import {setupLedger} from "@near-wallet-selector/ledger";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupOptoWallet } from "@near-wallet-selector/opto-wallet";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupWalletSelector } from "@near-wallet-selector/core";

//import { BeaconWallet } from "@taquito/beacon-wallet";
//import { TezosToolkit } from "@taquito/taquito";
import { getAccount } from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";

import { createWeb3Modal, defaultWagmiConfig, useWeb3ModalEvents, useWeb3ModalState, useWeb3ModalTheme } from "@web3modal/wagmi/vue";


import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";

const store = useModalStore();
const isLogin = ref(false);
const error = ref({});
const success = ref(false);

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
const { status, data, signIn } = useAuth();

const projectId = "92fa9ca65f8b1bb7b140bee3dcd3245e";

const shimmerEthers = {
    chainId: 1073,
    name: "ShimmerEVM Testnet",
    currency: "SMR",
    explorerUrl: "https://explorer.evm.testnet.shimmer.network",
    rpcUrl: "https://json-rpc.evm.testnet.shimmer.network"
};

const shimmer = {
    chainId: 1073,
    name: "ShimmerEVM Testnet",
    network: "shimmer",
    nativeCurrency: {
        decimals: 18,
        name: "SMR",
        symbol: "SMR"
    },
    rpcUrls: {
        default: {
            http: ["https://json-rpc.evm.testnet.shimmer.network"]
            //webSocket: ['wss://rpc.zora.energy'],
        },
        public: {
            http: ["https://json-rpc.evm.testnet.shimmer.network"]
            //webSocket: ['wss://rpc.zora.energy'],
        }
    },
    blockExplorers: {
        default: {
            name: "Explorer",
            url: "https://explorer.evm.testnet.shimmer.network"
        }
    }
};

// 3. Create modal
const metadata = {
    name: "walt.id web wallet",
    description: "Web Wallet by walt.id",
    url: "https://wallet.walt.id",
    icons: []
};

//const chains = [mainnet, shimmer];
const chains = [mainnet, shimmer];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
    wagmiConfig, projectId, chains
});

const { setThemeMode, setThemeVariables, themeMode, themeVariables } = useWeb3ModalTheme();

setThemeVariables({
    "--w3m-accent": "#0B2E4F",
    "--w3m-color-mix": "#000"
});

const continueModalUpdateCheck = ref(true)
const modalWasOpenedOnce = ref(false)

function checkModalUpdate() {
    if (continueModalUpdateCheck.value) {
        window.setTimeout(async () => {
            const state = useWeb3ModalState();

            const events = useWeb3ModalEvents();
            console.log("State: Open=" + state.open + ", selected=" + state.selectedNetworkId + ", EVENTS: " + JSON.stringify(events));

            await onNewModalState(state, events);

            checkModalUpdate()
        }, 1000);
    }
}
checkModalUpdate()

// const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

// const wagmiConfig = createConfig({
//     autoConnect: true,
//     connectors: w3mConnectors({ projectId, chains }),
//     publicClient,
// });

// const ethereumClient = new EthereumClient(wagmiConfig, chains);

async function onNewModalState(
    state: { open: boolean, selectedNetworkId: `${string}:${string}` | undefined; },
    events: {
        timestamp: number;
        data: {
            type: "track";
            event: "MODAL_CREATED";
        } | {
            type: "track";
            event: "MODAL_LOADED";
        } | {
            type: "track";
            event: "MODAL_OPEN";
        } | {
            type: "track";
            event: "MODAL_CLOSE";
        } | {
            type: "track";
            event: "CLICK_ALL_WALLETS";
        } | {
            type: "track";
            event: "SELECT_WALLET";
            properties: {
                name: string;
                platform: import("@web3modal/scaffold").Platform;
            };
        } | {
            type: "track";
            event: "CONNECT_SUCCESS";
            properties: {
                method: "mobile" | "browser" | "qrcode" | "external";
            };
        } | {
            type: "track";
            event: "CONNECT_ERROR";
            properties: {
                message: string;
            };
        } | {
            type: "track";
            event: "DISCONNECT_SUCCESS";
        } | {
            type: "track";
            event: "DISCONNECT_ERROR";
        } | {
            type: "track";
            event: "CLICK_WALLET_HELP";
        } | {
            type: "track";
            event: "CLICK_NETWORK_HELP";
        } | {
            type: "track";
            event: "CLICK_GET_WALLET";
        } | {
            type: "track";
            event: "CLICK_TRANSACTIONS";
        } | {
            type: "track";
            event: "ERROR_FETCH_TRANSACTIONS";
            properties: {
                address: string;
                projectId: string;
                cursor: string | undefined;
            };
        } | {
            type: "track";
            event: "LOAD_MORE_TRANSACTIONS";
            properties: {
                address: string | undefined;
                projectId: string;
                cursor: string | undefined;
            };
        }
    }
) {
    if (state.open) {
        modalWasOpenedOnce.value = true
        store.closeModal();
    }

    if (!state.open && modalWasOpenedOnce.value /*&& events?.data?.event == "CONNECT_SUCCESS"*/) {
        const account = getAccount();
        console.log("Wagmi account: ", account);

        if (account.status === "connected" && account.address.startsWith("0x")) {
            continueModalUpdateCheck.value = false

            console.log("WE WILL NOW CONTINUE");

            const userData = {
                address: account.address,
                email: account.address,
                ecosystem: "ethereum"
            };
            await signIn(
                {
                    address: userData.address,
                    ecosystem: "ethereum",
                    type: "address"
                },
                { callbackUrl: "/settings/tokens" }
            ).then((data) => {
                user.value = {
                    id: userData.address,
                    email: userData.email
                };
            });
            isLogin.value = true;
        }
    }
}

// if (process.client) {
// const web3modal = new Web3Modal(
//     {
//         projectId,
//         themeVariables: {
//             "--w3m-accent-color": "#FFF",
//             "--w3m-accent-fill-color": "#000",
//         },
//     },
//     ethereumClient,
// );

/*web3modal.subscribeModal(async (newState) => {
    await onModalUpdate(newState);
});*/
// }

const config = useRuntimeConfig();

const myAlgoWallet = new MyAlgoConnect();
const settings = {
    shouldSelectOneAccount: true
};

async function connectToMyAlgo() {
    console.log("logging in");
    //   try {
    const accounts = await myAlgoWallet.connect(settings);
    const account = accounts[0];

    const userData = {
        address: account.address,
        email: account.name,
        ecosystem: "algorand"
    };
    await signIn(
        {
            address: userData.address,
            ecosystem: userData.ecosystem,
            type: "address"
        },
        { callbackUrl: "/settings/tokens" }
    ).then((data) => {
        store.closeModal();
        user.value = {
            id: userData.address,
            email: userData.email
        };
    });
    isLogin.value = true;
}

function comingSoon() {
    store.openModal({
        component: ActionResultModal,
        props: {
            title: "Coming soon",
            message: "Stay tuned for updates.",
            isError: true
        }
    });
}

async function loginWithNear() {
    store.closeModal();
    const selector = await setupWalletSelector({
        network: "testnet",
        modules: [
            setupNearWallet(),
            setupMyNearWallet(),
            setupSender(),
            setupHereWallet(),
            setupMathWallet(),
            setupNightly(),
            setupNarwallets(),
            // setupNeth(),
            setupWelldoneWallet(),
            // setupLedger(),
            setupNearFi(),
            setupCoin98Wallet(),
            setupOptoWallet()
        ]
    });

    const modal = setupModal(selector, {
        contractId: "",
        methodNames: undefined,
        theme: undefined,
        description: "connect to a wallet"
    });
    modal.show();

    modal.on("onHide", async (event) => {
        console.log("event", event);
        if (event.hideReason == "wallet-navigation") {
            const isSignedIn = selector.isSignedIn();

            if (isSignedIn) {
                const selectedAccount = selector.store.getState().accounts[0].accountId;

                const userData = {
                    address: selectedAccount,
                    email: selectedAccount,
                    ecosystem: "near"
                };

                user.value = {
                    id: userData.address,
                    email: userData.email
                };

                try {
                    await signIn(
                        {
                            address: userData.address,
                            ecosystem: userData.ecosystem,
                            type: "address"
                        },
                        { callbackUrl: "/settings/tokens" }
                    );
                    store.closeModal();

                    isLogin.value = true;
                } catch (error) {
                    // Handle any errors that might occur during the signIn process
                    console.error("Error during signIn:", error);
                }
            } else {
                console.log("No account selected");
            }
        }
    });
}

async function polkadotjsWallet() {
    // Request permission to access accounts
    const extensions = await web3Enable("Walt.id | Wallet");
    if (extensions.length === 0) {
        // No extension installed, or the user did not accept the authorization
        return;
    }

    // Get all the accounts
    const allAccounts = await web3Accounts();
    if (allAccounts.length === 0) {
        // No account has been found
        return;
    }

    // Use the first account
    const account = allAccounts[0];

    const userData = {
        address: account.address,
        email: account.address,
        ecosystem: "algorand"
    };

    await signIn(
        {
            address: userData.address,
            ecosystem: userData.ecosystem,
            type: "address"
        },
        { callbackUrl: "/settings/tokens" }
    ).then((data) => {
        store.closeModal();
        user.value = {
            id: userData.address,
            email: userData.email
        };
    });
    isLogin.value = true;
}
</script>
