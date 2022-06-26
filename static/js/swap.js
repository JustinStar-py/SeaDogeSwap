     /** Connect to Moralis server */
     const provider = 'walletconnect';

     Moralis.start({ serverUrl, appId });
    let CurrentTrade = {};
    let balance_amount  = {};
    let from_token_select_text = document.getElementById("from_token_text");
    let to_token_select_text = document.getElementById("to_token_text");
    let currentUser,token,CurrentSelectSide,toamount,estimatedGas,address,amount,new_amount,balance_token_div,bnb_balance,check_allowance,quote;
    let swap_page = document.getElementById('swap_modal');
    let search_input = document.getElementById("search_input");
    let login_btn = document.getElementById("btn-login");
    let swap_btn = document.getElementById("swap_button");
    let approve_btn = document.getElementById("approve_button");
    let balance = document.getElementById("balance");
    let show_result = document.getElementById("result_modal");
    let setting_page = document.getElementById("settings_modal");
    let son = {
      address: "0x413eca30181f7ed78de38da95f44fc53f664157a",
      decimals: 18,
      logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/14254.png",
      name: "Son of Shib",
      symbol: "SON"
    }
    async function init(){
      try{
        swap_page.style.display = "none";
        currentUser = Moralis.User.current();
        Moralis.enableWeb3();
        check_login();
        user_address = currentUser.get('ethAddress');
      }catch{
          show_loading(false);
       }
      await Moralis.initPlugins();
      await getSupportedTokens();
      if (currentUser){
           check_login();
      }
      }
     async function getSupportedTokens() {
        const result = await Moralis.Plugins.oneInch.getSupportedTokens({
            chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
        });
        tokens = result.tokens;
        tokens["0xC08FC002C5FA45A5c8451a84d3E7145364AC6D1f"] = {
          address: "0xC08FC002C5FA45A5c8451a84d3E7145364AC6D1f",
          decimals: 9,
          logoURI: "https://img1.wsimg.com/isteam/ip/dabd9f0e-1209-4ef9-9dbf-f853dc040e5e/button.png/:/cr=t:7.63%25,l:7.63%25,w:84.75%25,h:84.75%25/rs=w:400,h:400,cg:true,m",
          name: "SeaDoge",
          symbol: "seaDOGE"
        }
        let parent = document.getElementById("token_list");
        let balance_list_parent = document.getElementById("token_balance");

        const options = {chain: 'bsc'}
        const balances = await Moralis.Web3API.account.getTokenBalances(options);
        const bnb_req = await fetch(`https://api.bscscan.com/api?module=account&action=balance&address=${user_address}&apikey=8KVAI7FBADXY11Z9YR1KQGCGU5Z7PEGG4B`);

        bnb_balance = await bnb_req.json();

        if (Number(bnb_balance['result']/10**18).toFixed(7) > 0){
            balance_amount["BNB"] = Number(bnb_balance['result']/10**18).toFixed(7);
        }

        for (const address in tokens){
              token = tokens[address]
              let div = document.createElement('div');
              div.setAttribute('token-address',address)
              div.className = 'token_row p-1';
              for (let TOA in balances){  //toa is token of address
                if (balances[TOA]['token_address'] == token.address){
                    num_amount = Number(balances[TOA]['balance']/10**balances[TOA]['decimals']).toFixed(7);
                    balance_amount[balances[TOA]['name']] = num_amount;
                }
            }

            if (balance_amount[token.name]){
                new_amount = balance_amount[token.name];
                balance_token_div = document.createElement('div');
                let token_balance_info = `
                <p class="amount_tag">${new_amount}</p>
                <img class='token_list_img' src='${token.logoURI}' alt='${token.name}' width='25'>
                <span class='token_list_text'>${token.symbol}</br> <small class='token_name'> ${token.name}<small></span>
                `
                balance_token_div.className = 'balance_div modal-switch';
                balance_token_div.innerHTML = token_balance_info;
                balance_list_parent.appendChild(balance_token_div);
                balance_token_div.onclick = (() => {selectToken(address)});
              } else{
                new_amount = '';
            }

            let token_info = `
                 <img class='token_list_img' src='${token.logoURI}' alt='${token.name}' width='25'>
                 <span class='token_list_text'>${token.symbol} ${new_amount}<br> <small class='token_name'> ${token.name}<small></span>
           `

            div.innerHTML = token_info;
            div.onclick = (() => {selectToken(address)});
            parent.appendChild(div);
        }
    }

    function selectToken(address) {
        close_modal();
        // let address = event.target.getAttribute('token-address');
        console.log(CurrentTrade);
        CurrentTrade[CurrentSelectSide] = tokens[address];
        renderInterface();
      }

    function renderInterface(){
       if(CurrentTrade.from){
          document.getElementById("from_token_img").src = CurrentTrade.from.logoURI;
          from_token_select_text.innerHTML = CurrentTrade.from.symbol;
          if (balance_amount[CurrentTrade.from.name]){
               balance.style.display = 'inline';
               balance.innerHTML = `Balance: ${balance_amount[CurrentTrade.from.name]}`;
          }else{
               balance.innerHTML = 'Balance : -';
          }
       }
       if(CurrentTrade.to){
          document.getElementById("to_token_img").src = CurrentTrade.to.logoURI;
          to_token_select_text.innerHTML = CurrentTrade.to.symbol;
       }
    }

 async function getQuote(){
       let from_amount = document.getElementById("from_amount");
       if (from_amount.value && from_amount.value > balance_amount[CurrentTrade.from.name] || !balance_amount[CurrentTrade.from.name]) {
          swap_btn.innerHTML = "insufficient funds!";
      }else{
         swap_btn.innerHTML = "Start Swapping!";
      }
     if(!CurrentTrade.from || !CurrentTrade.to || !from_amount.value)
           return;
      let amount = Number(
          from_amount.value * 10**CurrentTrade.from.decimals
      )
      quote = await Moralis.Plugins.oneInch.quote({
            chain: 'bsc', // The blockchain you want to use (eth/bsc/polygon)
            fromTokenAddress: CurrentTrade.from.address, // The token you want to swap
            toTokenAddress: CurrentTrade.to.address, // The token you want to receive
            amount: amount,
      });
      console.log(quote);
      toamount = quote.toTokenAmount / (10**CurrentTrade.to.decimals);
      document.getElementById("to_amount").value = toamount
      if (quote.estimatedGas){
         document.getElementById("estimated-Gas").style.display = "block";
         document.getElementById("estimated-Gas").innerHTML = `estimatedGas: ${quote.estimatedGas}`;
      }else{
        document.getElementById("estimated-Gas").style.display = "none";
      }
}

    async function approve(){
          const is_approve = await Moralis.Plugins.oneInch.approve({
             chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
             tokenAddress: CurrentTrade.from.address, // The token you want to swap
             fromAddress: address, // Your wallet address
            });
          if (!is_approve){
            approve_btn.style.display = "block";
            swap_btn.setAttribute('disabled',true);
          }else{
            approve_btn.setAttribute('disabled',true);
            swap_btn.removeAttribute('disabled');
            swap_btn.onclick = (() => {swapping(CurrentTrade.from.name,CurrentTrade.to.name,CurrentTrade.from.logoURI,CurrentTrade.to.logoURI)});
          }
        }

     async function trySwap() {
      address = Moralis.User.current().get("ethAddress");
      from_amount = document.getElementById("from_amount");
      amount = Number(from_amount.value * 10 ** CurrentTrade.from.decimals);
      if (from_amount.value && from_amount.value > balance_amount[CurrentTrade.from.name] || !balance_amount[CurrentTrade.from.name]) {
          swap_btn.innerHTML = "insufficient funds!";
          alert("insufficient funds!");
      }else{
         swap_btn.innerHTML = "Start Swapping!";
         if (CurrentTrade.from.symbol !== "BNB") {
             let allowance = await Moralis.Plugins.oneInch.hasAllowance({
                  chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
                  fromTokenAddress: CurrentTrade.from.address, // The token you want to swap
                  fromAddress: address, // Your wallet address
                  amount: amount,
             });
                console.log(allowance);
              if (!allowance){
                  approve_btn.style.display = "block";
                  swap_btn.setAttribute('disabled',true);
              }else{
                  swapping();
            }
        }else{
          swapping();
        }
     }
}
   function swapping() {
	    const trade_information = {'ToToken':CurrentTrade.to.name,'FromToken':CurrentTrade.from.name,'amount':document.getElementById("from_amount").value,'to-amount':toamount,'UserAddress':`${user_address.substring(0,7)}...`,'estimatedGas':quote.estimatedGas};
      const tokens_logos = {'ToTokenLogo':CurrentTrade.to.logoURI,'FromTokenLogo':CurrentTrade.from.logoURI};
      for (const get_info in trade_information){
          document.getElementById(get_info).innerHTML =  `${get_info}: ${trade_information[get_info]}`;
          for(const get_logo in tokens_logos){
             document.getElementById(get_logo).setAttribute('src',tokens_logos[get_logo]);
          }
     }
      swap_page.style.display = 'block';
      // return Moralis.Plugins.oneInch.swap({
      //   chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
      //   fromTokenAddress: CurrentTrade.from.address, // The token you want to swap
      //   toTokenAddress: CurrentTrade.to.address, // The token you want to receive
      //   amount: amount,
      //   fromAddress: userAddress, // Your wallet address
      //   slippage: 1,
      // });
    }
  async function confirm_swap(){
        swap_page.style.display = "none";
        show_loading(true);
        let swap_info = await swap();
        show_loading(false);
        show_error(swap_info);
        console.log(swap_info);
      }

   async function show_error(information){
       let error_title = document.getElementById("error-title");
       let successful_title = document.getElementById("successful-title");
       let show_result_text = document.getElementById("text_result");
       if (information && information["error"]){
         show_result_text.innerHTML = information["description"];
      }else{
          error_title.style.display = "none";
          successful_title.style.display = "block";
          if (information["description"]){
               show_result_text.innerHTML = information["description"];
          }else{
            show_result_text.innerHTML = information;
          }
      }
      show_result.style.display = "block";
   }

 function cancelling_swap(result){
     if (result["error"] && result["description"]){
         show_error(result["description"]);
         show_loading(false);
     }
 }

 async function swap(){
     address = Moralis.User.current().get("ethAddress");
     from_amount = document.getElementById("from_amount");
     amount = Number(from_amount.value * 10 ** CurrentTrade.from.decimals);
     const Http = new XMLHttpRequest();
     const url=`https://api.1inch.exchange/v3.0/56/swap?fromTokenAddress=${CurrentTrade.from.address}&toTokenAddress=${CurrentTrade.to.address}&amount=${amount}&fromAddress=${address}&slippage=${Number(document.getElementById("slippage-input").value)}&fee=1&referrerAddress=0x9BE4f78a7C2FdCB0D0e1D1fCC78D663e9bbDfE26`;
     Http.open("GET", url);
     Http.send();
     Http.onreadystatechange = (e) => {
       const swap_result = JSON.parse(Http.responseText)
       cancelling_swap(swap_result);
     }
     return await Moralis.Plugins.oneInch.swap({
       chain: "bsc", // The blockchain you want to use (eth/bsc/polygon)
       fromTokenAddress: CurrentTrade.from.address, // The token you want to swap
       toTokenAddress: CurrentTrade.to.address, // The token you want to receive
       amount: amount,
       fromAddress: address, // Your wallet address
       slippage:  Number(document.getElementById("slippage-input").value),
     });

 }
 async function authenticate() {
      try {
        let currentUser = Moralis.User.current();
        if (!currentUser){
          currentUser = await Moralis.Web3.authenticate({signingMessage:"‍‍‍‍Request a wallet connection to the website:"});
          location.reload();
        }
        }catch (error) {
                 console.log('authenticate failed', error);
          }
        }

    async function check_login(){
      currentUser = await Moralis.User.current();
      if (currentUser){
        const address = `User: ${currentUser.get("ethAddress").substring(1,5)}...`;
        login_btn.innerHTML = address;
        show_loading(false);
      }else{
        setTimeout(check_login,1500);
      }
    }

    function open_modal(side){
      if (currentUser){
        CurrentSelectSide = side;
        document.getElementById("token_modal").style.display = 'block';
      }else{
          alert("To use, please connect your wallet!");
      }
  }

    function close_modal(){
      const id_of_modals = ["token_modal","swap_modal","result_modal","settings_modal"];
      for (let id in id_of_modals){
          document.getElementById(id_of_modals[id]).style.display = 'none';
      }
      let from_amount = document.getElementById("from_amount");
      dis_buttons();
      getQuote();
    }
    function dis_buttons(){
      if (from_amount.value && from_amount.value > balance_amount[CurrentTrade.from.name] || CurrentTrade.from && !balance_amount[CurrentTrade.from.name]) {
          swap_btn.innerHTML = "insufficient funds!";
      } else{
           swap_btn.innerHTML = "Start Swapping!";
      }
    }
    function max_amount(){
      if (CurrentTrade.from.name && balance_amount[CurrentTrade.from.name]){
        document.getElementById("from_amount").value = balance_amount[CurrentTrade.from.name];
        getQuote();
      }else{
        document.getElementById("from_amount").value = 0;
      }
   }
   function show_loading(bool){
    if (bool == true){
      if(!CurrentTrade.from){
        document.getElementById('from_token_img').setAttribute('src',"/static/img/circle-logo.png");
        document.getElementById('from_token_img').setAttribute('src',"/static/img/circle-logo.png");
    } if(!CurrentTrade.to){
        document.getElementById('to_token_img').setAttribute('src',"/static/img/circle-logo.png");
    }
      document.getElementById("loading_modal").style.display = 'block';
     }else{
      document.getElementById("loading_modal").style.display = 'none';
     }
}
     init();
  let btns = document.getElementsByClassName("modal_close");
  for (let button in btns){
       btns[button].onclick = close_modal;
}

  function switchmode() {
      var elements_mode = document.getElementsByClassName("modal-switch");
      for (var element in elements_mode){
        if (elements_mode[element].className){
          console.log(elements_mode[element].className);
         elements_mode[element].classList.toggle("dark-mode");
         }
     }
      var elements_mode_2 = document.getElementsByClassName("swapbox");
      for (var element_2 in elements_mode_2){
        if (elements_mode_2[element_2].className){
            elements_mode_2[element_2].classList.toggle("dark-mode-2");
       }
     }
   }

  function show_settings(){
    document.getElementById("settings_modal").style.display = 'block';
  }

  function search_coins(){
      let filter_word = search_input.value.toUpperCase();
      let parent = document.getElementById("token_list");
      let childrens = parent.getElementsByClassName("token_row");
      for (child=0; child < childrens.length ; child++){
            let coin_names = childrens[child].textContent;
            if (coin_names.toUpperCase().indexOf(filter_word) > -1){
               childrens[child].style.display = "";
            }else{
               childrens[child].style.display = "none";
            }
      }
  }

 document.getElementById("from_amount").onblur = getQuote;
 document.getElementById("accept_button").onclick = confirm_swap;
 document.getElementById("done_button").onclick = getQuote;
 document.getElementById("max_button").onclick = max_amount;
 document.getElementById("from_token_select").onclick = (() => {open_modal('from')});
 document.getElementById("to_token_select").onclick = (() => {open_modal('to')});

 swap_btn.onclick = trySwap;
 approve_btn.onclick = approve;
 login_btn.onclick = authenticate







