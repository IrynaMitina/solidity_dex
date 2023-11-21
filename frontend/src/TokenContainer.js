import './TokenContainer.css'
import React, { useState } from "react";

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
          <div class="input-amount"><input onChange={"SELL"==props.tradeside?handleChange:undefined} id={props.operationid} class="input-token-amount" placeholder="0" disabled={"BUY"==props.tradeside?true:false} value={"SELL"==props.tradeside?amount:props.amount}/></div>
          <div class="token-repr">
            <img class="token-logo" src={props.tokenicon}></img><span>{props.tokensymbol}</span>
          </div>
        </div>
        <div class="balance-pannel">
          <div></div><div class="balance-amount">Balance: {props.tokenbalance}</div>
        </div>
      </div>
    );
}

export default TokenContainer;