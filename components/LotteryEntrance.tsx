import { abi, contractAddresses } from "../constants";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { BigNumber, ethers, ContractTransaction } from "ethers";
import { useNotification } from "web3uikit";
import { text } from "stream/consumers";

interface contractAddresses {
    [key: string]: string[];
}

export default function LotteryEntrance() {
    const addresses: contractAddresses = contractAddresses;
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
    const chainId = parseInt(chainIdHex!).toString();
    const raffleAddress =
        chainId in addresses ? addresses[chainId][addresses[chainId].length - 1] : null;
    console.log(`Addresses: ${addresses}`);
    console.log(`ChainID: ${chainId}`);
    console.log(`RaffleAddress: ${raffleAddress}`);
    const [entranceFee, setEntranceFee] = useState("0");
    const [numPlayers, setNumPlayers] = useState("0");
    const [recentWinner, setRecentWinner] = useState("0x");

    const dispatch = useNotification();

    const { runContractFunction: enterRaffle } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    });

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getEntranceFee",
        params: {},
    });

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getNumberOfPlayers",
        params: {},
    });

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress!,
        functionName: "getRecentWinner",
        params: {},
    });

    async function updateUI() {
        const entranceFeeFromCall = ((await getEntranceFee()) as BigNumber).toString();
        const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString();
        const recentWinnerFromCall = (await getRecentWinner()) as string;
        setEntranceFee(entranceFeeFromCall);
        setNumPlayers(numPlayersFromCall);
        setRecentWinner(recentWinnerFromCall);
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const handleSuccess = async (tx: ContractTransaction) => {
        await tx.wait(1);
        handleNewNotification();
        updateUI();
    };

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
        });
    };

    return (
        <div>
            {raffleAddress ? (
                <>
                    <button
                        onClick={async () => {
                            await enterRaffle({
                                onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
                                onError: (error) => console.log(error),
                            });
                        }}
                    >
                        Enter Raffle
                    </button>
                    <div>{ethers.utils.formatUnits(entranceFee, "ether")}</div>
                    <div>Number of Players: {numPlayers}</div>
                    <div>Recent Winner: {recentWinner}</div>
                </>
            ) : (
                <div>No Raffle detected</div>
            )}
        </div>
    );
}
