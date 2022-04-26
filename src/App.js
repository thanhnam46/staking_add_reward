import './App.css';
import FestakedWithReward from './contracts/FestakedWithReward.json'
import Web3 from "web3/dist/web3.min"
import BigNumber from "bignumber.js"
import tokenContract from './contracts/tokenContract.json'
import { useState } from 'react'

function App() {

  // const stakingContractAddr = "0x0d0791b125689bA5152F4940dACD54dBfB850618"
  const stakingContractAddr = "0x1FE470E4E533EeA525b2f2c34a9EbB995597C143"
  const [account, setAccount] = useState(
    "0x0000000000000000000000000000000000000000"
  )
  const [msg, setMsg] = useState('')


  connectMM()
  async function connectMM() {
    const accounts = await window.ethereum.request(
      { method: "eth_requestAccounts" },
      (error) => {
        if (error) {
          console.log(error)
        }
      }
    )
    setAccount(accounts[0])
  }

  // On Account Changed
  function onAccountChange() {
    window.ethereum.on("accountsChanged", async () => {
      setAccount(window.ethereum.selectedAddress)
    })
  }

  const web3 = new Web3("https://data-seed-prebsc-1-s1.binance.org:8545/")
  web3.eth.setProvider(Web3.givenProvider) // chuyen sang MM provider, neu khong se gap loi Returned error: unknown account

  // Initiate Staking Contract
  const stakingContract = new web3.eth.Contract(
    FestakedWithReward.abi,
    stakingContractAddr
  )

  // Initiate token contract
  const tokenAddr = "0x476f7BcbC4058d4a0E8C0f9a6Df1fdcF675FAC83"

  const tokenNPO = new web3.eth.Contract(tokenContract.abi, tokenAddr)


  window.ethereum.on("accountsChanged", async () => {
    setAccount(window.ethereum.selectedAddress)
  })

  async function addReward() {
    if (window.ethereum.networkVersion !== "97") {
      setMsg(`Please connect to BSC testnet`)
    } else {
      setMsg(`Please approve ALLOWANCE on your Metamask`)

      let totalReward = document.getElementById('total').value
      let earlyReward = document.getElementById('early').value

      totalReward = BigNumber(totalReward * 1e18).toFixed(0)
      earlyReward = BigNumber(earlyReward * 1e18).toFixed(0)
      await tokenNPO.methods.approve(stakingContractAddr, totalReward).send({ from: account })
        .on('transactionHash', (hash) => {
          setMsg(`Processing, please wait!`)
        })
        .on('receipt', (receipt) => {
          setMsg(`Please approve TRANSACTION on your Metamask`)

          stakingContract.methods.addReward(totalReward, earlyReward).send({ from: account })
            .on('transactionHash', (hash) => {
              setMsg(`Processing, please wait!`)
            })
            .on('receipt', (receipt) => {
              console.log(receipt)
              setMsg(`Add reward successfully, txHash: ${receipt.transactionHash}`)
            })
        })
    }
  }

  return (
    <div className="App">
      <p>Your acount: {account}</p>
      <p>Contract Address: {stakingContractAddr}</p>
      Total reward<input id='total' value={`100`} readOnly />
      Early reward<input id='early' value={`15`} readOnly />
      <a className='btn' onClick={addReward}>Add reward</a>
      <p className='msg'>{msg}</p>
    </div>
  );
}

export default App;
