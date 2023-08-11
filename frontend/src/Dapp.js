import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { PetItem } from "./components/PetItem";
import { TxError } from "./components/TxError";
import { WalletNotDetected } from "./components/WalletNotDetected";
import { ConnectWallet } from "./components/ConnectWallet";

import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address-localhost.json";
import PetAdoptionArtifact from "./contracts/PetAdoption.json";

const HARDHAT_NETWORK_ID = parseInt(process.env.REACT_APP_NETWORK_ID);

function Dapp() {
  const [pets, setPets] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [adoptedPets, setAdoptedPets] = useState([]);

  useEffect(() => {
    async function fetchPets() {
      const response = await fetch("/pets.json");
      const data = await response.json();
      setPets(data);
    }
    fetchPets();
  }, []);

  async function connectWallet() {
    try {
      const [address] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      await checkNetwork();
      initializeDapp(address);

      await window.ethereum.on("accountsChanged", ([newAddress]) => {
        if (newAddress === undefined) {
          setAdoptedPets([]);
          setSelectedAddress(undefined);
          setContract(undefined);
          return;
        }
        initializeDapp(newAddress);
      });
    } catch (e) {
      console.error(e.message);
    }
  }

  async function initializeDapp(address) {
    setSelectedAddress(address);
    const contract = await initContract();
    getAdoptedPets(contract);
  }

  async function initContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress.PetAdoption,
      PetAdoptionArtifact.abi,
      await provider.getSigner(0)
    );

    setContract(contract);
    return contract;
  }

  async function getAdoptedPets(contract) {
    try {
      const adoptedPets = await contract.getAllAdoptedPets();

      if (adoptedPets.length > 0) {
        setAdoptedPets(adoptedPets.map((petIdx) => parseInt(petIdx))); // Big Number to Number
      } else {
        setAdoptedPets([]);
      }
      // console.log(adoptedPets);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function adoptPet(id) {
    try {
      const tx = await contract.adoptPet(id);
      const receipt = await tx.wait();

      if (receipt.status === 0) {
        throw new Error("Transaction failed!");
      }

      setAdoptedPets([...adoptedPets, id]);
      alert(`Pet with id: ${id} has been adopted`);
    } catch (error) {
      console.error(error.reason);
    }
  }

  async function switchNetwork() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`;

    return await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  }

  function checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID.toString()) {
      return switchNetwork();
    }

    return null;
  }

  if (!window.ethereum) {
    return <WalletNotDetected />;
  }

  if (!selectedAddress) {
    return <ConnectWallet connect={connectWallet} />;
  }
  return (
    <div className="container">
      <TxError />
      {JSON.stringify(adoptedPets)}
      <br />
      <Navbar address={selectedAddress} />
      <div className="items">
        {pets.map((pet) => (
          <div key={pet.id}>
            <PetItem pet={pet} key={pet.id} adoptPet={() => adoptPet(pet.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dapp;
