const tokenAbi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_to",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "type": "function"
    }
];

const networks = {
    '0x1': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: ['https://etherscan.io']
    },
    '0x38': {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
        blockExplorerUrls: ['https://bscscan.com']
    },
    '0x89': {
        chainId: '0x89',
        chainName: 'Polygon',
        rpcUrls: ['https://polygon-rpc.com/'],
        nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
        blockExplorerUrls: ['https://polygonscan.com']
    },
    '0xa86a': {
        chainId: '0xa86a',
        chainName: 'Avalanche',
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
        blockExplorerUrls: ['https://snowtrace.io']
    },
    '0xfa': {
        chainId: '0xfa',
        chainName: 'Fantom',
        rpcUrls: ['https://rpcapi.fantom.network'],
        nativeCurrency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
        blockExplorerUrls: ['https://ftmscan.com']
    },
    '0x64': {
        chainId: '0x64',
        chainName: 'xDai',
        rpcUrls: ['https://rpc.xdaichain.com/'],
        nativeCurrency: { name: 'xDai', symbol: 'xDAI', decimals: 18 },
        blockExplorerUrls: ['https://blockscout.com/poa/xdai']
    }
};

// Add your JavaScript logic here
async function checkNetworkAndSwitch(targetNetworkId) {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== targetNetworkId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetNetworkId }],
            });
            document.getElementById('connectionStatus').innerText = `Switched to network ${targetNetworkId}`;
        } catch (error) {
            if (error.code === 4902) {
                // If the network is not added, add it
                const networkData = networks[targetNetworkId];
                if (networkData) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkData]
                    });
                } else {
                    alert('This network is not available in your MetaMask, please add it manually.');
                }
            } else {
                console.error('Failed to switch network:', error);
            }
        }
    }
}

document.getElementById('connectButton').addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        const web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.enable();
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                document.getElementById('connectionStatus').innerText = 'MetaMask is connected';
                document.getElementById('connectedAddress').style.display = 'block';
                document.getElementById('address').innerText = accounts[0];
                document.getElementById('paymentForm').style.display = 'block';
                const targetNetworkId = document.getElementById('networkSelect').value;
                await checkNetworkAndSwitch(targetNetworkId);
            } else {
                document.getElementById('connectionStatus').innerText = 'MetaMask is not connected';
            }
        } catch (error) {
            document.getElementById('connectionStatus').innerText = 'MetaMask connection failed';
        }
    } else {
        document.getElementById('connectionStatus').innerText = 'MetaMask is not installed';
    }
});

document.getElementById('switchNetworkButton').addEventListener('click', async () => {
    const targetNetworkId = document.getElementById('networkSelect').value;
    await checkNetworkAndSwitch(targetNetworkId);
});

document.getElementById('paymentForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const contractAddress = document.getElementById('contractAddress').value;
    const amount = document.getElementById('amount').value;
    const recipient = document.getElementById('recipient').value;
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const tokenContract = new web3.eth.Contract(tokenAbi, contractAddress);
    const amountInWei = web3.utils.toWei(amount, 'ether'); // Adjust decimals as needed
    tokenContract.methods.transfer(recipient, amountInWei).send({ from: accounts[0] })
        .on('transactionHash', (hash) => {
            console.log('Transaction sent:', hash);
        })
        .on('receipt', (receipt) => {
            console.log('Transaction confirmed:', receipt);
        })
        .on('error', (error) => {
            console.error('Transaction error:', error);
        });
});