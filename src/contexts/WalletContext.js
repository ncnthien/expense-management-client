import React, { useEffect, useState } from 'react';
import moment from 'moment';

import walletApi from '../api/walletApi';

export const WalletContext = React.createContext();

const calculateFlow = (currentWallets) => {
	let inflow = 0;
	let outflow = 0;

	currentWallets.forEach((wallet) => {
		wallet.transactions.forEach((transaction) => {
			transaction.expenses.forEach((expense) => {
				if (expense.isIncome) {
					inflow += expense.expense;
				}
				if (!expense.isIncome) {
					outflow += expense.expense;
				}
			});
		});
	});

	return [inflow, outflow];
};

export const WalletProvider = (props) => {
	const [wallets, setWallets] = useState(null);
	const [total, setTotal] = useState(0);
	const [currentWallet, setCurrentWallet] = useState(null);
	const [inflow, setInflow] = useState(0);
	const [outflow, setOutflow] = useState(0);

	useEffect(() => {
		const getWalletsUser = async () => {
			try {
				const { wallets: gotWallets, virtualWallet } = await walletApi.get();
				setWallets(gotWallets);
				setCurrentWallet(virtualWallet);
				setTotal(virtualWallet.accountBalance);
			} catch (error) {
				console.log(error);
			}
		};

		getWalletsUser();
	}, []);

	// // Set total
	// useEffect(() => {
	// 	if (wallets) {
	// 		const total = calculateTotal(wallets);
	// 		setTotal(total);
	// 	}
	// }, [wallets]);

	// calculate inflow, outflow wallets
	useEffect(() => {
		if (!currentWallets) return;

		const [inflow, outflow] = calculateFlow(currentWallets);
		// console.log(inflow, outflow);
		setInflow(inflow);
		setOutflow(outflow);
	}, [currentWallets, wallets]);

	const updateWallet = (updatedWallet) => {
		const newWallets = [...wallets];
		const walletIndex = newWallets.findIndex(
			(wallet) => wallet.walletName === updatedWallet.walletName
		);
		newWallets.splice(walletIndex, 1, updatedWallet);
		setWallets(newWallets);
	};

	return (
		<WalletContext.Provider
			value={{
				wallets,
				total,
				currentWallet,
				inflow,
				outflow,
				updateWallet,
			}}
		>
			{props.children}
		</WalletContext.Provider>
	);
};
