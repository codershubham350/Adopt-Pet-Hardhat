export function ConnectWallet({ connect }) {
  return (
    <div className="container">
      <div>Please, connect to Wallet to enter the application.</div>
      <br />
      <div>
        <button className="action-button" onClick={connect}>
          Connect to Wallet
        </button>
      </div>
    </div>
  );
}
