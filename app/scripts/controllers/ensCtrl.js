"use strict";

var ensCtrl = function ($scope, $sce, walletService, $timeout, $rootScope) {
    let nu = localStorage.getItem(window.cookieName);
    let data = nu ? JSON.parse(nu) : {};
    let _CHAINID = window.defaultChainId;

    $scope.suspiciousAsset = function (input) {
        if (window.verifiedList.list.some(item => item.symbol === input.toUpperCase()) ||
            window.verifiedList.list.some(item => item.name.toUpperCase() === input.toUpperCase())) {
            return true;
        } else {
            return false;
        }
    };

    $scope.closesendDropDown = function () {
        $scope.$applyAsync(function () {
            $scope.sendDropDown = false;
        })
    }
    $scope.closereceiveDropDown = function () {
        $scope.$applyAsync(function () {
            $scope.receiveDropDown = false;
        })
    }

    if (data.chainid !== "") {
        _CHAINID = data.chainid;
    }
    window.__fsnGetAllAssets();

    let cachedDropdowns = JSON.parse(localStorage.getItem('QSDropdownCache'));
    if (!cachedDropdowns) {
        let k = {
            send: 0,
            receive: 0,
        }
        localStorage.setItem('QSDropdownCache', JSON.stringify(k));
        cachedDropdowns = k;
    }

    $scope.updateDropDownCookie = function (t, id) {
        if (!id) return;
        if (t == 'send') {
            cachedDropdowns.send = id;
            localStorage.setItem('QSDropdownCache', JSON.stringify(cachedDropdowns));
        }
        if (t == 'receive') {
            cachedDropdowns.receive = id;
            localStorage.setItem('QSDropdownCache', JSON.stringify(cachedDropdowns));
        }
        cachedDropdowns = JSON.parse(localStorage.getItem('QSDropdownCache'));
        console.log(cachedDropdowns);

    }

    let sendDropDown = false;
    let sendDropDown2 = false;
    let receiveDropDown = false;
    let receiveDropDown2 = false;

    $scope.closeSendDropDown = function () {
        $scope.$applyAsync(function () {
            $scope.sendDropDown = false;
        })
    }
    $scope.closeSendDropDown2 = function () {
        $scope.$applyAsync(function () {
            $scope.sendDropDown2 = false;
        })
    }
    $scope.closeReceiveDropDown = function () {
        $scope.$applyAsync(function () {
            $scope.receiveDropDown = false;
        })
    }
    $scope.closeReceiveDropDown2 = function () {
        $scope.$applyAsync(function () {
            $scope.receiveDropDown2 = false;
        })
    }

    $scope.$watch('sendDropDown', function () {
        if ($scope.sendDropDown) {
            let a = document.getElementById('searchSendAsset');
            a.focus();
            setTimeout(function () {
                a.focus();
            }, 100);
        }
    });
    $scope.$watch('sendDropDown2', function () {
        if ($scope.sendDropDown2) {
            let a = document.getElementById('searchSendAsset2');
            a.focus();
            setTimeout(function () {
                a.focus();
            }, 100);
        }
    });
    $scope.$watch('receiveDropDown', function () {
        if ($scope.receiveDropDown) {
            let a = document.getElementById('searchReceiveAsset');
            a.focus();
            setTimeout(function () {
                a.focus();
            }, 100);
        }
    });
    $scope.$watch('receiveDropDown2', function () {
        if ($scope.receiveDropDown2) {
            let a = document.getElementById('searchReceiveAsset2');
            a.focus();
            setTimeout(function () {
                a.focus();
            }, 100);
        }
    });

    $scope.init = async function () {
        if (!$scope.wallet) {
            return;
        }
        $scope.getShortAddressNotation();
        await $scope.getTimeLockBalances().then(function () {
            $scope.getAllAssets().then(function () {
                $scope.setSendAndReceiveInit();
            });
        });
        // await $scope.allSwaps(0);
        $scope.takeGetAllBalances();
        $scope.sortSwapMarket("timePosix");
        $scope.sortOpenMakes("timePosix");
        $scope.getBalance();
        $scope.setWalletAddress();
        $scope.takeGetAllBalances();
        $scope.openMakesList();
        $scope.takeSwapList();
        $scope.getUSAN();
        $scope.$applyAsync(function () {
            $rootScope.walletAvailable = true;
        });
    };

    setInterval(function () {
        if ($scope.wallet == null) {
            return;
        }
        $scope.getAllAssets();
        $scope.getTimeLockBalances();
        $scope.takeGetAllBalances();
        $scope.getShortAddressNotation();
        $scope.getBalance();
        $scope.setWalletAddress();
        $scope.takeGetAllBalances();
        $scope.getVerifiedAssets();
        $scope.openMakesList();
        $scope.getUSAN();
    }, 7000);

    $scope.mayRun = false;

    $scope.$watch("wallet", function () {
        $scope.init();
        $scope.mayRun = true;
    });

    $scope.months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
    ];
    window.verifiedAssetsImages = {};
    $scope.todayDate = formatDate();

    $scope.getVerifiedAssets = async function () {
        window.verifiedAssetsImages = await window.__fsnGetAllVerifiedAssets();
    };

    $scope.getVerifiedAssets();

    $scope.usanAvailable = false;
    $scope.usanAddress = 0;
    $scope.getUSAN = async () => {
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let usan = await web3.fsn.getNotation(walletAddress);
        if (usan === 0) {
            if ($scope.usanAvailable) {
                $scope.$applyAsync(function () {
                    $scope.usanAvailable = false;
                });
            }
        } else {
            if (!$scope.usanAvailable) {
                $scope.$applyAsync(function () {
                    $scope.usanAvailable = true;
                    $scope.usanAddress = usan;
                });
            }
        }
    }
    $scope.setMakeUSAN = async () => {
        $scope.$eval(function () {
            $scope.selectedSendAsset = `USAN ${$scope.usanAddress}`;
            $scope.selectedSendAssetSymbol = `${$scope.usanAddress}`;
            $scope.selectedSendContract = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
            $scope.selectedSendImage = false;
            $scope.selectedSendHasImage = false;
            $scope.assetToSend = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
            $scope.selectedSendVerified = false;
            $scope.sendHasTimeLockBalance = false;
            $scope.sendDropDown = false;
            $scope.sendDropDown2 = false;
        });
        $scope.sendChanged = 1;
        $scope.$applyAsync(function () {
            $scope.makeUSAN = true;
        })
        await $scope.allSwaps(0);
    }
    $scope.setReceiveUSAN = async () => {
        $scope.$eval(function () {
            $scope.selectedReceiveAsset = `USAN`;
            $scope.selectedReceiveAssetSymbol = `USAN`;
            $scope.selectedReceiveContract = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
            $scope.selectedReceiveImage = false;
            $scope.selectedReceiveHasImage = false;
            $scope.assetToReceive = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
            $scope.selectedReceiveVerified = false;
            $scope.sendHasTimeLockBalance = false;
            $scope.receiveDropDown = false;
            $scope.receiveDropDown2 = false;
        });
        await $scope.allSwaps(0);
    }

    $scope.convertToString = function (input) {
        if (input === "") {
            return;
        }
        if (input == null) {
            return;
        }
        if (typeof input === "undefined") {
            return;
        }
        return input.toString();
    };

    function formatDate() {
        let d = new Date(),
            month = "" + (d.getUTCMonth() + 1),
            day = "" + d.getUTCDate(),
            year = d.getUTCFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    $scope.dateOptions = {
        minDate: new Date(),
        showWeeks: false,
        formatMonth: "MMM",
        yearColumns: 3
    };
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.endPage = 0;
    $scope.shownRows = 0;

    $scope.sendTimeLock = "none";
    $scope.showTimeLockSend = false;
    $scope.showTimeLockReceive = false;

    $scope.selectedTimeLockTimespan = "-";
    $scope.selectedTimeLockAmount = "Select time-lock";

    $scope.closeExistingTimeLock = function () {
        $scope.$eval(function () {
            $scope.selectedTimeLockTimespan = "-";
            $scope.selectedTimeLockAmount = "Select time-lock";
            $scope.todayData = "";
            $scope.fromEndTime = "";
            $scope.hasTimeLockSet = false;
        });
        $scope.getAssetBalance();
    };

    $scope.checkDate = function () {
        if ($scope.transactionType == "scheduled") {
            return;
        } else {
            let today = new Date();
            if ($scope.fromEndTime < today) {
                $scope.$eval(function () {
                    $scope.fromEndTime = today;
                });
            }
            if ($scope.fromEndTime < $scope.fromStartTime) {
                $scope.$eval(function () {
                    $scope.fromStartTime = today;
                });
            }
        }
    };

    // Sets the last page for pagination
    $scope.$watch("swapsList", function () {
        if (typeof $scope.swapsList === "undefined") {
            return;
        } else {
            $scope.$eval(function () {
                $scope.endPage = Math.ceil($scope.swapsList.length / $scope.pageSize);
            });
        }
    });

    $scope.nextPage = function () {
        $scope.$eval(function () {
            $scope.currentPage = $scope.currentPage + 1;
            $scope.searchSwapMarket = "";
        });
        $scope.allSwaps($scope.currentPage);
    };

    $scope.firstPage = function () {
        $scope.$eval(function () {
            $scope.currentPage = 0;
            $scope.searchSwapMarket = "";
        });
        $scope.allSwaps(0);

    };

    $scope.previousPage = function () {
        $scope.$eval(function () {
            $scope.currentPage = $scope.currentPage - 1;
            $scope.searchSwapMarket = "";
        });
        $scope.allSwaps($scope.currentPage);
    };

    let BN = web3.utils.BN;

    $scope.tx = {};
    $scope.takeDataFront = {
        fromAssetSymbol: "",
        toAssetSymbol: "",
        fromAssetBalance: "",
        swapRate: "",
        toAssetMin: "",
        fromAssetMin: "",
        maxAmount: "",
        swapId: "",
        fromAssetId: ""
    };
    $scope.sortKey = "timePosix";
    $scope.sortSwapMarket = function (keyname) {
        $scope.sortKey = keyname; //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    };
    $scope.sortOpenMakes = function (keyname) {
        $scope.sortKeyMake = keyname; //set the sortKey to the param passed
        $scope.reverseMake = !$scope.reverseMake; //if true make it false and vice versa
    };

    $scope.wholeNumberOfFills = function () {
        $scope.$eval(function () {
            $scope.makeMinumumSwap = $scope.makeMinumumSwap.toFixed(0);
        });
    };

    $scope.makeBigNumber = function (amount, decimals) {
        try {
            // Allow .0
            if (amount.substr(0, 1) == ".") {
                let a = "0" + amount;
                amount = a;
            }
            let pieces = amount.split(".");
            let d = parseInt(decimals);
            if (pieces.length === 1) {
                amount = parseInt(amount);
                if (isNaN(amount) || amount < 0) {
                    // error message
                    return;
                }
                amount = new BN(amount + "0".repeat(parseInt(decimals)));
            } else if (pieces.length > 2) {
                console.log("error");
                $scope.errorModal.open();
                // error message
                return;
            } else if (pieces[1].length >= d) {
                console.log("error");
                $scope.errorModal.open();
                return; // error
            } else {
                let dec = parseInt(pieces[1]);
                let reg = new RegExp("^\\d+$"); // numbers only
                if (isNaN(pieces[1]) || dec < 0 || !reg.test(pieces[1])) {
                    console.log("error");
                    $scope.errorModal.open();
                    return;
                    // return error
                }
                dec = pieces[1];
                let declen = d - dec.toString().length;
                amount = parseInt(pieces[0]);
                if (isNaN(amount) || amount < 0) {
                    console.log("error");
                    $scope.errorModal.open();
                    // error message
                    return;
                }
                amount = new BN(amount + dec + "0".repeat(parseInt(declen)));
            }
            return amount;
        } catch (err) {
            $scope.errorModal.open();
        }
    };

    $scope.sortByString = "Default";
    $scope.takeAmountSwap = "";
    $scope.showOpenTakes = false;
    $scope.showSwapMarket = true;
    $scope.showOpenMakes = false;
    $scope.receiveTokens = "";
    $scope.walletAddress = "";
    $scope.assetToSendConfirm = "";
    $scope.assetToReceiveConfirm = "";
    $scope.makeSendAmount = "";
    $scope.openMakeSwaps = 0;
    $scope.openTakeSwapsTotal = 0;
    $scope.makeReceiveAmount = "";
    $scope.makeTarges = "";
    $scope.web3WalletBalance = "Loading...";
    $scope.selectedSendAsset = "Select asset";
    $scope.addressNotation = "";
    $scope.makeMinumumSwap = 1;
    $scope.receiveTimeLock = "none";
    $scope.ajaxReq = ajaxReq;
    $scope.unitReadable = ajaxReq.type;
    $scope.recallAssetModal = new Modal(document.getElementById("recallAsset"));
    $scope.takeSwapModal = new Modal(document.getElementById("takeSwap"));
    $scope.makeSwapModal = new Modal(document.getElementById("makeSwap"));
    $scope.suspiciousAssetModal = new Modal(document.getElementById("suspiciousAssetModal"));
    $scope.makeSwapConfirmModal = new Modal(
        document.getElementById("makeSwapConfirm")
    );
    $scope.makeSwapConfirmEndModal = new Modal(
        document.getElementById("makeSwapEndConfirm")
    );
    $scope.recallSwapSuccess = new Modal(
        document.getElementById("recallSwapSuccess")
    );
    $scope.swapInformationModal = new Modal(
        document.getElementById("swapInformationModal")
    );
    $scope.takeSwapConfirm = new Modal(
        document.getElementById("takeSwapConfirm")
    );
    $scope.errorModal = new Modal(document.getElementById("errorModal"));
    $scope.takeSwapEndConfirm = new Modal(
        document.getElementById("takeSwapEndConfirm")
    );
    $scope.showLoader = true;

    $scope.receiveDropDown = false;
    $scope.selectedReceiveAsset = "Select asset";
    $scope.selectedReceiveContract = "-";
    $scope.selectedSendAsset = "Select asset";
    $scope.selectedSendContract = "-";

    $scope.initializeSendandReceive = true;

    $scope.receiveChanged = 0;
    $scope.sendChanged = 0;


    let timeout;
    $scope.walletTimeOut = function () {
        timeout = setTimeout(function () {
            window.location.reload();
        }, 600000);
    }
    $scope.walletTimeOut();

    addEventListener('click', function (e) {
        clearTimeout(timeout);
        $scope.walletTimeOut();
    })


    $scope.setAllAssetsInReceive = function () {
        $scope.$eval(function () {
            $scope.selectedReceiveAsset = `All Assets`;
            $scope.selectedReceiveContract = "\n";
            $scope.assetToReceive = $scope.assetList[0].contractaddress;
            $scope.selectedReceiveImage = '';
            $scope.selectedReceiveHasImage = false;
            $scope.selectedReceiveVerified = false;
        });
        $scope.allSwaps();
    }


    $scope.setAllAssetsInSend = function () {
        $scope.$eval(function () {
            $scope.selectedSendAsset = `All Assets`;
            $scope.selectedSendContract = "\n";
            $scope.assetToSend = $scope.assetList[0].contractaddress;
            $scope.selectedSendImage = '';
            $scope.selectedSendHasImage = false;
            $scope.selectedSendVerified = false;
        });
        $scope.allSwaps();
    }


    $scope.setSendAndReceiveInit = async function () {
        let id;
        if (cachedDropdowns.send) {
            id = cachedDropdowns.send;
            await $scope.setSendAsset(id);
        } else {
            $scope.selectedReceiveAsset = `All Assets`;
            $scope.selectedReceiveContract = "\n";
            $scope.assetToReceive = $scope.assetList[0].contractaddress;
            $scope.selectedReceiveImage = `${$scope.assetList[0].image}`;
            $scope.selectedReceiveHasImage = $scope.assetList[0].hasImage;
            $scope.selectedReceiveVerified = $scope.assetList[0].verified;
        }
        // Receive part
        let idR;
        if (cachedDropdowns.receive) {
            idR = cachedDropdowns.receive;
            console.log('Receive was cached');
            await $scope.setReceiveAsset(idR);
        } else {
            $scope.selectedSendAsset = `All Assets`;
            $scope.selectedSendAssetSymbol = `${$scope.assetListOwned[0].symbol}`;
            $scope.selectedReceiveAssetSymbol = `${$scope.assetList[0].symbol}`;
            $scope.selectedSendContract = "\n";
            $scope.selectedSendImage = `${$scope.assetListOwned[0].image}`;
            $scope.selectedSendHasImage = $scope.assetListOwned[0].hasImage;
            $scope.selectedSendVerified = $scope.assetListOwned[0].verified;
            $scope.assetToSend = $scope.assetListOwned[0].contractaddress;
        }
        $scope.getAssetBalance();
    };

    $scope.privateAccess = false;

    $scope.swapRecallSuccess = false;

    $scope.swapInfo = {};

    $scope.swapInformationModalOpen = async function (swap_id) {
        let data = {};
        let owner = '';
        let size = 0;

        await ajaxReq.http.get(`${window.getApiServer()}/swaps2/${swap_id}`).then(function (r) {
            size = r.data[0].size;
            data = JSON.parse(r.data[0].data);
            owner = r.data[0].fromAddress;
        });

        let time = new Date(parseInt(data["Time"]) * 1000);

        let tMonth = time.getMonth();
        let tDay = time.getDate();
        let tYear = time.getFullYear();

        time = $scope.months[tMonth] + " " + tDay + ", " + tYear;

        let fromStartTime = "";
        let fromEndTime = "";
        let toStartTime = "";
        let toEndTime = "";

        if (data["FromStartTime"] == 0) {
            fromStartTime = "Now";
        } else {
            fromStartTime = $scope.returnDateString(data["FromStartTime"]);
        }
        if (data["FromEndTime"] == 18446744073709552000) {
            fromEndTime = "Forever";
        } else {
            fromEndTime = $scope.returnDateString(data["FromEndTime"]);
        }

        if (data["ToStartTime"] == 0) {
            toStartTime = "Now";
        } else {
            toStartTime = $scope.returnDateString(data["ToStartTime"]);
        }
        if (data["ToEndTime"] == 18446744073709552000) {
            toEndTime = "Forever";
        } else {
            toEndTime = $scope.returnDateString(data["ToEndTime"]);
        }

        let targes = [];

        data["Targes"].length <= 0 ? (targes = "Public") : (targes = "Private");

        let fromAsset = {};
        let toAsset = {};

        try {
            await window.__fsnGetAsset(data["FromAssetID"]).then(function (res) {
                fromAsset = res;
            });
        } catch (err) {
            console.log(err);
        }

        try {
            await window.__fsnGetAsset(data["ToAssetID"]).then(function (res) {
                toAsset = res;
            });
        } catch (err) {
            console.log(err);
        }

        let minFromAmount;
        let minToAmount;

        let leftOver = parseInt(size) / parseInt(data["SwapSize"]);
        let leftOverBN = new window.BigNumber(leftOver.toString());

        // fromAmount
        let minFromAmountBN = new window.BigNumber(data["MinFromAmount"].toString());
        let fromAmountDec = $scope.countDecimals(fromAsset["Decimals"]);
        let minFromAmountDecimalsBN = new window.BigNumber(fromAmountDec.toString());
        let minFromAmountFormattedBN = minFromAmountBN.div(minFromAmountDecimalsBN);
        let minFromSwapSizeBN = new window.BigNumber(data["SwapSize"]);
        let minFromMaxAmountBN = minFromAmountFormattedBN.times(minFromSwapSizeBN);
        let minFromAmountFinal = leftOverBN.times(minFromMaxAmountBN);

        //toAmount
        let minToAmountBN = new window.BigNumber(data["MinToAmount"].toString());
        let toAmountDec = $scope.countDecimals(toAsset["Decimals"]);
        let minToAmountDecimalsBN = new window.BigNumber(toAmountDec.toString());
        let minToAmountFormattedBN = minToAmountBN.div(minToAmountDecimalsBN);
        let minToSwapSizeBN = new window.BigNumber(data["SwapSize"]);
        let minToMaxAmountBN = minToAmountFormattedBN.times(minToSwapSizeBN);
        let minToAmountFinal = leftOverBN.times(minToMaxAmountBN);

        minFromAmount = minFromAmountFinal.toString()
        minToAmount = minToAmountFinal.toString()

        let fromVerifiedImage = "";
        let fromHasImage = false;
        let fromVerified = false;

        for (let a in window.verifiedAssetsImages) {
            if (window.verifiedAssetsImages[a].assetID == data["FromAssetID"]) {
                // Set matched image name
                fromVerifiedImage = window.verifiedAssetsImages[a].image;
                fromHasImage = true;
                fromVerified = true;
            } else if (
                data["FromAssetID"] ==
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            ) {
                // Set matched image name
                fromVerifiedImage = "";
                fromHasImage = false;
                fromVerified = true;
            }
        }

        let toVerifiedImage = "";
        let toHasImage = false;
        let toVerified = false;

        for (let a in window.verifiedAssetsImages) {
            if (window.verifiedAssetsImages[a].assetID == data["ToAssetID"]) {
                // Set matched image name
                toVerifiedImage = window.verifiedAssetsImages[a].image;
                toHasImage = true;
                toVerified = true;
            } else if (
                data["ToAssetID"] ==
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
            ) {
                // Set matched image name
                toVerifiedImage = "";
                toHasImage = false;
                toVerified = true;
            }
        }

        $scope.$apply(function () {
            $scope.swapInfo = {
                FromAssetName: fromAsset["Name"],
                FromAssetSymbol: fromAsset["Symbol"],
                FromAssetID: data["FromAssetID"],
                FromEndTime: fromEndTime,
                FromStartTime: fromStartTime,
                ID: data["SwapID"],
                MinFromAmount: minFromAmount,
                MinToAmount: minToAmount,
                Owner: owner,
                SwapSize: parseInt(data["SwapSize"]),
                Targes: targes,
                Time: time,
                size: parseInt(size),
                ToAssetName: toAsset["Name"],
                ToAssetSymbol: toAsset["Symbol"],
                ToAssetID: data["ToAssetID"],
                ToEndTime: toEndTime,
                ToStartTime: toStartTime,
                toVerifiedImage: toVerifiedImage,
                toHasImage: toHasImage,
                toVerified: toVerified,
                fromVerifiedImage: fromVerifiedImage,
                fromHasImage: fromHasImage,
                fromVerified: fromVerified
            };
        });

        $scope.swapInformationModal.open();
    };

    $scope.setExistingTimeLock = function (asset_id, id) {
        $scope.$eval(function () {
            $scope.selectedAssetBalance =
                $scope.myActiveTimeLocks[asset_id][id].amount;
            $scope.selectedTimeLockAmount =
                $scope.myActiveTimeLocks[asset_id][id].amount;
            $scope.selectedTimeLockTimespan = `${
                $scope.myActiveTimeLocks[asset_id][id].startTimeString
                } - ${$scope.myActiveTimeLocks[asset_id][id].endTimeString}`;
            $scope.todayDate = $scope.myActiveTimeLocks[asset_id][id].startTime;
            $scope.fromEndTime = $scope.myActiveTimeLocks[asset_id][id].endTime;
            $scope.hasTimeLockSet = true;
            $scope.timeLockDropDown = false;
        });
    };

    $scope.setSwapRate = function () {
        if ($scope.makeReceiveAmount <= 0) {
            return;
        }
        window.Decimal.set({precision: 18, rounding: 4});

        let makeSendAmountBN = new Decimal(
            $scope.convertToString($scope.makeSendAmount)
        );
        let makeReceiveAmountBN = new Decimal(
            $scope.convertToString($scope.makeReceiveAmount)
        );

        let swapRateFinal = makeSendAmountBN.div(makeReceiveAmountBN);

        $scope.makeSendSwapRate = swapRateFinal.toString();
    };

    $scope.setSendAmountMakeSwap = function () {
        if ($scope.makeReceiveAmount <= 0 || $scope.makeSendSwapRate <= 0) {
            return;
        }
        let makeSendSwapRateBN = new BigNumber(
            $scope.convertToString($scope.makeSendSwapRate)
        );
        let makeReceiveAmountBN = new BigNumber(
            $scope.convertToString($scope.makeReceiveAmount)
        );

        let sendAmountFinal = makeSendSwapRateBN.mul(makeReceiveAmountBN);

        $scope.makeSendAmount = sendAmountFinal.toString();
    };

    $scope.setReceiveAmountMakeSwap = function () {
        if ($scope.makeSendAmount <= 0 || $scope.makeSendSwapRate <= 0 || $scope.makeMinumumSwap == '' || $scope.makeMinumumSwap <= 0) {
            return;
        }
        window.Decimal.set({precision: 18, rounding: 4});
        let one = new Decimal($scope.convertToString(1));
        let makeSendSwapRateBN = new Decimal(
            $scope.convertToString($scope.makeSendSwapRate)
        );
        let makeSendAmountBN = new Decimal(
            $scope.convertToString($scope.makeSendAmount)
        );

        let calc = one.div(makeSendSwapRateBN);

        let receiveAmountFinal = makeSendAmountBN.mul(calc);

        $scope.makeReceiveAmount = receiveAmountFinal.toString();
    };

    $scope.toHexString = function (byteArray) {
        var s = "0x";
        byteArray.forEach(function (byte) {
            s += ("0" + (byte & 0xff).toString(16)).slice(-2);
        });
        return s;
    };

    $scope.setMinimumMakes = function () {
        if (
            $scope.makeMinumumSwap <= 0 ||
            $scope.makeMinumumSwap == "" ||
            $scope.makeSendAmount <= 0 ||
            $scope.makeReceiveAmount <= 0
        ) {
            return;
        }

        let makeMinBN = new window.BigNumber(
            $scope.convertToString($scope.makeMinumumSwap)
        );

        //Send an receive
        let makeSendBN = new window.BigNumber(
            $scope.convertToString($scope.makeSendAmount)
        );
        let makeReceiveBN = new window.BigNumber(
            $scope.convertToString($scope.makeReceiveAmount)
        );

        let makeSendFinal = makeSendBN.div(makeMinBN);
        let makeReceiveFinal = makeReceiveBN.div(makeMinBN);

        $scope.minimumMakeSend = makeSendFinal.toString();
        $scope.minimumReceiveSend = makeReceiveFinal.toString();
    };

    $scope.setReceiveAsset = async function (id) {
        $scope.$eval(function () {
            $scope.selectedReceiveAsset = `${$scope.assetList[id].name} (${
                $scope.assetList[id].symbol
                })`;
            $scope.selectedReceiveAssetSymbol = `${$scope.assetList[id].symbol}`;
            $scope.selectedReceiveImage = `${$scope.assetList[id].image}`;
            $scope.selectedReceiveHasImage = $scope.assetList[id].hasImage;
            $scope.selectedReceiveContract = $scope.assetList[id].contractaddress;
            $scope.selectedReceiveVerified = $scope.assetList[id].verified;
            $scope.assetToReceive = $scope.assetList[id].contractaddress;
            $scope.receiveDropDown = false;
            $scope.receiveDropDown2 = false;
        });
        $scope.receiveChanged = 1;
        $scope.updateDropDownCookie('receive', id);
        await $scope.allSwaps(0);
    };

    $scope.setSendAsset = async function (id) {
        $scope.$eval(function () {
            $scope.selectedSendAsset = `${$scope.assetListOwned[id].name} (${
                $scope.assetListOwned[id].symbol
                })`;
            $scope.selectedSendAssetSymbol = `${$scope.assetListOwned[id].symbol}`;
            $scope.selectedSendContract = $scope.assetListOwned[id].contractaddress;
            $scope.selectedSendImage = `${$scope.assetListOwned[id].image}`;
            $scope.selectedSendHasImage = $scope.assetListOwned[id].hasImage;
            $scope.assetToSend = $scope.assetListOwned[id].contractaddress;
            $scope.selectedSendVerified = $scope.assetListOwned[id].verified;
            $scope.sendHasTimeLockBalance = $scope.assetListOwned[id].timelockBalance;
            $scope.sendDropDown = false;
            $scope.sendDropDown2 = false;
        });
        $scope.getAssetBalance();
        $scope.sendChanged = 1;
        $scope.updateDropDownCookie('send', id);
        await $scope.allSwaps(0);
    };

    $scope.copyToClipboard = function (text) {
        let clipboardAvailable;
        if (clipboardAvailable === undefined) {
            clipboardAvailable =
                typeof document.queryCommandSupported === "function" &&
                document.queryCommandSupported("copy");
        }
        let success = false;
        const body = document.body;

        if (body) {
            // add the text to a hidden node
            const node = document.createElement("span");
            node.textContent = text;
            node.style.opacity = "0";
            node.style.position = "absolute";
            node.style.whiteSpace = "pre-wrap";
            body.appendChild(node);

            // select the text
            const selection = window.getSelection();
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(node);
            selection.addRange(range);

            // attempt to copy
            try {
                document.execCommand("copy");
                success = true;
            } catch (e) {
            }

            // remove selection and node
            selection.removeAllRanges();
            body.removeChild(node);
        }

        return success;
    };

    $scope.$watch(
        function () {
            if (walletService.wallet == null) return null;
            return walletService.wallet.getAddressString();
        },
        function () {
            if (walletService.wallet == null) return;
            $scope.wallet = walletService.wallet;
            $scope.wd = true;
        }
    );

    $scope.countDecimals = function (decimals) {
        let returnDecimals = "1";
        for (let i = 0; i < decimals; i++) {
            returnDecimals += "0";
        }
        return parseInt(returnDecimals);
    };

    $scope.setWalletAddress = function () {
        if (walletService.wallet !== null) {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;
            $scope.walletAddress = walletAddress;
        }
    };

    $scope.myTimeLockedAssets = [];
    $scope.myActiveTimeLocks = [];
    $scope.getTimeLockBalances = async function () {
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let allAssets = await window.__fsnGetAllAssets();
        await window.__fsnGetAllTimeLockBalances(walletAddress).then(function (res) {
            $scope.myActiveTimeLocks = [];
            for (let asset in res) {
                let timelocks = res[asset].Items;
                $scope.myActiveTimeLocks[asset] = [];
                let x = 0;
                for (let timelock in timelocks) {
                    let amount = new window.BigNumber(timelocks[timelock].Value);
                    let decimals = allAssets[asset].Decimals;
                    let divider = $scope.countDecimals(parseInt(decimals));
                    let amountFinal = amount.div(divider.toString());
                    let data = {
                        id: x,
                        asset_id: asset,
                        amount: amountFinal.toString(),
                        startTime: timelocks[timelock].StartTime,
                        endTime: timelocks[timelock].EndTime,
                        startTimeString: $scope.returnDateString(
                            timelocks[timelock].StartTime,
                            "Start"
                        ),
                        endTimeString: $scope.returnDateString(
                            timelocks[timelock].EndTime,
                            "End"
                        )
                    };
                    x++;
                    $scope.myActiveTimeLocks[asset].push(data);
                }
            }
            // console.log($scope.myActiveTimeLocks);
            $scope.$eval(function () {
                $scope.myTimeLockedAssets = Object.keys(res);
            });
        });
    };

    $scope.hasTimeLockBalance = function (asset_id) {
        return $scope.myTimeLockedAssets.includes(asset_id);
    };
    $scope.takeAvailable = function (asset_id, minswaptaker, ToStartTime, ToEndTime) {
        if ($scope.allBalance[asset_id] >= minswaptaker) {
            return false;
        } else if (ToStartTime == 0 && ToEndTime == 18446744073709552000) {
            if ($scope.allBalance[asset_id] >= minswaptaker) {
                // console.log(asset_id, minswaptaker, ToStartTime, ToEndTime);
                return false;
            } else {
                return true;
            }
        } else if (ToStartTime != 0 && ToEndTime != 18446744073709552000 || ToStartTime == 0 && ToEndTime != 18446744073709552000 || ToStartTime != 0 && ToEndTime == 18446744073709552000) {
            if ($scope.myTimeLockedAssets.includes(asset_id) == true) {
                return false;
            } else {
                return true;
            }
        }
    }


    $scope.getShortAddressNotation = async function () {
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let notation = "";

        try {
            await window.__getNotation(walletAddress).then(function (res) {
                notation = res;
            });
        } catch (err) {
            console.log(err);
        }

        if (notation === 0) {
            $scope.addressNotation = "Not available";
        } else {
            $scope.$eval(function () {
                $scope.addressNotation = notation;
                $scope.addressNotation = notation;
            });
        }
        return notation;
    };

    $scope.getAllAssets = async function () {
        if (walletService.wallet !== null) {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;
            let assetListOwned = [];
            let assetList2 = [];
            let assetList = await window.__fsnGetAllAssets();

            let x = -1;
            for (let asset in assetList) {
                let id = assetList[asset]["ID"];
                let owned = false;
                let assetBalance = "";

                let verifiedImage = "";
                let hasImage = false;
                let verifiedAsset = false;

                for (let a in window.verifiedAssetsImages) {
                    if (id == window.verifiedAssetsImages[a].assetID) {
                        // Set matched image name
                        verifiedImage = window.verifiedAssetsImages[a].image;
                        hasImage = true;
                        verifiedAsset = true;
                    }
                }

                let didFSN = false;
                // Set FSN icon for PSN as well
                if (
                    id ==
                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                ) {
                    verifiedImage = "EFSN_LIGHT.svg";
                    hasImage = true;
                    verifiedAsset = true;
                    didFSN = true;
                }

                let data = {
                    id: x,
                    name: assetList[asset]["Name"],
                    symbol: assetList[asset]["Symbol"],
                    decimals: assetList[asset]["Decimals"],
                    contractaddress: id,
                    owner: owned,
                    image: verifiedImage,
                    hasImage: hasImage,
                    verified: verifiedAsset
                };
                if (!didFSN) {
                    await assetList2.push(data);
                }
                x++;
            }

            let balances = {};

            await window.__fsnGetAllBalances(walletAddress).then(function (res) {
                balances = res;
            });

            if (balances) {
                let a = Object.keys(balances),
                    b = Object.keys($scope.myActiveTimeLocks);
                let c = a.concat(b);
                let ownedAssets = c.filter(function (item, pos) {
                    return c.indexOf(item) == pos;
                });

                let myAssets = [];
                for (let i in ownedAssets) {
                    let asset = ownedAssets[i];
                    myAssets.push(assetList[asset]);
                }

                assetList = myAssets;
            }

            for (let asset in assetList) {
                let id = assetList[asset]["ID"];
                id = assetList[asset]["ID"];
                let owner = assetList[asset]["Owner"];
                let owned = false;
                let assetBalance = "";

                let verifiedImage = "";
                let hasImage = false;
                let verifiedAsset = false;

                if (balances) {
                    assetBalance = balances[id];
                }

                for (let a in window.verifiedAssetsImages) {
                    if (id == window.verifiedAssetsImages[a].assetID) {
                        // Set matched image name
                        verifiedImage = window.verifiedAssetsImages[a].image;
                        hasImage = true;
                        verifiedAsset = true;
                    }
                }

                // Set FSN icon for PSN as well
                if (
                    id ==
                    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                ) {
                    verifiedImage = "EFSN_LIGHT.svg";
                    hasImage = true;
                    verifiedAsset = true;
                }

                let divider = $scope.countDecimals(assetList[asset]["Decimals"]);
                let data = {
                    id: x,
                    name: assetList[asset]["Name"],
                    symbol: assetList[asset]["Symbol"],
                    decimals: assetList[asset]["Decimals"],
                    total: assetList[asset]["Total"] / divider,
                    contractaddress: id,
                    balance: assetBalance / divider,
                    owner: owned,
                    image: verifiedImage,
                    hasImage: hasImage,
                    verified: verifiedAsset
                };
                await assetList2.push(data);
                x++;
                if (assetBalance > 0.000000000000000001 && balances) {
                    let divider = $scope.countDecimals(assetList[asset]["Decimals"]);
                    let data = {
                        id: assetListOwned.length,
                        name: assetList[asset]["Name"],
                        symbol: assetList[asset]["Symbol"],
                        decimals: assetList[asset]["Decimals"],
                        total: assetList[asset]["Total"] / divider,
                        contractaddress: id,
                        balance: assetBalance / divider,
                        owner: owned,
                        image: verifiedImage,
                        hasImage: hasImage,
                        verified: verifiedAsset,
                        timelockBalance: false
                    };
                    await assetListOwned.push(data);
                } else if (Object.keys($scope.myActiveTimeLocks).includes(id)) {
                    let divider = $scope.countDecimals(assetList[asset]["Decimals"]);
                    let data = {
                        id: assetListOwned.length,
                        name: assetList[asset]["Name"],
                        symbol: assetList[asset]["Symbol"],
                        decimals: assetList[asset]["Decimals"],
                        total: assetList[asset]["Total"] / divider,
                        contractaddress: id,
                        balance: 0,
                        owner: owned,
                        image: verifiedImage,
                        hasImage: hasImage,
                        verified: verifiedAsset,
                        timelockBalance: true
                    };
                    await assetListOwned.push(data);
                }
            }

            $scope.$eval(function () {
                $scope.assetList = assetList2;
                $scope.assetListOwned = assetListOwned;
            });
        }
    };

    $scope.setMaxTakeSwap = function () {
        let amount = "";
        if (
            $scope.takeDataFront.fromAssetBalance >= $scope.takeDataFront.maxAmount
        ) {
            amount = $scope.takeDataFront.maxAmount;
        } else {
            $scope.makeTarges;
            amount = $scope.takeDataFront.fromAssetBalance;
        }
        $scope.takeAmountSwap = amount;

        $scope.setReceive();
    };

    $scope.takeModalPrivateSwaps = async function (id) {
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let balance = "";
        let decimals = 0;
        let toName = "";
        let fromName = "";

        let fromAsset = [];

        try {
            await web3.fsn
                .getBalance($scope.openTakeSwaps[id].toAssetId, walletAddress)
                .then(function (res) {
                    balance = res;
                });
            await window
                .__fsnGetAsset($scope.openTakeSwaps[id].toAssetId)
                .then(function (res) {
                    decimals = res["Decimals"];
                });
            await window
                .__fsnGetAsset($scope.openTakeSwaps[id].toAssetId)
                .then(function (res) {
                    toName = res["Name"];
                });
            await window
                .__fsnGetAsset($scope.openTakeSwaps[id].fromAssetId)
                .then(function (res) {
                    fromName = res["Name"];
                });
        } catch (err) {
            console.log(err);
        }

        balance = balance / $scope.countDecimals(decimals);

        await $scope.$apply(function () {
            $scope.takeDataFront.swapId = $scope.openTakeSwaps[id];
            $scope.takeDataFront.fromAssetName = toName;
            $scope.takeDataFront.fromAmountCut = $scope.openTakeSwaps[id].fromAmountCut;
            $scope.takeDataFront.toAmountCut = $scope.openTakeSwaps[id].toAmountCut;
            $scope.takeDataFront.fromAssetSymbol = $scope.openTakeSwaps[id].toAssetSymbol;
            $scope.takeDataFront.fromAssetId = $scope.openTakeSwaps[id].toAssetId;
            $scope.takeDataFront.swapSize = $scope.openTakeSwaps[id].maxswaps;
            $scope.takeDataFront.toAssetName = fromName;
            $scope.takeDataFront.toAssetMin =
                $scope.openTakeSwaps[id].minswap / $scope.openTakeSwaps[id].swapratetaker;
            $scope.takeDataFront.toAssetSymbol = $scope.openTakeSwaps[id].fromAssetSymbol;
            $scope.takeDataFront.toAssetId = $scope.openTakeSwaps[id].fromAssetId;
            $scope.takeDataFront.fromAssetMin = $scope.openTakeSwaps[id].minswaptaker;
            $scope.takeDataFront.fromAssetBalance = balance;
            $scope.takeDataFront.swapRate = $scope.openTakeSwaps[id].swapratetaker;
            $scope.takeDataFront.maxAmount = $scope.openTakeSwaps[id].toAmount;
            $scope.takeDataFront.fromAmount = $scope.openTakeSwaps[id].fromAmount;
            $scope.takeDataFront.toAmount = $scope.openTakeSwaps[id].toAmount;
            $scope.takeDataFront.fromVerified = $scope.openTakeSwaps[id].toVerified;
            $scope.takeDataFront.toVerified = $scope.openTakeSwaps[id].fromVerified;
            $scope.takeDataFront.size = $scope.openTakeSwaps[id].size;
            $scope.takeAmountSwap = 1;
        });
        await $scope.setReceive(1).then(function () {
            $scope.takeSwapModal.open();
        });
    };


    $scope.takeId = 0;
    $scope.takeModal = async function (id, pass) {
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let balance = "";
        let decimals = 0;
        let toName = "";
        let fromName = "";

        let fromAsset = [];

        try {
            await web3.fsn
                .getBalance($scope.swapsList[id].toAssetId, walletAddress)
                .then(function (res) {
                    balance = res;
                });
            await window
                .__fsnGetAsset($scope.swapsList[id].toAssetId)
                .then(function (res) {
                    decimals = res["Decimals"];
                });
            await window
                .__fsnGetAsset($scope.swapsList[id].toAssetId)
                .then(function (res) {
                    toName = res["Name"];
                });
            await window
                .__fsnGetAsset($scope.swapsList[id].fromAssetId)
                .then(function (res) {
                    fromName = res["Name"];
                });
        } catch (err) {
            console.log(err);
        }

        if ($scope.swapsList[id].fromAssetId == "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe") {
            pass = true;
        }

        balance = balance / $scope.countDecimals(decimals);

        await $scope.$apply(function () {
            $scope.takeDataFront.swapId = $scope.swapsList[id];
            $scope.takeDataFront.fromAssetName = toName;
            $scope.takeDataFront.fromAmountCut = $scope.swapsList[id].fromAmountCut;
            $scope.takeDataFront.toAmountCut = $scope.swapsList[id].toAmountCut;
            $scope.takeDataFront.fromAssetSymbol = $scope.swapsList[id].toAssetSymbol;
            $scope.takeDataFront.fromAssetId = $scope.swapsList[id].toAssetId;
            $scope.takeDataFront.swapSize = $scope.swapsList[id].maxswaps;
            $scope.takeDataFront.toAssetName = fromName;
            $scope.takeDataFront.toAssetMin =
                $scope.swapsList[id].minswap / $scope.swapsList[id].swapratetaker;
            $scope.takeDataFront.toAssetSymbol = $scope.swapsList[id].fromAssetSymbol;
            $scope.takeDataFront.toAssetId = $scope.swapsList[id].fromAssetId;
            $scope.takeDataFront.fromAssetMin = $scope.swapsList[id].minswaptaker;
            $scope.takeDataFront.fromAssetBalance = balance;
            $scope.takeDataFront.swapRate = $scope.swapsList[id].swapratetaker;
            $scope.takeDataFront.maxAmount = $scope.swapsList[id].toAmount;
            $scope.takeDataFront.fromAmount = $scope.swapsList[id].fromAmount;
            $scope.takeDataFront.toAmount = $scope.swapsList[id].toAmount;
            $scope.takeDataFront.fromVerified = $scope.swapsList[id].toVerified;
            $scope.takeDataFront.toVerified = $scope.swapsList[id].fromVerified;
            $scope.takeDataFront.size = $scope.swapsList[id].size;
            $scope.takeAmountSwap = 1;
            $scope.takeId = id;
        });

        await $scope.setReceive(1).then(function(){
            if (pass === false) {
                if ($scope.suspiciousAsset($scope.takeDataFront.toAssetName) || $scope.suspiciousAsset($scope.takeDataFront.toAssetSymbol)) {
                    if (!$scope.takeDataFront.toVerified) {
                        $scope.suspiciousAssetModal.open();
                    } else {
                        $scope.takeSwapModal.open()
                    }
                }
            } else {
                try {
                    $scope.takeSwapModal.open();
                } catch ( err ){
                    console.log ( err );
                }
            }
        });
    };

    $scope.setReceive = async function (amount) {
        if ($scope.takeAmountSwap == "" || $scope.takeAmountSwap == 0) {
            $scope.$eval(function () {
                $scope.takeAmountSwap = 1;
            });
        }

        window.Decimal.set({precision: 18, rounding: 4});

        let perc1 = new window.Decimal(
            $scope.convertToString($scope.takeAmountSwap)
        );

        if (amount >= 0) {
            perc1 = new window.Decimal($scope.convertToString(1));
        }

        let perc2 = new window.Decimal(
            $scope.convertToString($scope.takeDataFront.size)
        );
        let perc3 = perc1.div($scope.convertToString(perc2));

        let perc4 = perc1.dividedBy(perc2.toString());

        let fromAmountBN = new window.Decimal(
            $scope.convertToString($scope.takeDataFront.fromAmount)
        );
        let fromFinal = fromAmountBN.times($scope.convertToString(perc3));

        let toAmountBN = new window.Decimal(
            $scope.convertToString($scope.takeDataFront.toAmount)
        );
        let toFinal = toAmountBN.times($scope.convertToString(perc3));

        await $scope.$eval(function () {
            $scope.receiveTokens = fromFinal.toPrecision(5);
            $scope.sendTokens = toFinal.toPrecision(5);
        });
    };

    $scope.calculateSwapSize = function (amount, swap_size, maxamount) {
        let percentage = amount / maxamount;
        let calculatedSwapSize = swap_size * percentage;
        return calculatedSwapSize;
    };

    $scope.takeSwap = async function (asset_id, swap_id, amount) {
        let password = walletService.password;
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let toAsset = [];

        try {
            await window.__fsnGetAsset(asset_id).then(function (res) {
                toAsset = res;
            });
        } catch (err) {
            console.log(err);
        }

        let data = {
            from: walletAddress,
            SwapID: swap_id.swap_id,
            Size: $scope.takeAmountSwap
        };

        if (!$scope.account && $scope.wallet.hwType !== "ledger") {
            $scope.account = web3.eth.accounts.privateKeyToAccount(
                $scope.toHexString($scope.wallet.getPrivateKey())
            );
        }

        try {
            await web3.fsntx.buildTakeSwapTx(data).then(function (tx) {
                tx.from = walletAddress;
                tx.chainId = _CHAINID;
                data = tx;
                if ($scope.wallet.hwType == "ledger") {
                    return;
                }
                web3.fsn
                    .signAndTransmit(tx, $scope.account.signTransaction)
                    .then(txHash => {
                        window.log(`TXID : ${txHash}`);
                    });

                return $scope.takeSwapEndConfirm.open();
            });
        } catch (err) {
            $scope.errorModal.open();
            console.log(err);
        }
        if ($scope.wallet.hwType == "ledger") {
            let ledgerConfig = {
                privKey: $scope.wallet.privKey
                    ? $scope.wallet.getPrivateKeyString()
                    : "",
                path: $scope.wallet.getPath(),
                hwType: $scope.wallet.getHWType(),
                hwTransport: $scope.wallet.getHWTransport()
            };
            let rawTx = data;
            var eTx = new ethUtil.Tx(rawTx);
            if (ledgerConfig.hwType == "ledger") {
                var app = new ledgerEth(ledgerConfig.hwTransport);
                var EIP155Supported = true;
                var localCallback = async function (result, error) {
                    if (typeof error != "undefined") {
                        if (callback !== undefined)
                            callback({
                                isError: true,
                                error: error
                            });
                        return;
                    }
                    var splitVersion = result["version"].split(".");
                    if (parseInt(splitVersion[0]) > 1) {
                        EIP155Supported = true;
                    } else if (parseInt(splitVersion[1]) > 0) {
                        EIP155Supported = true;
                    } else if (parseInt(splitVersion[2]) > 2) {
                        EIP155Supported = true;
                    }
                    var oldTx = Object.assign(rawTx, {});
                    let input = oldTx.input;
                    rawTx.chainId = _CHAINID;
                    return uiFuncs.signed(app, rawTx, ledgerConfig, false, function (res) {
                        oldTx.r = res.r;
                        oldTx.s = res.s;
                        oldTx.v = res.v;
                        oldTx.input = input;
                        delete oldTx.isError;
                        delete oldTx.rawTx;
                        delete oldTx.signedTx;
                        web3.fsntx.sendRawTransaction(oldTx).then(function (txHash) {
                            $scope.takeSwapEndConfirm.open();
                        });
                    });
                };
                $scope.notifier.info("Please, confirm transaction on Ledger.");
                await app.getAppConfiguration(localCallback);
            }
        }
    };

    $scope.switchAsset = async function () {
        let sendAsset = $scope.assetToSend;
        let receiveAsset = $scope.assetToReceive;
        let canSwitch = false;
        let assetListOwnedId = "";
        let assetListId = "";

        for (let a = 0; a < $scope.assetListOwned.length; a++) {
            if ($scope.assetListOwned[a].contractaddress == receiveAsset) {
                assetListOwnedId = $scope.assetListOwned[a].id;
                canSwitch = true;
            }
        }

        try {
            if (
                $scope.assetListOwned[assetListOwnedId].contractaddress !== receiveAsset
            ) {
                canSwitch = false;
            }
        } catch (err) {
        }

        for (let a = 0; a < $scope.assetList.length; a++) {
            if ($scope.assetList[a].contractaddress == sendAsset) {
                assetListId = $scope.assetList[a].id;
                canSwitch = true;
            }
        }
        if ($scope.assetList[assetListId].contractaddress !== sendAsset) {
            canSwitch = false;
        }

        if (canSwitch) {
            $scope.setSendAsset(assetListOwnedId);
            $scope.setReceiveAsset(assetListId);
        }
    };

    $scope.makeModal = async function (send, receive) {
        $scope.$eval(function () {
            $scope.makeSendAmount = 0;
            $scope.makeReceiveAmount = 0;
            $scope.makeMinumumSwap = 0;
            $scope.privateAccess = false;
            $scope.makeTarges = "";
            $scope.showTimeLockSend = false;
            $scope.showExistingTimeLocks = false;
            $scope.showTimeLockReceive = false;
            $scope.ToStartTime = "";
            $scope.ToEndTime = "";
            $scope.fromStartTime = "";
            $scope.fromEndTime = "";
        });
        $scope.makeSwapModal.open();
        let a = document.getElementById('makeSendAmount');
        a.focus();
        setTimeout(function () {
            a.focus();
        }, 200);
    };

    $scope.makeSwapConfirmation = async function (end) {
        let sendAssetSymbol = "";
        let receiveAssetSymbol = "";
        for (let asset in $scope.assetList) {
            if ($scope.assetToSend == $scope.assetList[asset].contractaddress) {
                sendAssetSymbol = $scope.assetList[asset].symbol;
            }
            if ($scope.assetToReceive == $scope.assetList[asset].contractaddress) {
                receiveAssetSymbol = $scope.assetList[asset].symbol;
            }
        }

        $scope.$eval(function () {
            $scope.assetToSendConfirm = sendAssetSymbol;
            $scope.assetToReceiveConfirm = receiveAssetSymbol;
            $scope.fromStartTimeString = $scope.returnDateString(
                new Date($scope.fromStartTime).getTime() / 1000.0 + 1000
            );
            $scope.fromEndTimeString = $scope.returnDateString(
                new Date($scope.fromEndTime).getTime() / 1000.0 + 1000
            );
            $scope.toStartTimeString = $scope.returnDateString(
                new Date($scope.ToStartTime).getTime() / 1000.0 + 1000
            );
            $scope.toEndTimeString = $scope.returnDateString(
                new Date($scope.ToEndTime).getTime() / 1000.0 + 1000
            );
        });

        if (end === "end") {
            $scope.makeSwapConfirmEndModal.open();
        } else if (end === "notend") {
            $scope.makeSwapConfirmModal.open();
        }
    };

    function convertDate(inputFormat) {
        function pad(s) {
            return s < 10 ? "0" + s : s;
        }

        var d = new Date(inputFormat);
        return [
            d.getUTCFullYear(),
            pad(d.getUTCMonth() + 1),
            pad(d.getUTCDate())
        ].join("-");
    }

    function getHexDate(d) {
        return "0x" + (new Date(d).getTime() / 1000).toString(16);
    }

    let targesArray = [];

    $scope.allBalance = [];

    $scope.hasEnoughBalance = function (
        asset_id,
        minswaptaker,
        startTime,
        endTime
    ) {
        if ($scope.allBalance[asset_id] > minswaptaker) {
            return true;
        } else {
            return $scope.hasTimeLockBalance(asset_id);
        }
    };

    $scope.takeGetAllBalances = async function () {
        try {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;
            let decimals = 0;
            let assetBalance = 0;

            let allAssets = {};
            await window.__fsnGetAllAssets().then(function (r) {
                allAssets = r;
            })
            let allBalances = {};
            await window.__fsnGetAllBalances(walletAddress).then(function (r) {
                allBalances = r;
            });

            let myBalances = [];
            for (let asset in allBalances) {
                decimals = allAssets[asset].Decimals;
                let amount = new Decimal(allBalances[asset]);
                let amountFinal = amount.div($scope.countDecimals(decimals).toString());
                myBalances[asset] = amountFinal.toString();
            }

            $scope.$eval(function () {
                $scope.allBalance = myBalances;
            });
        } catch (err) {
            console.log(err);
        }
    };

    $scope.makeSwap = async function () {
        targesArray = [];
        let password = walletService.password;
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;

        let fromAsset = [];
        let toAsset = [];

        try {
            await window.__fsnGetAsset($scope.assetToSend).then(function (res) {
                fromAsset = res;
            });
        } catch (err) {
            $scope.errorModal.open();
            console.log(err);
        }

        try {
            await window.__fsnGetAsset($scope.assetToReceive).then(function (res) {
                toAsset = res;
            });
        } catch (err) {
            $scope.errorModal.open();
            console.log(err);
        }

        if ($scope.makeTarges !== "") {
            $scope.makeTarges = $scope.makeTarges.replace(" ", "");
            let targesArr = $scope.makeTarges.split(",");
            await $scope.processAllTarges(targesArr, 0);
        } else {
            targesArray = [];
        }

        if ($scope.makeMinumumSwap == "" || $scope.makeMinumumSwap <= 0) {
            $scope.makeMinumumSwap = 1;
        }

        //Global
        let makeMinimumSwapBN = new BigNumber(
            $scope.convertToString($scope.makeMinumumSwap)
        );

        //Receive Part

        BigNumber.config({DECIMAL_PLACES: parseInt(toAsset["Decimals"]) > 0 ? parseInt(toAsset["Decimals"]) - 1 : 0});
        let makeReceiveAmountBN = new BigNumber(
            $scope.convertToString($scope.makeReceiveAmount)
        );
        let makeReceiveAmountDiv = makeReceiveAmountBN.div(makeMinimumSwapBN);
        let makeReceiveString = makeReceiveAmountDiv.toString();
        let makeReceiveFinal = $scope.makeBigNumber(
            makeReceiveString,
            parseInt(toAsset["Decimals"])
        );

        //Send Part
        BigNumber.config({DECIMAL_PLACES: parseInt(fromAsset["Decimals"]) > 0 ? parseInt(fromAsset["Decimals"]) - 1 : 0});
        let makeSendAmountBN = new BigNumber(
            $scope.convertToString($scope.makeSendAmount)
        );
        let makeSendAmountDiv = makeSendAmountBN.div(makeMinimumSwapBN);
        let makeSendString = makeSendAmountDiv.toString();
        let makeSendFinal = $scope.makeBigNumber(
            makeSendString,
            parseInt(fromAsset["Decimals"])
        );

        //Convert to Hex

        let minToAmountHex = "0x" + makeReceiveFinal.toString(16);
        let minFromAmountHex = "0x" + makeSendFinal.toString(16);

        let data = {
            from: walletAddress,
            FromAssetID: $scope.assetToSend,
            ToAssetID: $scope.assetToReceive,
            MinToAmount: minToAmountHex,
            MinFromAmount: minFromAmountHex,
            SwapSize: parseInt($scope.makeMinumumSwap),
            Targes: targesArray
        };

        // Send part
        if ($scope.showTimeLockSend == true) {
            if ($scope.sendTimeLock == "scheduled") {
                let fromStartTime = getHexDate(convertDate($scope.fromStartTime));
                let fromEndTime = web3.fsn.consts.TimeForeverStr;

                data.FromStartTime = fromStartTime;
                data.FromEndTime = fromEndTime;
            }
            if ($scope.sendTimeLock == "daterange") {
                let fromStartTime = getHexDate(convertDate($scope.fromStartTime));
                let fromEndTime = getHexDate(convertDate($scope.fromEndTime));

                data.FromStartTime = fromStartTime;
                data.FromEndTime = fromEndTime;
            }
        }

        if ($scope.hasTimeLockSet) {
            let fromStartTime = "0x" + ($scope.todayDate).toString(16);
            let fromEndTime = "";
            if ($scope.fromEndTime == 18446744073709552000) {
                fromEndTime = web3.fsn.consts.TimeForeverStr;
            } else {
                fromEndTime = "0x" + ($scope.fromEndTime).toString(16);
            }
            data.FromStartTime = fromStartTime;
            data.FromEndTime = fromEndTime;
        }

        // Receive part
        if ($scope.showTimeLockReceive == true) {
            if ($scope.receiveTimeLock == "scheduled") {
                let toStartTime = getHexDate(convertDate($scope.ToStartTime));
                let toEndTime = web3.fsn.consts.TimeForeverStr;

                data.ToStartTime = toStartTime;
                data.ToEndTime = toEndTime;
            }

            if ($scope.receiveTimeLock == "daterange") {
                let toStartTime = getHexDate(convertDate($scope.ToStartTime));
                let toEndTime = getHexDate(convertDate($scope.ToEndTime));

                data.ToStartTime = toStartTime;
                data.ToEndTime = toEndTime;
            }
        }

        if (!$scope.account && $scope.wallet.hwType !== "ledger") {
            $scope.account = web3.eth.accounts.privateKeyToAccount(
                $scope.toHexString($scope.wallet.getPrivateKey())
            );
        }

        try {
            await web3.fsntx.buildMakeSwapTx(data).then(function (tx) {
                tx.from = walletAddress;
                tx.chainId = _CHAINID;
                data = tx;
                if ($scope.wallet.hwType == "ledger") {
                    return;
                }
                return web3.fsn
                    .signAndTransmit(tx, $scope.account.signTransaction)
                    .then(txHash => {
                        window.log(`TXID: ${txHash}`);
                        $scope.makeSwapConfirmation("end");
                    });
            });
        } catch (err) {
            $scope.errorModal.open();
            console.log(err);
        }
        if ($scope.wallet.hwType == "ledger") {
            let ledgerConfig = {
                privKey: $scope.wallet.privKey
                    ? $scope.wallet.getPrivateKeyString()
                    : "",
                path: $scope.wallet.getPath(),
                hwType: $scope.wallet.getHWType(),
                hwTransport: $scope.wallet.getHWTransport()
            };
            let rawTx = data;
            var eTx = new ethUtil.Tx(rawTx);
            if (ledgerConfig.hwType == "ledger") {
                var app = new ledgerEth(ledgerConfig.hwTransport);
                var EIP155Supported = true;
                var localCallback = async function (result, error) {
                    if (typeof error != "undefined") {
                        if (callback !== undefined)
                            callback({
                                isError: true,
                                error: error
                            });
                        return;
                    }
                    var splitVersion = result["version"].split(".");
                    if (parseInt(splitVersion[0]) > 1) {
                        EIP155Supported = true;
                    } else if (parseInt(splitVersion[1]) > 0) {
                        EIP155Supported = true;
                    } else if (parseInt(splitVersion[2]) > 2) {
                        EIP155Supported = true;
                    }
                    var oldTx = Object.assign(rawTx, {});
                    let input = oldTx.input;
                    rawTx.chainId = _CHAINID;
                    return uiFuncs.signed(app, rawTx, ledgerConfig, false, function (res) {
                        oldTx.r = res.r;
                        oldTx.s = res.s;
                        oldTx.v = res.v;
                        oldTx.input = input;
                        delete oldTx.isError;
                        delete oldTx.rawTx;
                        delete oldTx.signedTx;
                        web3.fsntx.sendRawTransaction(oldTx).then(function (txHash) {
                            $scope.makeSwapConfirmation("end");
                        });
                    });
                };
                $scope.notifier.info("Please, confirm transaction on Ledger.");
                await app.getAppConfiguration(localCallback);
            }
        }
    };

    $scope.recallModal = function (swap_id) {
        $scope.swapRecallSuccess = false;
        $scope.recallAssetModal.open();
        $scope.recallAssetId = swap_id;
    };

    $scope.recallSwap = async function (swap_id) {
        if (walletService.wallet !== null) {
            let password = walletService.password;
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;

            let data = {
                from: walletAddress,
                SwapID: swap_id
            };

            if (!$scope.account && $scope.wallet.hwType !== "ledger") {
                $scope.account = web3.eth.accounts.privateKeyToAccount(
                    $scope.toHexString($scope.wallet.getPrivateKey())
                );
            }

            try {
                await web3.fsntx.buildRecallSwapTx(data).then(function (tx) {
                    tx.from = walletAddress;
                    tx.chainId = _CHAINID;
                    data = tx;
                    if ($scope.wallet.hwType == "ledger") {
                        return;
                    }
                    return web3.fsn
                        .signAndTransmit(tx, $scope.account.signTransaction)
                        .then(txHash => {
                            console.log(txHash);
                            $scope.recallSwapSuccess.open();
                        });
                });
            } catch (err) {
                $scope.errorModal.open();
                console.log(err);
            }
            if ($scope.wallet.hwType == "ledger") {
                let ledgerConfig = {
                    privKey: $scope.wallet.privKey
                        ? $scope.wallet.getPrivateKeyString()
                        : "",
                    path: $scope.wallet.getPath(),
                    hwType: $scope.wallet.getHWType(),
                    hwTransport: $scope.wallet.getHWTransport()
                };
                let rawTx = data;
                var eTx = new ethUtil.Tx(rawTx);
                if (ledgerConfig.hwType == "ledger") {
                    var app = new ledgerEth(ledgerConfig.hwTransport);
                    var EIP155Supported = true;
                    var localCallback = async function (result, error) {
                        if (typeof error != "undefined") {
                            if (callback !== undefined)
                                callback({
                                    isError: true,
                                    error: error
                                });
                            return;
                        }
                        var splitVersion = result["version"].split(".");
                        if (parseInt(splitVersion[0]) > 1) {
                            EIP155Supported = true;
                        } else if (parseInt(splitVersion[1]) > 0) {
                            EIP155Supported = true;
                        } else if (parseInt(splitVersion[2]) > 2) {
                            EIP155Supported = true;
                        }
                        var oldTx = Object.assign(rawTx, {});
                        let input = oldTx.input;
                        rawTx.chainId = _CHAINID;
                        return uiFuncs.signed(app, rawTx, ledgerConfig, false, function (
                            res
                        ) {
                            oldTx.r = res.r;
                            oldTx.s = res.s;
                            oldTx.v = res.v;
                            oldTx.input = input;
                            delete oldTx.isError;
                            delete oldTx.rawTx;
                            delete oldTx.signedTx;
                            web3.fsntx.sendRawTransaction(oldTx).then(function (txHash) {
                                $scope.recallSwapSuccess.open();
                            });
                        });
                    };
                    $scope.notifier.info("Please, confirm transaction on Ledger.");
                    await app.getAppConfiguration(localCallback);
                }
            }
        }
    };

    $scope.processAllTarges = async function (targes, index) {
        if (index == targes.length) {
            return true;
        }
        let target = targes[index];
        if (target.length < 42) {
            await web3.fsn.getAddressByNotation(parseInt(target)).then(function (res) {
                if (res) {
                    targesArray.push(res);
                }
                return $scope.processAllTarges(targes, index + 1);
            });
        } else {
            targesArray.push(target);
            return $scope.processAllTarges(targes, index + 1);
        }
    };

    $scope.getAssetBalance = async function () {
        let asset = $scope.assetToSend;
        let accountData = uiFuncs.getTxData($scope);
        let walletAddress = accountData.from;
        let assetBalance = "";
        let decimals = "";
        let assetSymbol = "";
        await window.__fsnGetAsset(asset).then(function (res) {
            decimals = res["Decimals"];
            assetSymbol = res["Symbol"];
        });

        try {
            await web3.fsn.getBalance(asset, walletAddress).then(function (res) {
                assetBalance = res;
            });
        } catch (err) {
            console.log(err);
        }

        let decimalsBN = new window.BigNumber($scope.countDecimals(decimals).toString())
        let balanceBN = new window.BigNumber(assetBalance.toString());

        let balance = balanceBN.div(decimalsBN).toString();

        $scope.$apply(function () {
            $scope.selectedAssetBalance = balance;
            $scope.selectedAssetSymbol = assetSymbol;
        });
    };

    $scope.returnDateString = function (posixtime, position) {
        let time = new Date(parseInt(posixtime) * 1000);
        if (posixtime == 18446744073709552000 && position == "End") {
            return "Forever";
        }
        if (position == "Start") {
            if (posixtime == 0) {
                return "Now";
            }
            // if(posixtime < time && position == 'Start'){return 'Now';}
        }
        let tMonth = time.getUTCMonth();
        let tDay = time.getUTCDate();
        let tYear = time.getUTCFullYear();

        return $scope.months[tMonth] + " " + tDay + ", " + tYear;
    };

    let openMakesListRunning = false;
    $scope.openMakesList = async function () {
        let swapList = {};
        let openMakeListFront = [];

        if (openMakesListRunning) {
            window.log("Open Makes List already running!");
            return;
        }

        openMakesListRunning = true;

        if (walletService.wallet !== null) {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;

            try {
                await ajaxReq.http.get(`${window.getApiServer()}/swaps2/all?address=${walletAddress}&page=0&size=30`).then(function (r) {
                    let swaps = r.data;
                    for (let swap in swaps) {
                        let data = JSON.parse(swaps[swap].data);
                        swapList[data["SwapID"]] = data;
                        swapList[data["SwapID"]].size = swaps[swap].size
                    }
                });
            } catch (err) {
                console.log(err);
            }

            let allAssets = {};
            try {
                await window.__fsnGetAllAssets().then(function (res) {
                    allAssets = res;
                });
            } catch (err) {
                console.log(err);
            }

            for (let asset in swapList) {
                let id = swapList[asset]["ID"];
                let assetBalance = "";

                let fromAsset = allAssets[swapList[asset]["FromAssetID"]];
                let toAsset = allAssets[swapList[asset]["ToAssetID"]];
                let fromVerifiedImage = "";
                let fromHasImage = false;
                let fromVerified = false;

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["FromAssetID"]
                    ) {
                        // Set matched image name
                        fromVerifiedImage = window.verifiedAssetsImages[a].image;
                        fromHasImage = true;
                        fromVerified = true;
                    } else if (
                        swapList[asset]["FromAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        fromVerifiedImage = "";
                        fromHasImage = false;
                        fromVerified = true;
                    }
                }

                let toVerifiedImage = "";
                let toHasImage = false;
                let toVerified = false;

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["ToAssetID"]
                    ) {
                        // Set matched image name
                        toVerifiedImage = window.verifiedAssetsImages[a].image;
                        toHasImage = true;
                        toVerified = true;
                    } else if (
                        swapList[asset]["ToAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        toVerifiedImage = "";
                        toHasImage = false;
                        toVerified = true;
                    }
                }

                let fromAmount =
                    swapList[asset].MinFromAmount /
                    $scope.countDecimals(fromAsset.Decimals);

                let toAmount =
                    swapList[asset].MinToAmount / $scope.countDecimals(toAsset.Decimals);
                let swapRate = fromAmount / toAmount;
                let time = new Date(parseInt(swapList[asset]["Time"]) * 1000);

                let tMonth = time.getUTCMonth();
                let tDay = time.getUTCDate();
                let tYear = time.getUTCFullYear();

                let hours = time.getUTCHours();
                let minutes = time.getUTCMinutes();

                if (time.getUTCMinutes() < 10) {
                    minutes = "0" + time.getUTCMinutes();
                }
                // Global
                time = $scope.months[tMonth] + " " + tDay + ", " + tYear;
                let timeHours = hours + ":" + minutes;

                // Maker parts
                let minimumswap = fromAmount / parseInt(swapList[asset]["SwapSize"]);

                // Taker specific parts
                let swapratetaker = toAmount / fromAmount;
                let minimumswaptaker = fromAmount * swapratetaker;

                // Targes section

                let targes = "";

                swapList[asset]["Targes"].length > 0
                    ? (targes = "Private")
                    : (targes = "Public");

                // Receive TL

                let leftOver = parseInt(swapList[asset]["size"]) / parseInt(swapList[asset]["SwapSize"]);
                let leftOverBN = new window.BigNumber(leftOver.toString());

                // fromAmount
                let minFromAmountBN = new window.BigNumber(swapList[asset]["MinFromAmount"].toString());
                let fromAmountDec = $scope.countDecimals(fromAsset["Decimals"]);
                let minFromAmountDecimalsBN = new window.BigNumber(fromAmountDec.toString());
                let minFromAmountFormattedBN = minFromAmountBN.div(minFromAmountDecimalsBN);
                let minFromSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minFromMaxAmountBN = minFromAmountFormattedBN.times(minFromSwapSizeBN);
                let minFromAmountFinal = leftOverBN.times(minFromMaxAmountBN);

                // toAmount
                let minToAmountBN = new window.BigNumber(swapList[asset]["MinToAmount"].toString());
                let toAmountDec = $scope.countDecimals(toAsset["Decimals"]);
                let minToAmountDecimalsBN = new window.BigNumber(toAmountDec.toString());
                let minToAmountFormattedBN = minToAmountBN.div(minToAmountDecimalsBN);
                let minToSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minToMaxAmountBN = minToAmountFormattedBN.times(minToSwapSizeBN);
                let minToAmountFinal = leftOverBN.times(minToMaxAmountBN);

                let toAmountF = minToAmountFinal.toString();
                let fromAmountF = minFromAmountFinal.toString();

                let minimumswapopenmake =
                    fromAmountF / parseInt(swapList[asset]["size"]);

                let data = {
                    id: openMakeListFront.length,
                    swap_id: swapList[asset]["SwapID"],
                    fromAssetId: swapList[asset]["FromAssetID"],
                    fromAssetSymbol: fromAsset["Symbol"],
                    fromAmount: fromAmountF,
                    fromAmountCut: +minFromAmountFinal.toFixed(8),
                    toAssetId: swapList[asset]["ToAssetID"],
                    toAmount: toAmountF,
                    toAmountCut: +minToAmountFinal.toFixed(8),
                    toAssetSymbol: toAsset["Symbol"],
                    swaprate: swapRate,
                    maxswaps: swapList[asset]["SwapSize"],
                    swapratetaker: swapratetaker,
                    minswap: minimumswap,
                    minswaptaker: minimumswaptaker,
                    minswapopenmake: minimumswapopenmake,
                    time: time.toLocaleString(),
                    timePosix: swapList[asset]["Time"],
                    timeHours: timeHours,
                    targes: targes,
                    owner: swapList[asset]["Owner"],
                    owned: true,
                    FromEndTime: swapList[asset]["FromEndTime"],
                    FromStartTime: swapList[asset]["FromStartTime"],
                    FromEndTimeString: $scope.returnDateString(
                        swapList[asset]["FromEndTime"],
                        "End"
                    ),
                    FromStartTimeString: $scope.returnDateString(
                        swapList[asset]["FromStartTime"],
                        "Start"
                    ),
                    ToEndTime: swapList[asset]["ToEndTime"],
                    ToStartTime: swapList[asset]["ToStartTime"],
                    ToEndTimeString: $scope.returnDateString(
                        swapList[asset]["ToEndTime"],
                        "End"
                    ),
                    ToStartTimeString: $scope.returnDateString(
                        swapList[asset]["ToStartTime"],
                        "Start"
                    ),
                    fromVerifiedImage: fromVerifiedImage,
                    fromHasImage: fromHasImage,
                    fromVerified: fromVerified,
                    toVerifiedImage: toVerifiedImage,
                    toHasImage: toHasImage,
                    toVerified: toVerified
                };

                await openMakeListFront.push(data);

            }
        }

        $scope.$eval(function () {
            $scope.openMakes = openMakeListFront;
            $scope.openMakeSwaps = $scope.openMakes.length;
        });
        window.log("Finished retrieving all Open Swaps");
        openMakesListRunning = false;
    };

    // $scope.$watch('selectedSendContract', function () {
    //     $scope.allSwaps(0);
    //     $scope.allSwapsPage = 0;
    // })
    // $scope.$watch('selectedReceiveContract', function () {
    //     $scope.allSwaps(0);
    //     $scope.allSwapsPage = 0;
    // });


    $scope.closeAllOtherDropDowns = async function (input) {
        if (input === 'sendDropDown') {
            $scope.$eval(function () {
                $scope.sendDropDown2 = false;
                $scope.receiveDropDown = false;
                $scope.receiveDropDown2 = false;
            });
            return;
        }
        if (input === 'sendDropDown2') {
            $scope.$eval(function () {
                $scope.sendDropDown = false;
                $scope.receiveDropDown = false;
                $scope.receiveDropDown2 = false;
            });
            return;
        }
        if (input === 'receiveDropDown') {
            $scope.$eval(function () {
                $scope.sendDropDown = false;
                $scope.sendDropDown2 = false;
                $scope.receiveDropDown2 = false;
            });
            return;
        }
        if (input === 'receiveDropDown2') {
            $scope.$eval(function () {
                $scope.sendDropDown = false;
                $scope.sendDropDown2 = false;
                $scope.receiveDropDown = false;
            });
            return;
        }
    };
    $scope.$watchGroup(['sendDropDown', 'sendDropDown2', 'receiveDropDown', 'receiveDropDown2'], function () {
        $scope.$eval(function () {
            $scope.searchSendAsset = '';
            $scope.searchReceiveAsset = '';
        });
    });


    let swapList = {};
    $scope.allSwapsRunning = false;
    $scope.allSwaps = async function (page) {
        if (!page) page = 0;
        if (walletService.wallet !== null) {
            if ($scope.allSwapsRunning) {
                window.log(`allSwaps already running!`);
                return;
            }

            $scope.swapsList = [];
            let swapList = [];
            let swapListFront = [];

            $scope.allSwapsRunning = true;
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;
            let size = 10;

            let url = `${window.getApiServer()}/swaps2/all?page=${page}&size=${size}&sort=asc&toAsset=${$scope.selectedSendContract}&fromAsset=${$scope.selectedReceiveContract}`

            if ($scope.selectedReceiveAsset == 'All Assets') {
                url = `${window.getApiServer()}/swaps2/all?page=${page}&size=${size}&sort=asc&toAsset=${$scope.selectedSendContract}`
            }

            if ($scope.selectedSendAsset == 'All Assets' && $scope.selectedReceiveAsset == 'All Assets') {
                url = `${window.getApiServer()}/swaps2/all?page=${page}&size=${size}&sort=asc`
            }
            if ($scope.selectedSendContract == '-' && $scope.selectedReceiveContract == '-') {
                url = `${window.getApiServer()}/swaps2/all?page=${page}&size=${size}&sort=asc`
            }

            console.log(url);

            try {
                await ajaxReq.http.get(url).then(function (r) {
                    console.log(r.data)
                    for (let swap in r.data) {
                        let data = JSON.parse(r.data[swap].data);
                        swapList[data.SwapID] = data;
                        swapList[data.SwapID].size = r.data[swap].size;
                    }
                });
            } catch (err) {
                console.log(err);
            }

            let allAssets = {};
            try {
                await window.__fsnGetAllAssets().then(function (res) {
                    allAssets = res;
                });
            } catch (err) {
                console.log(err);
            }

            for (let asset in swapList) {
                let id = swapList[asset]["ID"];
                let owner = swapList[asset]["Owner"];
                console.log(swapList[asset]);
                console.log(owner);
                let owned = false;
                let assetBalance = "";

                let fromAsset = allAssets[swapList[asset]["FromAssetID"]];
                console.log(fromAsset);
                let toAsset = allAssets[swapList[asset]["ToAssetID"]];
                let fromVerifiedImage = "";
                let fromHasImage = false;
                let fromVerified = false;


                // If Make Swap is USAN
                if (fromAsset.AssetID == "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe") {
                    try {
                        await ajaxReq.http.get(`${window.getApiServer()}/swaps/${swapList[asset]["SwapID"]}`).then(function (r) {
                            console.log(r.data)
                            owner = r.data[0].fromAddress;
                        });
                    } catch (err) {
                        console.log(err);
                    }

                    let USAN = await web3.fsn.getNotation(owner);
                    fromAsset.Symbol = `${USAN} USAN`;
                    fromAsset.Name = USAN;
                }

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["FromAssetID"]
                    ) {
                        // Set matched image name
                        fromVerifiedImage = window.verifiedAssetsImages[a].image;
                        fromHasImage = true;
                        fromVerified = true;
                    } else if (
                        swapList[asset]["FromAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        fromVerifiedImage = "";
                        fromHasImage = false;
                        fromVerified = true;
                    }
                }

                let toVerifiedImage = "";
                let toHasImage = false;
                let toVerified = false;

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["ToAssetID"]
                    ) {
                        // Set matched image name
                        toVerifiedImage = window.verifiedAssetsImages[a].image;
                        toHasImage = true;
                        toVerified = true;
                    } else if (
                        swapList[asset]["ToAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        toVerifiedImage = "";
                        toHasImage = false;
                        toVerified = true;
                    }
                }

                owner === walletAddress ? (owned = true) : (owned = false);

                let fromAmount =
                    swapList[asset].MinFromAmount /
                    $scope.countDecimals(fromAsset.Decimals);

                let toAmount =
                    swapList[asset].MinToAmount / $scope.countDecimals(toAsset.Decimals);
                let swapRate = fromAmount / toAmount;
                let time = new Date(parseInt(swapList[asset]["Time"]) * 1000);

                let tMonth = time.getUTCMonth();
                let tDay = time.getUTCDate();
                let tYear = time.getUTCFullYear();

                let hours = time.getUTCHours();
                let minutes = time.getUTCMinutes();

                if (time.getUTCMinutes() < 10) {
                    minutes = "0" + time.getUTCMinutes();
                }
                // Global
                time = $scope.months[tMonth] + " " + tDay + ", " + tYear;
                let timeHours = hours + ":" + minutes;

                // Maker parts
                let minimumswap = fromAmount / parseInt(swapList[asset]["SwapSize"]);

                // Taker specific parts
                let swapratetaker = toAmount / fromAmount;
                let minimumswaptaker = fromAmount * swapratetaker;

                // Targes section

                let targes = "";

                swapList[asset]["Targes"].length > 0
                    ? (targes = "Private")
                    : (targes = "Public");

                // Receive TL

                let leftOver = parseInt(swapList[asset]["size"]) / parseInt(swapList[asset]["SwapSize"]);
                let leftOverBN = new window.BigNumber(leftOver.toString());

                // fromAmount
                let minFromAmountBN = new window.BigNumber(swapList[asset]["MinFromAmount"].toString());
                let fromAmountDec = $scope.countDecimals(fromAsset["Decimals"]);
                let minFromAmountDecimalsBN = new window.BigNumber(fromAmountDec.toString());
                let minFromAmountFormattedBN = minFromAmountBN.div(minFromAmountDecimalsBN);
                let minFromSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minFromMaxAmountBN = minFromAmountFormattedBN.times(minFromSwapSizeBN);
                let minFromAmountFinal = leftOverBN.times(minFromMaxAmountBN);

                // toAmount
                let minToAmountBN = new window.BigNumber(swapList[asset]["MinToAmount"].toString());
                let toAmountDec = $scope.countDecimals(toAsset["Decimals"]);
                let minToAmountDecimalsBN = new window.BigNumber(toAmountDec.toString());
                let minToAmountFormattedBN = minToAmountBN.div(minToAmountDecimalsBN);
                let minToSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minToMaxAmountBN = minToAmountFormattedBN.times(minToSwapSizeBN);
                let minToAmountFinal = leftOverBN.times(minToMaxAmountBN);

                let toAmountF = minToAmountFinal.toString();
                let fromAmountF = minFromAmountFinal.toString();

                let minimumswapopenmake =
                    fromAmountF / parseInt(swapList[asset]["SwapSize"]);

                let data = {
                    id: swapListFront.length,
                    swap_id: swapList[asset]["SwapID"],
                    fromAssetId: swapList[asset]["FromAssetID"],
                    fromAssetSymbol: fromAsset["Symbol"],
                    fromAmount: fromAmountF,
                    fromAmountCut: +minFromAmountFinal.toFixed(8),
                    toAssetId: swapList[asset]["ToAssetID"],
                    toAmount: toAmountF,
                    toAmountCut: +minToAmountFinal.toFixed(8),
                    toAssetSymbol: toAsset["Symbol"],
                    swaprate: swapRate,
                    maxswaps: swapList[asset]["SwapSize"],
                    swapratetaker: swapratetaker,
                    minswap: minimumswap,
                    size: swapList[asset]["size"],
                    minswaptaker: minimumswaptaker,
                    minswapopenmake: minimumswapopenmake,
                    time: time.toLocaleString(),
                    timePosix: swapList[asset]["Time"],
                    timeHours: timeHours,
                    targes: targes,
                    owner: swapList[asset]["Owner"],
                    owned: owned,
                    FromEndTime: swapList[asset]["FromEndTime"],
                    FromStartTime: swapList[asset]["FromStartTime"],
                    FromEndTimeString: $scope.returnDateString(
                        swapList[asset]["FromEndTime"],
                        "End"
                    ),
                    FromStartTimeString: $scope.returnDateString(
                        swapList[asset]["FromStartTime"],
                        "Start"
                    ),
                    ToEndTime: swapList[asset]["ToEndTime"],
                    ToStartTime: swapList[asset]["ToStartTime"],
                    ToEndTimeString: $scope.returnDateString(
                        swapList[asset]["ToEndTime"],
                        "End"
                    ),
                    ToStartTimeString: $scope.returnDateString(
                        swapList[asset]["ToStartTime"],
                        "Start"
                    ),
                    fromVerifiedImage: fromVerifiedImage,
                    fromHasImage: fromHasImage,
                    fromVerified: fromVerified,
                    toVerifiedImage: toVerifiedImage,
                    toHasImage: toHasImage,
                    toVerified: toVerified
                };
                if (walletAddress !== swapList[asset]["Owner"] && !targesArray.includes(walletAddress)) {
                    await swapListFront.push(data);
                }
            }
            $scope.$eval(function () {
                $scope.swapsList = swapListFront;
                $scope.showLoader = false;
            });
            console.log($scope.swapsList);
            $scope.allSwapsRunning = false;
            window.log("Finished retrieving all Swaps");
        }
    };

    let takeSwapListRunning = false;
    $scope.takeSwapList = async function () {
        window.log("Starting retrieval of Private Swaps");
        if (takeSwapListRunning) {
            window.log("Private Swaps already running");
            return;
        }
        let swapList = {};
        takeSwapListRunning = true;

        $scope.openTakeSwapsTotal = 0;
        let openTakesList = [];
        if (walletService.wallet !== null) {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;

            try {
                await ajaxReq.http.get(`${window.getApiServer()}/swaps2/all?target=${walletAddress}&page0&size=100`).then(function (r) {
                    for (let swap in r.data) {
                        let data = JSON.parse(r.data[swap].data);
                        swapList[data.SwapID] = data;
                        swapList[data.SwapID].size = r.data[swap].size;
                    }
                });
            } catch (err) {
                console.log(err);
            }

            let allAssets = {};
            try {
                await window.__fsnGetAllAssets().then(function (res) {
                    allAssets = res;
                });
            } catch (err) {
                console.log(err);
            }
            let i = 0;

            for (let asset in swapList) {
                let id = swapList[asset]["ID"];
                let owner = swapList[asset]["Owner"];
                let owned = false;
                let assetBalance = "";

                let fromAsset = allAssets[swapList[asset]["FromAssetID"]];
                let toAsset = allAssets[swapList[asset]["ToAssetID"]];
                let fromVerifiedImage = "";
                let fromHasImage = false;
                let fromVerified = false;

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["FromAssetID"]
                    ) {
                        // Set matched image name
                        fromVerifiedImage = window.verifiedAssetsImages[a].image;
                        fromHasImage = true;
                        fromVerified = true;
                    } else if (
                        swapList[asset]["FromAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        fromVerifiedImage = "";
                        fromHasImage = false;
                        fromVerified = true;
                    }
                }

                let toVerifiedImage = "";
                let toHasImage = false;
                let toVerified = false;

                for (let a in window.verifiedAssetsImages) {
                    if (
                        window.verifiedAssetsImages[a].assetID ==
                        swapList[asset]["ToAssetID"]
                    ) {
                        // Set matched image name
                        toVerifiedImage = window.verifiedAssetsImages[a].image;
                        toHasImage = true;
                        toVerified = true;
                    } else if (
                        swapList[asset]["ToAssetID"] ==
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ) {
                        // Set matched image name
                        toVerifiedImage = "";
                        toHasImage = false;
                        toVerified = true;
                    }
                }

                owner === walletAddress ? (owned = true) : (owned = false);

                let fromAmount =
                    swapList[asset].MinFromAmount /
                    $scope.countDecimals(fromAsset.Decimals);

                let toAmount =
                    swapList[asset].MinToAmount / $scope.countDecimals(toAsset.Decimals);
                let swapRate = fromAmount / toAmount;
                let time = new Date(parseInt(swapList[asset]["Time"]) * 1000);

                let tMonth = time.getUTCMonth();
                let tDay = time.getUTCDate();
                let tYear = time.getUTCFullYear();

                let hours = time.getUTCHours();
                let minutes = time.getUTCMinutes();

                if (time.getUTCMinutes() < 10) {
                    minutes = "0" + time.getUTCMinutes();
                }
                // Global
                time = $scope.months[tMonth] + " " + tDay + ", " + tYear;
                let timeHours = hours + ":" + minutes;

                // Maker parts
                let minimumswap = fromAmount / parseInt(swapList[asset]["SwapSize"]);

                // Taker specific parts
                let swapratetaker = toAmount / fromAmount;
                let minimumswaptaker = fromAmount * swapratetaker;

                // Targes section

                let targes = "";

                swapList[asset]["Targes"].length > 0
                    ? (targes = "Private")
                    : (targes = "Public");

                // Receive TL

                let leftOver = parseInt(swapList[asset]["size"]) / parseInt(swapList[asset]["SwapSize"]);
                let leftOverBN = new window.BigNumber(leftOver.toString());

                // fromAmount
                let minFromAmountBN = new window.BigNumber(swapList[asset]["MinFromAmount"].toString());
                let fromAmountDec = $scope.countDecimals(fromAsset["Decimals"]);
                let minFromAmountDecimalsBN = new window.BigNumber(fromAmountDec.toString());
                let minFromAmountFormattedBN = minFromAmountBN.div(minFromAmountDecimalsBN);
                let minFromSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minFromMaxAmountBN = minFromAmountFormattedBN.times(minFromSwapSizeBN);
                let minFromAmountFinal = leftOverBN.times(minFromMaxAmountBN);

                // toAmount
                let minToAmountBN = new window.BigNumber(swapList[asset]["MinToAmount"].toString());
                let toAmountDec = $scope.countDecimals(toAsset["Decimals"]);
                let minToAmountDecimalsBN = new window.BigNumber(toAmountDec.toString());
                let minToAmountFormattedBN = minToAmountBN.div(minToAmountDecimalsBN);
                let minToSwapSizeBN = new window.BigNumber(swapList[asset]["SwapSize"]);
                let minToMaxAmountBN = minToAmountFormattedBN.times(minToSwapSizeBN);
                let minToAmountFinal = leftOverBN.times(minToMaxAmountBN);

                let toAmountF = minToAmountFinal.toString();
                let fromAmountF = minFromAmountFinal.toString();

                let minimumswapopenmake =
                    fromAmountF / parseInt(swapList[asset]["SwapSize"]);

                let data = {
                    id: i,
                    swap_id: swapList[asset]["SwapID"],
                    fromAssetId: swapList[asset]["FromAssetID"],
                    fromAssetSymbol: fromAsset["Symbol"],
                    fromAmount: fromAmountF,
                    fromAmountCut: +minFromAmountFinal.toFixed(8),
                    toAssetId: swapList[asset]["ToAssetID"],
                    toAmount: toAmountF,
                    toAmountCut: +minToAmountFinal.toFixed(8),
                    toAssetSymbol: toAsset["Symbol"],
                    swaprate: swapRate,
                    maxswaps: swapList[asset]["SwapSize"],
                    swapratetaker: swapratetaker,
                    minswap: minimumswap,
                    minswaptaker: minimumswaptaker,
                    minswapopenmake: minimumswapopenmake,
                    time: time.toLocaleString(),
                    size: swapList[asset]["size"],
                    timePosix: swapList[asset]["Time"],
                    timeHours: timeHours,
                    targes: targes,
                    owner: swapList[asset]["Owner"],
                    owned: owned,
                    FromEndTime: swapList[asset]["FromEndTime"],
                    FromStartTime: swapList[asset]["FromStartTime"],
                    FromEndTimeString: $scope.returnDateString(
                        swapList[asset]["FromEndTime"],
                        "End"
                    ),
                    FromStartTimeString: $scope.returnDateString(
                        swapList[asset]["FromStartTime"],
                        "Start"
                    ),
                    ToEndTime: swapList[asset]["ToEndTime"],
                    ToStartTime: swapList[asset]["ToStartTime"],
                    ToEndTimeString: $scope.returnDateString(
                        swapList[asset]["ToEndTime"],
                        "End"
                    ),
                    ToStartTimeString: $scope.returnDateString(
                        swapList[asset]["ToStartTime"],
                        "Start"
                    ),
                    fromVerifiedImage: fromVerifiedImage,
                    fromHasImage: fromHasImage,
                    fromVerified: fromVerified,
                    toVerifiedImage: toVerifiedImage,
                    toHasImage: toHasImage,
                    toVerified: toVerified
                };
                if (swapList[asset]["Targes"].includes(walletAddress)) {
                    await openTakesList.push(data);
                    i++;
                    $scope.openTakeSwapsTotal++;
                }
            }
        }

        $scope.$eval(function () {
            $scope.openTakeSwaps = openTakesList;
            $scope.openTakeSwapsTotal = $scope.openTakeSwapsTotal;
        })
        takeSwapListRunning = false;
    }


    $scope.getBalance = async function () {
        if (($scope.mayRunState = true)) {
            let accountData = uiFuncs.getTxData($scope);
            let walletAddress = accountData.from;
            let balance = await web3.fsn.getBalance(
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
                walletAddress
            );

            balance = balance / $scope.countDecimals(18);
            $scope.$eval(function () {
                $scope.web3WalletBalance = balance;
                $scope.web3WalletBalance = balance;
            });
        }
    };
};
module.exports = ensCtrl;
