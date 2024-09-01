import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { Contract, ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

interface FormDataType {
  addressTo: string;
  amount: string;
  keyword: string;
  message: string;
}

interface StructuredTransaction {
  addressTo: string;
  addressFrom: string;
  timestamp: string;
  message: string;
  keyword?: string;
  amount: number;
}

interface TransactionContextType {
  connectWallet: () => Promise<void>;
  currentAccount: string;
  formData: FormDataType;
  handleChange: (e: ChangeEvent<HTMLInputElement>, name: string) => void;
  sendTransaction: () => Promise<void>;
  transactions: StructuredTransaction[];
}

export const TransactionContext = React.createContext<TransactionContextType>({
  connectWallet: async () => {},
  currentAccount: "",
  formData: {
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  },
  handleChange: (e: React.ChangeEvent<HTMLInputElement>, name: string) => {},
  sendTransaction: async () => {},
  transactions: [],
});
const { ethereum } = window;

const getEthereumContract = async () => {
  if (!ethereum) {
    alert("Please install Metamask!");
  }
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const transactionContract = new Contract(
    contractAddress,
    contractABI,
    signer
  );
  return { signer, transactionContract };
};

interface TransactionProviderItemsProp {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderItemsProp> = ({
  children,
}) => {
  const [currentAccount, setCurrentAccount] = useState<string>("");
  const [formData, setFormData] = useState<FormDataType>({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [transactions, setTransactions] = useState<StructuredTransaction[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, name: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: e.target.value,
    }));
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        alert("Please install Metamask!");
      }
      const accounts = await ethereum.request<string[]>({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setCurrentAccount(accounts[0] || "");
        await retrieveTransactions();
      } else {
        console.log("No Accounts Found");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No Ethereum Object");
    }
  };

  const sendTransaction = async () => {
    try {
      const { addressTo, amount, keyword, message } = formData;
      const { transactionContract, signer } = await getEthereumContract();
      const parsedAmount = ethers.parseEther(amount);

      const tx = await signer.sendTransaction({
        to: addressTo,
        value: parsedAmount,
      });

      console.log("Sending ether now!");

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      console.log(`Success - ${transactionHash.hash}`);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object");
    }
  };

  const retrieveTransactions = async () => {
    try {
      const { transactionContract } = await getEthereumContract();
      const transactions: [] = await transactionContract.getAllTransactions();
      const structuredTransactions = transactions.map((transaction, item) => ({
        addressTo: transaction[0],
        addressFrom: transaction[1],
        timestamp: new Date(Number(transaction[2]) * 1000).toLocaleString(),
        message: transaction[3],
        keyword: transaction[5],
        amount: Number(transaction[2]) / 10 ** 18,
      }));
      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
      throw new Error("No Ethereum Object");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
        transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
