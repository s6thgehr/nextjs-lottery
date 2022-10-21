import { ConnectButton } from "web3uikit";

export default function Header() {
    return (
        <div>
            Smart Contract Lottery
            <ConnectButton moralisAuth={false} />
        </div>
    );
}
