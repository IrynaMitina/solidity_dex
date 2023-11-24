
import './SwapButton.css'
import React from "react";

function SwapButton(props) {
    return (
        <div>
            <button id="swap-button" onClick={props.onClick} disabled={props.disabled}>
                <div>{props.text}</div>
            </button>
        </div>
    );
}
export default SwapButton;