import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-waffle';


const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia:{
      url: 'https://eth-sepolia.g.alchemy.com/v2/c5Drvy6aQ7frkg8JqqITN9kk-t_Nc4lp',
      accounts: ['0xc851f4c81e216ceb862c8ffc081a06ff054b7c5fb637159506da54975bd52adc']
    }
  }
};

export default config;
