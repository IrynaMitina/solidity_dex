import './SwapCurrencyButton.css'
import React from "react";

function SwapCurrencyButton(props) {
    return (
       <div>
        <div class="swap-currency-button-container">
          <div id="swap-currency-button" color="#222222" onClick={props.onClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#222222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </div>
        </div>
      </div>
    );
}
export default SwapCurrencyButton;