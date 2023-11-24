import './TokenContainer.css'
import React, { useState } from "react";
import ethericon from './ETH.png';
import dvticon from './DVT.jpg';

const TOKENS = {eth: {icon: ethericon, symbol: "ETH"}, dvt: {icon: dvticon, symbol: "DVT"}}

function TokenContainer(props) {
    const [timeoutIsSet, setTimeoutIsSet] = useState(false);
    const [amount, setAmount] = useState();

    function handleChange(event) {
        setAmount(event.target.value);
        if (!timeoutIsSet) {
            const identifier = setTimeout(() => {
                setTimeoutIsSet(false);
                clearTimeout(identifier);
                props.callback(event.target.value);
            }, 500);
            setTimeoutIsSet(true);
        };
    };

    return (
      <div class="token-container">
        <div>{props.title}</div>
        <div class="input-pannel">
          <div class="input-amount"><input onChange={!props.disabled?handleChange:undefined} id={props.id} class="input-token-amount" placeholder="0" disabled={props.disabled} value={!props.disabled?amount:props.amount}/></div>
          <div class="token-repr">
            <img class="token-logo" src={TOKENS[props.token].icon}></img><span>{TOKENS[props.token].symbol}</span>
          </div>
        </div>
        <div class="balance-pannel">
          <div></div><div class="balance-amount">Balance: {props.tokenbalance}</div>
        </div>
      </div>
    );
}

export default TokenContainer;  
// disabled={"BUY"==props.tradeside?true:false
// onChange={"SELL"==props.tradeside?handleChange:undefined}