/**
 * 以太坊錢包Javascript 前/後端
 * Javascript Frontend/backend for Ethereum Wallet
 * 
 * Author: 陳俊欽 Nando Chen 
 * Create: 2021/03/30 
 * Update: 2021/04/02
 */

// 參數: 開始   -----------------------------v
var myAddress = '0x24B7ABB3f771CCf88024Da62120795ef3bd1B87A';                       // 錢包地址
var myPK = '0x05c1ba034282dcfb3350807b1dc41fe4edd073583b00138e17b7633b7bbdcbb9';    // 私鑰，正式環境請勿暴露此資訊!!
var ESAPIKey = 'E5CSKCC5SWWP3DAZDXK26ZNKMGSDE3HZX6';                                // Etherscan API 密鑰，正式環境請勿暴露此資訊!!
var env = 'ropsten';                                                                // Live: homestead / Test: ropsten
var defaultGASLimit = 210000;                                                       // 預設GAS 上限
var defaultGASPrice = 80;                                                           // 預設GAS 價格
var provider = ethers.getDefaultProvider(env);                                      // 連接以太鏈
var views = '#viewWallet,#viewTransfer,#viewList,#viewDetail,#viewAbout,#viewInit'; // 畫面清單
var USDTContract = new ethers.Contract(USDT.address, USDT.abi, provider);           // 連接USDT 合約
var timezone = 'Asia/Taipei';                                                       // 時區，可再加入會員自訂資訊
var transactions = [];                                                              // 交易列表暫存
var today = moment(new Date()).set({hour: 0, minute: 0, second: 0})._d;             // 今天
var URLEtherscan = (env == 'homestead') ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/';  // Etherscan 網址 
// 參數: 結束    -----------------------------^

// 主流程: 開始  -----------------------------v
$(document).ready(function(){ 
    // 檢查是否有設定錢包地址與私鑰 
    if (myAddress !== ''
    && myPK !== '') {
        // 已設定切換到錢包畫面
        gotoWallet();
    } else {
        // 未設定則轉往初始設定畫面
        gotoInit();
    }
    // 環境提示
    if (env === 'homestead') {
        $('#viewTest').remove();
    }
    // 設定交易鎖定控制
    $('#viewTransferLock').modal({
        backdrop: 'static',
        keyboard: false
    })
    // 設定按鈕動作
    // 錢包
    $('#btnWallet, #btnCancel, #btnError').on('click', function(){
        gotoWallet();
    });
    // 交易歷史紀錄
    $('#btnTransHistory, #btnBack').on('click', function(){
        gotoList();
    });
    // 交易畫面
    $('#btnTransfer').on('click', function(){
        gotoTransaction();
    });
    // 確認交易 
    $('#btnConfirm').on('click', function(){
        confirmTransaction();
    });
});
// 主流程: 結束    -----------------------------^

// 畫面流程: 開始  -----------------------------v
/**
 * @錢包
 */
function gotoWallet(){
    swapView('#viewWallet', function(){ 
        $('#lbAddressMini').html(formatAddress(myAddress));
        $('#lbBalance').html('---');
        ETHCheckBalance(myAddress, function(_balance) {
            $('#lbBalance').html(formatThousand(_balance) + ' USDT');
        });
    });
}

/**
 * @檢查並確認交易
 */
function confirmTransaction() {
    var balance = parseFloat($('#tbBalance').val());
    var amount = parseFloat($('#tbAmount').val()); 
    var address = $('#tbAddress').val();
    var valid = true;
    var errorMsg = '';
    // check form 
    // amount 
    if (amount > balance || amount < 1) {
        errorMsg += '轉出數量必須大於等於1 並且小於等於現有餘額\r';
        valid = false;
    }
    // address 
    if (address === '' || !ETHCheckAddress(address)) {
        errorMsg += '接收地址不是有效以太坊位置';
        valid = false;
    } 
    // confirm transaction 
    if (valid) {
        var confirmTrans = confirm('請確認進行交易:\r轉出 ' + amount + ' USDT \r給 ' + address + ' ?');
        if (confirmTrans) {
            // show lock info 
            $('#viewTransferLock').modal('show'); 
            $('#transferTool').removeClass("d-flex").addClass("d-none");
            // commit transaction 
            sendToken(address, amount, function(result){
                $('#viewTransferLock').modal('hide'); 
                $('#transferInfo').html('<span class="text-success">完成</span>，交易HASH: <a href="' + URLEtherscan + result.hash + '" target="_blank">' + formatAddress(result.hash) + '</a>').show();
            }, function(error){ 
                $('#viewTransferLock').modal('hide');  
                $('#transferInfo').html('<span class="text-danger">' + error + '</span>').show();
                $('#transferError').show();
            });
        } else {
            return false;
        }
    } else {
        alert('交易資料錯誤，請檢查:\r' + errorMsg);
        return false;
    }
}

/**
 * @交易畫面
 */
function gotoTransaction() { 
    swapView('#viewTransfer', function(){  
        $('#tbBalance').val('0'); 
        $('#tbAmount').val('0'); 
        $('#tbAddress').val('');  
        $('#transferTool').removeClass("d-none").addClass("d-flex");
        $('#transferInfo, #transferError').hide();
        ETHCheckBalance(myAddress, function(_balance) {
            $('#tbBalance').val(_balance);
            $('#tbAmount').attr('max', _balance);
        });
    });
}

/**
 * @檢視交易明細
 * @交易HASH {string} _hash
 * @交易索引 {int} _index
 */
function gotoDetail(_hash, _index) {
    swapView('#viewDetail', function(){
        // init data 
        $('#viewDetail span[id^="lb"]').html('---');
        // set Etherscan link 
        $('#lbHash').html(_hash);
        $('#lbHash').attr('href', URLEtherscan + _hash);
        //
        provider.getTransactionReceipt(_hash).then(function(_trans){
            // get row data
            var v = transactions[_index];
            // set view 
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
 * @交易歷史紀錄
 */
function gotoList(){
    swapView('#viewList', function(){ 
        // 清空表格
        $('#tblList').html('<td colspan="6">---</td>');
        transactions = [];
        // 取得以太鏈交易資料
        ETHList(myAddress, function(_res) { 
            // 判斷是否有資料
            if (_res.length >= 1) {
                transactions = _res;
                // loop and put row data into array
                var list = [];
                $.each(_res, function(i, v) {
                    list.push('<tr><td><a href="#" class="btn btn-primary btn-sm btnDetail" data-hash="' + v.hash + '" data-index="' + i + '">檢視</a></td>');
                    list.push('<td title="' + v.from + '">' + formatAddress(v.from) + '</td>');
                    list.push('<td title="' + v.to + '">' + formatAddress(v.to) + '</td>');
                    list.push('<td>' + formatTime(v.timestamp, false) + '</td>');
                    list.push('<td>' + (v.data === '0x' ? 'ETH' : 'USDT') + '</td>');
                    list.push('<td class="text-right ' + formatIO(v.to) + '">' + formatThousand(v.data === '0x' ? formatToken(v.value, 'ETH') : formatToken(v.data, 'USDT')) + '</td></tr>');
                });
                // append rows into table
                $('#tblList').html(list.join('')).ready(function(){
                    // set event handler 
                    $(".btnDetail").on('click', function(){
                        gotoDetail($(this).attr('data-hash'), $(this).attr('data-index'));
                    });
                    // clear array 
                    list = [];
                });
            } else {
                // no data found 
                $('#tblList').html('<td colspan="6">查無資料</td>');
            } 
        });
    });
} 

/**
 * @初始畫面
 */
function gotoInit(){
    swapView('#viewInit', function(){ 
        ETHNewWallet();
    });
}
// 畫面流程: 結束   -----------------------------^

// 以太坊功能: 開始  -----------------------------v 
/**
 * @發送USDT 
 * @param {*} _address 
 * @param {*} _amount 
 * @param {*} _callback 
 * @param {*} _error 
 */
function sendToken(_address, _amount, _callback, _error) {
    var wallet = new ethers.Wallet(myPK, provider); 
    var contract = new ethers.Contract(USDT.address, USDT.abi, wallet);  
    // sign
    var contractSigner = contract.connect(wallet.connect(provider)); 
    // transfer 
    contractSigner.transfer(
        _address /* 接收方地址 */
        , ethers.utils.parseUnits(_amount.toString(), USDT.decimal).toString()          /* 數量，依序通證小數點轉換 */
        , { 
            gasPrice: ethers.utils.parseUnits((defaultGASPrice).toString(), 'gwei'),    /* GAS 價格 */
            gasLimit: defaultGASLimit + (Math.floor(Math.random() * 100))               /* GAS 上限 */
        }
    ).then(function(tx) {  
        // 執行回覆功能 
        if (_callback !== null) {
            var cb = eval(_callback); 
            cb(tx);
        } 
    }).catch(function(err) {  
        // 執行回覆功能 
        if (_error !== null) {
            var cb = eval(_error); 
            cb(err);
        } 
    });
}

/**
 * @列出歷史交易
 * @地址 {string} _address 
 * @回調功能 {function} _callback 
 */
function ETHList(_address, _callback) { 
    // 連線到Etherscan API 
    var ESAPI = new ethers.providers.EtherscanProvider(env, ESAPIKey); 
    // 發出請求 
    try {  
        ESAPI.getHistory(_address).then(function(_res) { 
            // 執行回覆功能 
            if (_callback !== null) {
                var cb = eval(_callback); 
                cb(_res);
            } 
        }, function(e) {
            // 傾倒出錯誤物件
            console.log(e); 
        });  
    } catch (e) { 
        // 傾倒出錯誤物件
        console.log(e);
    }  
}

/**
 * @檢查錢包餘額
 * @錢包地址 {string} _address  
 */
function ETHCheckBalance(_address, _callback) {  
    var balance = 0.000000;
    // 連線錢包檢查通證餘額
    try {
        USDTContract.balanceOf(_address).then(function(_balance){ 
            balance = ethers.utils.formatUnits(_balance, USDT.decimal);
            // 執行回覆功能 
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
 * @檢查以太地址是否正確
 * @以太地址 {string} _address 
 * @returns {boolean}
 */
function ETHCheckAddress(_address){
    var ok = false;
    // 嘗試檢查
    try {
        ok = ethers.utils.getAddress(_address) === _address;
    } catch (e) { 
        // 傾倒出錯誤物件
        // console.log(e);
    }
    return ok;
}

/**
 * 產生新錢包, 並設定在畫面欄位上
 */
function ETHNewWallet(){
    var newWallet = ethers.Wallet.createRandom();
    $('#lbAddressInit').html(newWallet.address);
    $('#lbPKInit').html(newWallet.privateKey);
    // 傾倒出newWallet 物件
    // console.log(newWallet);
}

// 以太坊功能: 結束 -----------------------------^

// 客制功能: 開始   -----------------------------v
/**
 * @轉換狀態代碼
 * @狀態代碼 {int} _status 
 * @returns 
 */
function formatStatus(_status) {
    return _status == 1 ? '<span class="text-success">成功</span>' : '<span class="text-danger">失敗</span>';
}

/**
 * @轉換通證數量
 * @param {*} _amount 
 * @param {string} _symbol 
 * @returns 
 */
function formatToken(_amount, _symbol) {
    var amount = 0;
    // switch 
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
    //
    return amount;
}

/**
 * 轉換UNIX 時間戳記為UTC
 * @UNIX 時間戳記 {string} _timestamp 
 * @是否回傳完整格式 {boolean} _full
 * @returns 
 */
function formatTime(_timestamp, _full) {
    var timestamp = moment.unix(_timestamp).tz(timezone);
    return _full ? timestamp.format('YYYY-MM-DD HH:mm:ss Z') : (timestamp < today) ? timestamp.format('YYYY-MM-DD') : timestamp.format('HH:mm'); 
}

/**
 * 顯示收款(綠色)或付款(紅色)
 * @param {string} _address 
 * @returns 
 */
function formatIO(_address) {
    return _address == myAddress ? 'text-success' : 'text-danger';
}

/**
 * 格式化地址
 * @param {string} _address 
 * @returns 
 */
function formatAddress(_address) {
    var res = ''; 
    // 隱藏中段
    res = _address.substring(0, 6) + ' ... ' + _address.substring(_address.length - 4);
    // 檢查並標記是不是自己的地址
    // res += (_address == myAddress ? ' <span class="text-success"><- 我</span>' : '');
    // 回傳
    return res;
}

/**
 * @千進位格式
 * @param {*} _amount 
 * @returns 
 */
function formatThousand(_amount) {
    return _amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 切換畫面
 * @param {string} _view 
 * @param {function} _callback 
 */
function swapView(_view, _callback) { 
    $(views).hide();
    $(_view).removeClass('d-none').fadeIn();
    // hide navbar 
    $('#navbarCollapse').collapse('hide');
    // 執行回覆功能
    if (_callback !== null) {
        var cb = eval(_callback);
        cb();
    }
}
// 客制功能: 結束  -----------------------------^