import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { PetItem } from "./components/PetItem";
import { TxError } from "./components/TxError";
import { WalletNotDetected } from "./components/WalletNotDetected";
import { ConnectWallet } from "./components/ConnectWallet";

import { ethers } from "ethers";
import contractAddress from "./contracts/contract-address-localhost.json";
import PetAdoptionArtifact from "./contracts/PetAdoption.json";
import { TxInfo } from "./components/TxInfo";

const HARDHAT_NETWORK_ID = parseInt(process.env.REACT_APP_NETWORK_ID);

function Dapp() {
  const [pets, setPets] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [ownedPets, setOwnedPets] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(undefined);
  const [contract, setContract] = useState(undefined);
  const [txError, setTxError] = useState(undefined);
  const [txInfo, setTxInfo] = useState(undefined);
  const [view, setView] = useState("home");

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
          setOwnedPets([]);
          setSelectedAddress(undefined);
          setContract(undefined);
          setTxError(undefined);
          setTxInfo(undefined);
          setView("home");
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
        // console.log(adoptedPets); // Getting Big Number data which we have to convert it to Number or parse it to INT
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
      setTxInfo(tx.hash);
      const receipt = await tx.wait();

      await new Promise((res) => setTimeout(res, 2000));

      if (receipt.status === 0) {
        throw new Error("Transaction failed!");
      }

      // alert(`Pet with id: ${id} has been adopted`);
      setAdoptedPets([...adoptedPets, id]);
      setOwnedPets([...ownedPets, id]);
    } catch (error) {
      setTxError(error?.reason || error?.message);
    } finally {
      setTxInfo(undefined);
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
      {txInfo && <TxInfo message={txInfo} />}
      {txError && (
        <TxError message={txError} dismiss={() => setTxError(undefined)} />
      )}
      <br />
      <Navbar setView={setView} address={selectedAddress} />
      <div className="items">
        {view === "home"
          ? pets.map((pet) => (
              <PetItem
                pet={pet}
                key={pet.id}
                inProgress={!!txInfo}
                adoptPet={() => adoptPet(pet.id)}
                disabled={adoptedPets.includes(pet.id)}
              />
            ))
          : JSON.stringify(ownedPets)}
      </div>
    </div>
  );
}

export default Dapp;
