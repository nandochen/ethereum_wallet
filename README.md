# 以太坊錢包 Ethereum Wallet
## 關於 About
一個使用最基本HTML, Javascript, ethers.js 製作之以太坊錢包與以太坊ERC-20 通證智能合約，協助您以最快速、簡單的方式進入以太坊應用程式領域。

A wallet application and a ERC-20 smart contract built on most basic HTML, Javascript and ethers.js, helping people to get into Etereume development fast and easy.

## 目標 Goal
能夠瞭解並實作以下：
1) 建立、發布ERC-20 智能合約並擁有自己的通證。
2) 建立一個數位資產錢包。

To understand and have hands-on ablity to: 
1) create and submit an ERC-20 smart contract to have your won token. 
2) create a crypto wallet application 

## 安裝 Installation
下載或複製專案，解壓縮。

Download or clone the project, unzip. 

## 使用方式 Usage
開啟index.html。

Open index.html. 

## 正式/測試鏈 Live/Test Blockchain 
在lib/js/index.js 中調整參數env，homestead 為正式以太坊鏈；ropsten 為以太坊測試鏈。

Change the env parameter in lib/js/index.js, homestead for live Ethereume blockchain, ropsten for test Ethereume blockchain. 

```bash
var env = 'ropsten'; // homestead - 正式 Live; ropsten - 測試 test 
```
