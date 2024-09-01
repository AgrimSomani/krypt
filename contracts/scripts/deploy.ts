import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from 'ethers';


const main = async (): Promise<void> => {
    const hre: HardhatRuntimeEnvironment = require('hre')

    const Transactions = (await hre.ethers.getContractFactory("Transactions"))
    const transactions: ethers.Contract = await Transactions.deploy()

    await transactions.deployed()
    console.log("Transaction contract is deployed to: ", transactions.address)
}

const runMain = async (): Promise<void> => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        process.exit(1)
    }
}

runMain()