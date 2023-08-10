import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { PetItem } from "./components/PetItem";
import { TxError } from "./components/TxError";
import { WalletNotDetected } from "./components/WalletNotDetected";
import { ConnectWallet } from "./components/ConnectWallet";

const HARDHAT_NETWORK_ID = 31337;

function Dapp() {
  const [pets, setPets] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(undefined);

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
      setSelectedAddress(address);
    } catch (e) {
      console.error(e.message);
    }
  }

  function checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID.toString()) {
      alert("Switching To Hardhat!");
      return;
    }

    alert("Correct Network. Do not switch!");
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
      <br />
      <Navbar address={selectedAddress} />
      <div className="items">
        {pets.map((pet) => (
          <div key={pet.id}>
            <PetItem pet={pet} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dapp;
