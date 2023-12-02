import './Header.css'
import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { connectWallet, disconnectWallet, refreshBalances } from './walletSlice'
import {refreshPoolReserves}  from './LPSlice'

function navClickHandler(event) {
  const navigation = document.getElementById("navigation");
  console.log(event.target);
  for (const navlink of navigation.children) {
    console.log(navlink);
    navlink.className.replace(" active", "");
  }
  event.target.className += " active";
};

function truncateAddress(addr) {
  if (addr) {
    return addr.substring(0,6) + '...' + addr.substring(addr.length-4,addr.length-1);
  };
  return "";
};

function Header() {
    const account = useSelector((state) => state.wallet.account);
    const web3 = useSelector((state) => state.wallet.web3);
    const dispatch = useDispatch();

    useEffect(() => { 
      dispatch(refreshBalances(web3));
      dispatch(refreshPoolReserves(web3));
    }, [web3, dispatch]);

    function ConnectWalletHandler(t) {
      t.preventDefault();
      try {
        if (!account) {
          dispatch(connectWallet());
        } else {
          dispatch(disconnectWallet());
        }
      } catch (error) {
        console.log(error.message);
        alert(error.message);
      }
    }

    return (
      <div class="header">
        <div id="navigation">
          <Link onClick={navClickHandler} class="nav-item" to='/swap'>Swap</Link><Link onClick={navClickHandler} class="nav-item" to='/pool'>Pool</Link><Link onClick={navClickHandler} class="nav-item" to='/stake'>Stake</Link>
        </div>
        <div></div>
        <div class="account-pannel"> 
          <div id="account">{truncateAddress(account)}</div><button id="connect-wallet-button" onClick={ConnectWalletHandler}><div>{account?'Disconnect':'Connect'} wallet</div></button>
        </div>
        </div>
    );
}
export default Header;