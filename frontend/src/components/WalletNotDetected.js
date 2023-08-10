export function WalletNotDetected() {
  return (
    <div className="container">
      Wallet not detected. Please install{" "}
      <a
        className="link"
        href="https://metamask.io/download/"
        target="_blank"
        rel="noreferrer"
      >
        MetaMask Browser Extension
      </a>
    </div>
  );
}
