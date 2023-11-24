import './Header.css'
import React from "react";
import { Link } from 'react-router-dom';

function clickHandler(event) {
  const navigation = document.getElementById("navigation");
  console.log(event.target);
  for (const navlink of navigation.children) {
    console.log(navlink);
    navlink.className.replace(" active", "");
  }
  event.target.className += " active";
}

function Header(props) {
    return (
      <div class="header">
        <div id="navigation">
          <Link onClick={clickHandler} class="nav-item" to='/swap'>Swap</Link><Link onClick={clickHandler} class="nav-item" to='/pool'>Pool</Link><Link onClick={clickHandler} class="nav-item" to='/stake'>Stake</Link>
        </div>
        <div></div>
        <div class="account-pannel"> 
          <div id="account">{props.account}</div><button id="connect-wallet-button" onClick={props.onClick}><div>{props.account?'Disconnect':'Connect'} wallet</div></button>
        </div>
        </div>
    );
}
export default Header;