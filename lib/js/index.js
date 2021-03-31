/**
 * 以太坊錢包Javascript 前/後端
 * Javascript Frontend/backend for Ethereum Wallet
 * 
 * Author: 陳俊欽 Nando Chen 
 * Create: 2021/03/30 
 * Update: 2021/03/31
 */

// 參數: 開始 
var myAddress = '0x24B7ABB3f771CCf88024Da62120795ef3bd1B87A';                       // 錢包地址
var myPK = '0x05c1ba034282dcfb3350807b1dc41fe4edd073583b00138e17b7633b7bbdcbb9';    // 私鑰，正式環境請勿暴露此資訊!!
var ESAPIKey = 'E5CSKCC5SWWP3DAZDXK26ZNKMGSDE3HZX6';                                // Etherscan API 密鑰，正式環境請勿暴露此資訊!!
var env = 'ropsten';                                                                // Live: homestead / Test: ropsten
var provider = ethers.getDefaultProvider(env);                            // 連接以太鏈
var views = '#viewWallet,#viewTransfer,#viewList,#viewDetail,#viewAbout,#viewInit'; // 畫面清單
var USDT = {"address":"0x8a630F0f90291dcEF4CdF5C41dA6AEA3b384E894", "decimal":6, "abi": [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"acceptOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeSub","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeDiv","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"tokens","type":"uint256"},{"name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeMul","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"newOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"tokenAddress","type":"address"},{"name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenOwner","type":"address"},{"name":"spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"a","type":"uint256"},{"name":"b","type":"uint256"}],"name":"safeAdd","outputs":[{"name":"c","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"tokenOwner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Approval","type":"event"}]};
var USDTContract = new ethers.Contract(USDT.address, USDT.abi, provider);           // 連接USDT 合約
// 參數: 結束

// 主流程: 開始
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
    // 正式環境
    if (env === 'homestead') {
        $('#viewTest').remove();
    }
    // 按鈕流程
    // 錢包
    $('#btnWallet').on('click', function(){
        gotoWallet();
    });
    // 交易歷史紀錄
    $('#btnTransHistory').on('click', function(){
        gotoList();
    });
});
// 主流程: 結束

// 畫面流程: 開始
// 錢包
function gotoWallet(){
    swapView('#viewWallet', function(){ 
        $('#lbBalance').html('---');
        ETHCheckBalance(myAddress, function(_balance) {
            $('#lbBalance').html(_balance + ' USDT');
        });
    });
}

// 交易歷史紀錄
function gotoList(){
    swapView('#viewList', function(){ 
        $('#tblList').html('<td colspan="5">---</td>');
        ETHList(myAddress, function(_res) { 
            if (_res.length >= 1) {
                var list = [];
                $.each(_res, function(i, v) {
                    console.log(v);
                    list.push('<tr><td><a href="#" data-hash="' + v.hash + '">檢視</a></td>');
                    list.push('<td>' + v.from + '</td>');
                    list.push('<td>' + (new Date(v.timestamp * 1)).toUTCString() + '</td>');
                    list.push('<td>' + (v.data === '0x' ? 'ETH' : 'USDT') + '</td>');
                    list.push('<td>' + (v.data === '0x' ? (v.value) / Math.pow(10, 18) : (v.value * 1) / Math.pow(10, USDT.decimal)) + '</td></tr>');
                });
                $('#tblList').html(list.join(''));
                list = [];
            } else {
                $('#tblList').html('<td colspan="5">查無資料</td>');
            } 
        });
    });
}

// 初始畫面
function gotoInit(){
    swapView('#viewInit', function(){ 
        ETHNewWallet();
    });
}
// 畫面流程: 結束

// 以太坊功能: 開始 
/**
 * 列出歷史交易
 * @param {string} _address 
 * @param {function} _callback 
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
            console.log(e); 
        });  
    } catch (e) { 
        // 傾倒出錯誤物件
        console.log(e);
    }  
}

/**
 * 檢查錢包餘額
 * @param {string} _address  
 */
function ETHCheckBalance(_address, _callback) {  
    var balance = 0.000000;
    // 連線錢包檢查通證餘額
    try {
        USDTContract.balanceOf(_address).then(function(_balance){
            balance = _balance / Math.pow(10, USDT.decimal);
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
 * 檢查以太地址是否正確
 * @param {string} _address 
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

// 以太坊功能: 結束

// 客制功能: 開始 
/**
 * 切換畫面
 * @param {string} _view 
 * @param {function} _callback 
 */
function swapView(_view, _callback) { 
    $(views).hide();
    $(_view).removeClass('d-none').fadeIn();
    // 執行回覆功能
    if (_callback !== null) {
        var cb = eval(_callback);
        cb();
    }
}
// 客制功能: 結束