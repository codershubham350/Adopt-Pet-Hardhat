export function TxError({ message, dismiss }) {
  return (
    <div className="message-warning" role="alert">
      <div>Error sending transaction: {message}</div>
      <br />
      <button type="button dismiss-button" className="close" onClick={dismiss}>
        <div>Dismiss</div>
      </button>
    </div>
  );
}
