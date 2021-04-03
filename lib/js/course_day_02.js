/**
 * 以太坊錢包Javascript 前/後端
 * Javascript Frontend/backend for Ethereum Wallet
 * 
 * 課程 2/3: 2 小時
 * 1) 取得ERC-20 通證餘額
 * 2) 取得交易歷史
 * 3) 取得交易明細 
 * 
 * Course 2/3: 2 Hours
 * 1) Get balance of custom ERC-20 token
 * 2) Get transaction history
 * 3) Get transaction detail 
 * 
 * Author: 陳俊欽 Nando 
 * Create: 2021/03/30 
 * Update: 2021/04/03
 * Version: 1.00
 */

//=============================================================================
// 參數: 開始 / Parameters: Begin
//============================================================================= 
// 錢包地址 / Wallet Address 
var myAddress = '';
// 私鑰，正式環境請勿暴露此資訊!! / Private key, DO NOT SHOW IN LIVE ENV.!!                                                         
var myPK = '';
// Etherscan API 密鑰，正式環境請勿暴露此資訊!! / EtherScan API KEY, DO NOT SHOW IN LIVE ENV.!!                                                                
var ESAPIKey = '';                                                                  
var env = 'ropsten';                                                                // 正式 Live: homestead / 測試 Test: ropsten
var defaultGASLimit = 210000;                                                       // 預設GAS 上限 / Default GAS Limit
var defaultGASPrice = 80;                                                           // 預設GAS 價格 / Default GAS Price 
var provider = ethers.getDefaultProvider(env);                                      // 以太坊服務提供者 / Ethereum Service Provider
var views = '#viewWallet,#viewTransfer,#viewList,#viewDetail,#viewAbout,#viewInit'; // 畫面清單 / List of UIs
var USDTContract = new ethers.Contract(USDT.address, USDT.abi, provider);           // 連接客制USDT 合約 / Connect to Custom-USDT Contracr
var timezone = 'Asia/Taipei';                                                       // 時區 / Time Zone
var transactions = [];                                                              // 交易列表暫存 / Temp. Object for Storing Transaction Lists
var today = moment(new Date()).set({hour: 0, minute: 0, second: 0})._d;             // 今天 / Today 
var URLEtherscan = (env == 'homestead') ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/';  // Etherscan 網址 / URL of EtherScan
//=============================================================================
// 參數: 結束 / Parameters: End
//============================================================================= 

//=============================================================================
// 程式初始: 開始 / Init: Begin
//============================================================================= 
$(document).ready(function(){ 
    // 檢查是否有設定錢包地址與私鑰 
    // Check if address and PK are set 
    if (myAddress !== ''
    && myPK !== '') {
        // 已設定切換到錢包畫面
        // Set, go to wallet UI 
        gotoWallet();
        // 設定按鈕動作
        // Set button actions 
        // 錢包
        // wallet 
        $('#btnWallet, #btnCancel, #btnError').on('click', function(){
            gotoWallet();
        });
        // 交易歷史紀錄
        // Transaction history 
        $('#btnTransHistory, #btnBack').on('click', function(){
            gotoList();
        });
        // 交易畫面
        // Transfer 
        $('#btnTransfer').on('click', function(){
            gotoTransaction();
        });
        // 確認交易 
        // Confirm transaction 
        $('#btnConfirm').on('click', function(){
            confirmTransaction();
        });
    } else {
        // 未設定則轉往設定畫面
        // Not set, go to setting UI 
        gotoSetting();
    }
    // 環境提示
    // Env. info
    if (env === 'homestead') {
        $('#viewTest').remove();
    }
    // 設定交易鎖定控制
    // Set transaction lock control 
    $('#viewTransferLock').modal({
        backdrop: 'static',
        keyboard: false
    })
});
//=============================================================================
// 程式初始: 結束 / Init: End
//============================================================================= 

//=============================================================================
// 畫面流程: 開始 / UI Flow: Begin
//============================================================================= 
/**
 * 切換到錢包畫面
 * Change view to wallet
 */
function gotoWallet(){
    // 調用切換畫面功能
    // Invoke swap view function
    swapView('#viewWallet', function(){
        // 設定我的地址 
        // Set my address 
        $('#lbAddressMini').html(formatAddress(myAddress));
        // 清空餘額
        // Empty balance
        $('#lbBalance').html('---');
        // 調用取得餘額功能
        // Invoke get balance function 
        ETHGetBalance(myAddress, function(_balance) {
            // 設定餘額
            // Set balance
            $('#lbBalance').html(formatThousand(_balance) + ' USDT');
        });
    });
}

/**
 * 檢查並確認交易
 * Check and confirm transaction
 */
function confirmTransaction() {
    // 取得並設定餘額
    // Get/set balance 
    var balance = parseFloat($('#tbBalance').val());
    // 取得並設定數量
    // Get/set amount
    var amount = parseFloat($('#tbAmount').val()); 
    // 取得並設定地址
    // Get/set address
    var address = $('#tbAddress').val();
    // 設定預設驗證結果
    // Set default validation result
    var valid = true;
    // 設定錯誤訊息
    // Set error messages
    var errorMsg = '';
    // 檢查表單
    // check form
    // 數量: 必須小於等於餘額並大於1
    // Amount: Must LTE balance and GTE 1
    if (amount > balance || amount < 1) {
        // 設定錯誤訊息
        // Set error message
        errorMsg += '轉出數量必須大於等於1 並且小於等於現有餘額\r';
        // 設定驗證結果
        // Set validation result 
        valid = false;
    }
    // 地址: 不是空值並且是正確以太坊地址
    // Address: Must not empty and valid Ethereum address
    if (address === '' || !ETHCheckAddress(address)) {
        // 設定錯誤訊息
        // Set error message
        errorMsg += '接收地址不是有效以太坊位置';
        // 設定驗證結果
        // Set validation result 
        valid = false;
    } 
    // 如果驗證結果正確則確認交易 
    // Confirm transaction if valid 
    if (valid) {
        // 調用確認視窗
        // Call confirmation dialog box
        var confirmTrans = confirm('請確認進行交易:\r轉出 ' + amount + ' USDT \r給 ' + address + ' ?');
        // 檢查是否確認交易
        // Check if confirm transaction 
        if (confirmTrans) {
            // 確認，顯示鎖定資訊
            // Confirmed, show lock info 
            $('#viewTransferLock').modal('show'); 
            $('#transferTool').removeClass("d-flex").addClass("d-none");
            // To-dos: 進行交易，調用發送通正功能
            // To-dos: Commit transaction, invoke send token function 
        } else {
            // 取消交易，結束功能
            // End function if cancel transaction  
            return false;
        }
    } else {
        // 驗證結果失敗，提示錯誤
        // Show error message if invalid
        alert('交易資料錯誤，請檢查:\r' + errorMsg);
        // 結束功能
        // End function 
        return false;
    }
}

/**
 * 切換到交易畫面
 * Change view to transfer 
 */
function gotoTransaction() { 
    // 調用切換畫面功能
    // Invoke swap view function
    swapView('#viewTransfer', function(){  
        // 初始畫面資訊
        // Init UI info 
        $('#tbBalance').val('0'); 
        $('#tbAmount').val('0'); 
        $('#tbAddress').val('');  
        $('#transferTool').removeClass("d-none").addClass("d-flex");
        $('#transferInfo, #transferError').hide();
        // 調用取得餘額功能 
        // Invoke get balance function 
        ETHGetBalance(myAddress, function(_balance) {
            // 設定餘額至欄位與交易最大值屬性
            // Set balance to input value and attribute: max
            $('#tbBalance').val(_balance);
            $('#tbAmount').attr('max', _balance);
        });
    });
}

/** 
 * 切換到交易明細畫面
 * Change view to transaction detail 
 * @param {string} _hash - 交易HASH
 * @param {int} _index - 交易索引
 */
function gotoDetail(_hash, _index) {
    // 調用切換畫面功能
    // Invoke swap view function
    swapView('#viewDetail', function(){
        // 初始畫面資訊
        // Init UI info 
        $('#viewDetail span[id^="lb"]').html('---');
        // 設定EtherScan 連結
        // Set Etherscan link 
        $('#lbHash').html(_hash).attr('href', URLEtherscan + _hash); 
        // 取得交易明細收據
        // Get transaction detail receipt
        provider.getTransactionReceipt(_hash).then(function(_trans){
            // 由暫存交易列表取得該筆交易資料
            // Get row data via Temp.
            var v = transactions[_index];
            // 設定畫面資訊
            // Set view 
            $('#lbBlockNumber').html(_trans.blockNumber);
            $('#lbConfirm').html(_trans.confirmations);
            $('#lbStatus').html(formatStatus(_trans.status)); 
            $('#lbFrom').html(_trans.from);
            $('#lbTo').html(_trans.to);
            $('#lbTime').html(formatTime(v.timestamp, true));
            $('#lbAmount').html('<span class="' + formatIO(v.to) + '">' + (v.data === '0x' ? formatThousand(formatToken(v.value, 'ETH')) + ' ETH' : formatThousand(formatToken(v.data, 'USDT')) + ' USDT') + '</span>'); 
            $('#lbGASPrice').html(formatToken(v.gasPrice, 'ETH') + ' ETH (' + formatToken(v.gasPrice, 'GWEI') + ' Gwei)');
            $('#lbGASLimit').html(formatThousand(formatToken(v.gasLimit, 'WEI')) + ' wei');
            $('#lbGASUsed').html(formatThousand(formatToken(_trans.gasUsed, 'WEI')) + ' wei (' + ((formatToken(_trans.gasUsed, 'WEI') / formatToken(v.gasLimit, 'WEI')) * 100) + '%)');
            $('#lbTransactionFee').html(formatToken(_trans.gasUsed, 'GWEI') * formatToken(v.gasPrice, 'GWEI') + ' ETH');
        });
    });
}
 
/**
 * 前往交易歷史紀錄
 * Go to transaction history list view 
 */
function gotoList(){
    // 調用切換畫面功能
    // Invoke swap view function
    swapView('#viewList', function(){ 
        // 清空表格, 暫存參數
        // Empty table, Temp. parameter 
        $('#tblList').html('<td colspan="6">---</td>');
        transactions = [];
        // 取得以太鏈交易資料
        // Get data from Ethereum 
        ETHList(myAddress, function(_res) { 
            // 判斷是否有資料
            // Check data length 
            if (_res.length >= 1) {
                // 將回傳陣列資料存入暫存參數
                // Store retuen data to Temp. parameter
                transactions = _res;
                // 遞迴取得回傳陣列資料並將其設定入表格暫存參數
                // Loop and put row data into array
                var list = [];
                $.each(_res, function(i, v) {
                    list.push('<tr><td><a href="#" class="btn btn-primary btn-sm btnDetail" data-hash="' + v.hash + '" data-index="' + i + '">檢視</a></td>');
                    list.push('<td title="' + v.from + '">' + formatAddress(v.from) + '</td>');
                    list.push('<td title="' + v.to + '">' + formatAddress(v.to) + '</td>');
                    list.push('<td>' + formatTime(v.timestamp, false) + '</td>');
                    list.push('<td>' + (v.data === '0x' ? 'ETH' : 'USDT') + '</td>');
                    list.push('<td class="text-right ' + formatIO(v.to) + '">' + formatThousand(v.data === '0x' ? formatToken(v.value, 'ETH') : formatToken(v.data, 'USDT')) + '</td></tr>');
                });
                // 將表格暫存參數中資料
                // Append rows into table
                $('#tblList').html(list.join('')).ready(function(){
                    // 設定按鈕檢視明細功能
                    // Set detail button function 
                    $(".btnDetail").on('click', function(){
                        // 點擊時前往交易明細畫面
                        // Go to transaction detail on click 
                        gotoDetail($(this).attr('data-hash'), $(this).attr('data-index'));
                    });
                    // 清空陣列
                    // Clear array 
                    list = [];
                });
            } else {
                // 查無資料
                // No data found 
                $('#tblList').html('<td colspan="6">查無資料</td>');
            } 
        });
    });
} 

/**
 * 前往設定畫面
 * Go to setting view 
 */
function gotoSetting(){
    // 調用切換畫面功能
    // Invoke swap view function
    swapView('#viewSetting', function(){ 
        // 調用產生新錢包功能
        // Invoke new wallet function
        ETHNewWallet();
    });
}
//=============================================================================
// 畫面流程: 結束 / UI Flow: End
//============================================================================= 

//=============================================================================
// 以太坊功能: 開始 / Ethereum operations: Begin
//=============================================================================  
/**
 * 列出歷史交易
 * List transaction history 
 * @param {string} _address - 地址 / Address 
 * @param {function} _callback - 回調功能 / Callback function 
 */
function ETHList(_address, _callback) { 
    // 連線到EtherScan API 
    // Connect to EtherScan API 
    var ESAPI = new ethers.providers.EtherscanProvider(env, ESAPIKey); 
    // 發出請求 
    // Send request 
    try {  
        ESAPI.getHistory(_address).then(function(_res) { 
            // 執行回覆功能 
            // Callback 
            if (_callback !== null) {
                var cb = eval(_callback); 
                cb(_res);
            } 
        }, function(e) {
            // 傾倒出錯誤物件
            // Dump error 
            console.log(e); 
        });  
    } catch (e) { 
        // 傾倒出錯誤物件
        // Dump error 
        console.log(e);
    }  
}

/**
 * 取得錢包餘額
 * @param {string} _address - 錢包地址 / Wallet address 
 * @param {function} _callback - 回調功能 / Callback function 
 */
function ETHGetBalance(_address, _callback) {  
    // 參數
    // Parameter
    var balance = 0.000000;
    // 連線通證合約取得錢包餘額
    // Connect to contract and get wallet balance 
    try {
        USDTContract.balanceOf(_address).then(function(_balance){ 
            // 儲存回傳值
            // Store returned value
            balance = ethers.utils.formatUnits(_balance, USDT.decimal);
            // 執行回覆功能 
            // Callback 
            if (_callback !== null) {
                var cb = eval(_callback); 
                cb(balance);
            } 
        });
    } catch (e) {
        // 傾倒出錯誤物件
        // console.log(e);
    } 
}

/**
 * 檢查以太地址
 * Check Ethereum address 
 * @param {string} _address - 以太地址 / Ethereum address 
 * @returns {boolean} 
 */
function ETHCheckAddress(_address){
    // 參數
    // Parameter
    var ok = false;
    // 嘗試檢查
    // Try to check 
    try {
        // 設定結果
        // Set result 
        ok = ethers.utils.getAddress(_address) === _address;
    } catch (e) { 
        // 傾倒出錯誤物件
        // console.log(e);
    }
    // 回傳
    // Return 
    return ok;
}

/**
 * 產生新錢包, 並顯示在畫面欄位上
 * Generate new wallet and set info to UI 
 */
function ETHNewWallet(){
    // 產生隨機錢包，存放在參數中
    // Generate random wallet and store it into parameter 
    var newWallet = ethers.Wallet.createRandom();
    // 顯示錢包資訊
    // Show wallet info 
    $('#lbAddressInit').html(newWallet.address);
    $('#lbPKInit').html(newWallet.privateKey);
    $('#lbMnemonic').html(newWallet.mnemonic);
    // 傾倒出newWallet 物件 
    // Dump newWallet object 
    // console.log(newWallet);
}
//=============================================================================
// 以太坊功能: 結束 / Ethereum operations: End
//=============================================================================  

//=============================================================================
// 客制功能: 開始 / Custom Functions: Begin
//=============================================================================  
/**
 * 格式狀態代碼
 * Format status code 
 * @param {int} _status - 狀態代碼 / Status code 
 * @returns {string} 回傳格式化狀態資訊 / Returns formatted status info 
 */
function formatStatus(_status) {
    // 狀態 = 1: 成功, 其他: 失敗
    // status = 1: Success, others: Failed
    return _status == 1 ? '<span class="text-success">成功</span>' : '<span class="text-danger">失敗</span>';
}

/**
 * 格式化通證數量: hex 轉為數字
 * Format token amount: hex to number 
 * @param {*} _amount - 數量 / Amount
 * @param {string} _symbol - 通證簡稱 / Symbol of the token
 * @returns {number} 回傳對應數字 / Returns converted number
 */
function formatToken(_amount, _symbol) {
    // 參數
    // Parameter
    var amount = 0;
    // 切換通證簡稱 
    // Switch symbol cases 
    switch(_symbol) { 
        case 'ETH':
            amount = ethers.utils.formatUnits(_amount, 18);
            break;
        case 'GWEI':
            amount = ethers.utils.formatUnits(_amount, "gwei");
            break;
        case 'WEI':
            amount = ethers.utils.formatUnits(_amount, "wei");
            break;
        case 'USDT':
            amount = ethers.utils.formatUnits('0x' + _amount.substr(_amount.length - 10), USDT.decimal);
            break;
        default:
            amount = ethers.utils.formatUnits(_amount.value, 18);
    }
    // 回傳
    // Return 
    return amount;
}

/**
 * 格式化UNIX 時間戳記為UTC
 * Format UNIX timestamp to UTC 
 * @param {string} _timestamp - UNIX 時間戳記 / UNIX timestamp
 * @param {boolean} _full - 是否回傳完整格式 / Returns full info to not 
 * @returns {string} 回傳UTC 時間 / Returns time in UTC 
 */
function formatTime(_timestamp, _full) {
    // 設定時區
    // Set time zone 
    var timestamp = moment.unix(_timestamp).tz(timezone);
    // 回傳完整資訊或今日僅時間、過往僅日期
    // Return full info or time only if GTE today others date only 
    return _full ? timestamp.format('YYYY-MM-DD HH:mm:ss Z') : (timestamp < today) ? timestamp.format('YYYY-MM-DD') : timestamp.format('HH:mm'); 
}

/**
 * 標示收款(綠色)或付款(紅色)
 * Mark credit in green and pay in red 
 * @param {string} _address - 地址 / Address
 * @returns {string} 回傳CSS 樣式 / Returns CSS Style
 */
function formatIO(_address) {
    return _address == myAddress ? 'text-success' : 'text-danger';
}

/**
 * 格式化地址 
 * Format address 
 * @param {string} _address - 地址 / Address
 * @returns {string} 回傳縮短的地址 / Returns shortened address
 */
function formatAddress(_address) {
    // 參數
    // Parameter
    var res = ''; 
    // 隱藏中段
    // Hide middle 
    res = _address.substring(0, 6) + ' ... ' + _address.substring(_address.length - 4);
    // 檢查並標記是不是自己的地址
    // Check and mark owner's address 
    // res += (_address == myAddress ? ' <span class="text-success"><- 我</span>' : '');
    // 回傳
    // Return 
    return res;
}

/**
 * 千進位格式
 * Thousand format
 * @param {*} _amount - 數量 / Amount 
 * @returns {string} 回傳帶逗點字串(3位數以上) / Returens comma-separated string (3+ digits)
 */
function formatThousand(_amount) {
    // 回傳
    // Return 
    return _amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 切換畫面
 * Swap View 
 * @param {string} _view - 目標畫面ID / Target view ID
 * @param {function} _callback - 回調功能 / Callback function 
 */
function swapView(_view, _callback) { 
    // 隱藏畫面清單中所有畫面
    // Hide all views in the view list 
    $(views).hide();
    // 移除目標畫面d-none 樣式
    // Remove style: d-none form target view
    $(_view).removeClass('d-none').fadeIn();
    // 隱藏導覽列選單
    // Hide navbar 
    $('#navbarCollapse').collapse('hide');
    // 執行回覆功能
    // Callback
    if (_callback !== null) {
        var cb = eval(_callback);
        cb();
    }
}
//=============================================================================
// 客制功能: 結束 / Custom Functions: End
//=============================================================================  