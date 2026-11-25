// Auto-generated from /contracts/*.sol using solc (EVM paris, optimizer 200, viaIR)
// Do not edit manually; regenerate via: node scripts/compile-artifacts.mjs

export interface CompiledContractArtifact {
  abi: readonly Record<string, unknown>[];
  bytecode: `0x${string}`;
}

export const CONTRACT_ARTIFACTS = {
  "WrappedNative": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name_",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol_",
            "type": "string"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "wad",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      }
    ],
    "bytecode": "0x60806040523461033e57610c068038038061001981610343565b92833981019060408183031261033e5780516001600160401b03811161033e5782610045918301610368565b60208201519092906001600160401b03811161033e576100659201610368565b81516001600160401b03811161023c57600354600181811c91168015610334575b602082101461021c57601f81116102c2575b50602092601f821160011461025d5792819293600092610252575b50508160011b916000199060031b1c1916176003555b80516001600160401b03811161023c57600454600181811c91168015610232575b602082101461021c57601f81116101aa575b50602091601f82116001146101465791819260009261013b575b50508160011b916000199060031b1c1916176004555b60405161083290816103d48239f35b015190503880610116565b601f198216926004600052806000209160005b85811061019257508360019510610179575b505050811b0160045561012c565b015160001960f88460031b161c1916905538808061016b565b91926020600181928685015181550194019201610159565b818111156100fc576004600052601f820160051c7f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b60208410610213575b81601f9101920160051c039060005b8281106102055750506100fc565b6000828201556001016101f7565b600091506101e8565b634e487b7160e01b600052602260045260246000fd5b90607f16906100ea565b634e487b7160e01b600052604160045260246000fd5b0151905038806100b3565b601f198216936003600052806000209160005b8681106102aa5750836001959610610291575b505050811b016003556100c9565b015160001960f88460031b161c19169055388080610283565b91926020600181928685015181550194019201610270565b81811115610098576003600052601f820160051c7fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b6020841061032b575b81601f9101920160051c039060005b82811061031d575050610098565b60008282015560010161030f565b60009150610300565b90607f1690610086565b600080fd5b6040519190601f01601f191682016001600160401b0381118382101761023c57604052565b81601f8201121561033e578051906001600160401b03821161023c57610397601f8301601f1916602001610343565b928284526020838301011161033e5760005b8281106103be57505060206000918301015290565b806020809284010151828287010152016103a956fe60808060405260033611610024575b50361561001a57600080fd5b6100226106df565b005b60003560e01c90816306fdde031461057657508063095ea7b3146104f057806318160ddd146104d257806323b872dd146103e55780632e1a7d4d146102a3578063313ce5671461028757806370a082311461024d57806395d89b4114610145578063a9059cbb14610114578063d0e30db0146101005763dd62ed3e146100aa573861000e565b346100fb5760403660031901126100fb576100c361067b565b6100cb610691565b6001600160a01b039182166000908152600160209081526040808320949093168252928352819020549051908152f35b600080fd5b60003660031901126100fb576100226106df565b346100fb5760403660031901126100fb5761013a61013061067b565b6024359033610763565b602060405160018152f35b346100fb5760003660031901126100fb5760405160006004548060011c90600181168015610243575b60208310811461022f5782855290811561020b57506001146101ab575b6101a78361019b818503826106a7565b60405191829182610632565b0390f35b91905060046000527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b916000905b8082106101f15750909150810160200161019b61018b565b9192600181602092548385880101520191019092916101d9565b60ff191660208086019190915291151560051b8401909101915061019b905061018b565b634e487b7160e01b84526022600452602484fd5b91607f169161016e565b346100fb5760203660031901126100fb576001600160a01b0361026e61067b565b1660005260006020526020604060002054604051908152f35b346100fb5760003660031901126100fb57602060405160128152f35b346100fb5760203660031901126100fb5760043533156103cf5760003381528060205260408120548281106103b55781808481958294338452836020520360408320558060025403600255816040518281527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60203392a3335af13d156103b0573d67ffffffffffffffff811161039c576040519061034c601f8201601f1916602001836106a7565b81528260203d92013e5b1561035e5780f35b60405162461bcd60e51b815260206004820152601660248201527513905512559157d514905394d1915497d1905253115160521b6044820152606490fd5b634e487b7160e01b83526041600452602483fd5b610356565b9160649263391434e360e21b835233600452602452604452fd5b634b637e8f60e11b600052600060045260246000fd5b346100fb5760603660031901126100fb576103fe61067b565b610406610691565b6001600160a01b0382166000818152600160209081526040808320338452909152902054909260443592916000198110610446575b5061013a9350610763565b8381106104b557841561049f5733156104895761013a946000526001602052604060002060018060a01b033316600052602052836040600020910390558461043b565b634a1406b160e11b600052600060045260246000fd5b63e602df0560e01b600052600060045260246000fd5b8390637dc7a0d960e11b6000523360045260245260445260646000fd5b346100fb5760003660031901126100fb576020600254604051908152f35b346100fb5760403660031901126100fb5761050961067b565b60243590331561049f576001600160a01b031690811561048957336000526001602052604060002082600052602052806040600020556040519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560203392a3602060405160018152f35b346100fb5760003660031901126100fb5760006003548060011c90600181168015610628575b60208310811461022f5782855290811561020b57506001146105c8576101a78361019b818503826106a7565b91905060036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b916000905b80821061060e5750909150810160200161019b61018b565b9192600181602092548385880101520191019092916105f6565b91607f169161059c565b91909160208152825180602083015260005b818110610665575060409293506000838284010152601f8019910116010190565b8060208092870101516040828601015201610644565b600435906001600160a01b03821682036100fb57565b602435906001600160a01b03821682036100fb57565b90601f8019910116810190811067ffffffffffffffff8211176106c957604052565b634e487b7160e01b600052604160045260246000fd5b331561074d576002543481018091116107375760025560003381528060205260408120348154019055604051903482527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60203393a3565b634e487b7160e01b600052601160045260246000fd5b63ec442f0560e01b600052600060045260246000fd5b6001600160a01b03169081156103cf576001600160a01b031691821561074d5760008281528060205260408120548281106107e25791604082827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef958760209652828652038282205586815280845220818154019055604051908152a3565b916064928463391434e360e21b8452600452602452604452fdfea2646970667358221220f32157240e4d1b52855e7431c6ff5d49deda8203864c951c63365d4b53d04ab164736f6c63430008270033"
  },
  "MockERC20": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "name_",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol_",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimals_",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "initialSupply",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60a0604052346103ea57610b9680380380610019816103ef565b9283398101906080818303126103ea5780516001600160401b0381116103ea5782610045918301610414565b602082015190926001600160401b0382116103ea57610065918301610414565b9060408101519060ff821682036103ea576060015183519091906001600160401b0381116102e657600354600181811c911680156103e0575b60208210146102c657601f811161036e575b50602094601f8211600114610307579481929394956000926102fc575b50508160011b916000199060031b1c1916176003555b82516001600160401b0381116102e657600454600181811c911680156102dc575b60208210146102c657601f8111610254575b506020601f82116001146101ed57819293946000926101e2575b50508160011b916000199060031b1c1916176004555b60805233156101cc576002548181018091116101b657600255600033815280602052604081208281540190556040519182527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60203393a360405161071690816104808239608051816103340152f35b634e487b7160e01b600052601160045260246000fd5b63ec442f0560e01b600052600060045260246000fd5b015190503880610130565b601f198216906004600052806000209160005b81811061023c57509583600195969710610223575b505050811b01600455610146565b015160001960f88460031b161c19169055388080610215565b9192602060018192868b015181550194019201610200565b81811115610116576004600052601f820160051c7f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b602084106102bd575b81601f9101920160051c039060005b8281106102af575050610116565b6000828201556001016102a1565b60009150610292565b634e487b7160e01b600052602260045260246000fd5b90607f1690610104565b634e487b7160e01b600052604160045260246000fd5b0151905038806100cd565b601f198216956003600052806000209160005b8881106103565750836001959697981061033d575b505050811b016003556100e3565b015160001960f88460031b161c1916905538808061032f565b9192602060018192868501518155019401920161031a565b818111156100b0576003600052601f820160051c7fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b602084106103d7575b81601f9101920160051c039060005b8281106103c95750506100b0565b6000828201556001016103bb565b600091506103ac565b90607f169061009e565b600080fd5b6040519190601f01601f191682016001600160401b038111838210176102e657604052565b81601f820112156103ea578051906001600160401b0382116102e657610443601f8301601f19166020016103ef565b92828452602083830101116103ea5760005b82811061046a57505060206000918301015290565b8060208092840101518282870101520161045556fe6080806040526003361161001257600080fd5b60003560e01c90816306fdde03146104e957508063095ea7b31461046357806318160ddd1461044557806323b872dd14610358578063313ce5671461031a57806340c10f191461026e57806370a082311461023457806395d89b4114610113578063a9059cbb146100e25763dd62ed3e1461008c57600080fd5b346100dd5760403660031901126100dd576100a5610605565b6100ad61061b565b6001600160a01b039182166000908152600160209081526040808320949093168252928352819020549051908152f35b600080fd5b346100dd5760403660031901126100dd576101086100fe610605565b6024359033610631565b602060405160018152f35b346100dd5760003660031901126100dd5760405160006004548060011c9060018116801561022a575b602083108114610216578285529081156101fa57506001146101a3575b50819003601f01601f191681019067ffffffffffffffff82118183101761018d57610189829182604052826105bc565b0390f35b634e487b7160e01b600052604160045260246000fd5b905060046000527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b6000905b8282106101e457506020915082010182610159565b60018160209254838588010152019101906101cf565b90506020925060ff191682840152151560051b82010182610159565b634e487b7160e01b84526022600452602484fd5b91607f169161013c565b346100dd5760203660031901126100dd576001600160a01b03610255610605565b1660005260006020526020604060002054604051908152f35b346100dd5760403660031901126100dd57610287610605565b602435906001600160a01b0316801561030457600254918083018093116102ee576020926002557fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef600093849284845283825260408420818154019055604051908152a380f35b634e487b7160e01b600052601160045260246000fd5b63ec442f0560e01b600052600060045260246000fd5b346100dd5760003660031901126100dd57602060405160ff7f0000000000000000000000000000000000000000000000000000000000000000168152f35b346100dd5760603660031901126100dd57610371610605565b61037961061b565b6001600160a01b03821660008181526001602090815260408083203384529091529020549092604435929160001981106103b9575b506101089350610631565b8381106104285784156104125733156103fc57610108946000526001602052604060002060018060a01b03331660005260205283604060002091039055846103ae565b634a1406b160e11b600052600060045260246000fd5b63e602df0560e01b600052600060045260246000fd5b8390637dc7a0d960e11b6000523360045260245260445260646000fd5b346100dd5760003660031901126100dd576020600254604051908152f35b346100dd5760403660031901126100dd5761047c610605565b602435903315610412576001600160a01b03169081156103fc57336000526001602052604060002082600052602052806040600020556040519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560203392a3602060405160018152f35b346100dd5760003660031901126100dd5760006003548060011c906001811680156105b2575b602083108114610216578285529081156101fa575060011461055b5750819003601f01601f191681019067ffffffffffffffff82118183101761018d57610189829182604052826105bc565b905060036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b6000905b82821061059c57506020915082010182610159565b6001816020925483858801015201910190610587565b91607f169161050f565b91909160208152825180602083015260005b8181106105ef575060409293506000838284010152601f8019910116010190565b80602080928701015160408286010152016105ce565b600435906001600160a01b03821682036100dd57565b602435906001600160a01b03821682036100dd57565b6001600160a01b03169081156106ca576001600160a01b03169182156103045760008281528060205260408120548281106106b05791604082827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef958760209652828652038282205586815280845220818154019055604051908152a3565b916064928463391434e360e21b8452600452602452604452fd5b634b637e8f60e11b600052600060045260246000fdfea26469706673582212208aa1614213df3293d857def024eb4191ad9f2be49c04745632abbb0152924b8164736f6c63430008270033"
  },
  "TataSwapFeeManager": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "initialOwner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "initialSwapFeeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "initialProtocolFeeBps",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "requestedBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxBps",
            "type": "uint256"
          }
        ],
        "name": "FeeExceedsMaxCap",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "protocolBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "swapBps",
            "type": "uint256"
          }
        ],
        "name": "ProtocolFeeExceedsSwapFee",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousReceiver",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newReceiver",
            "type": "address"
          }
        ],
        "name": "ProtocolFeeReceiverUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newSwapFeeBps",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newProtocolFeeBps",
            "type": "uint256"
          }
        ],
        "name": "SwapFeeUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "BPS_DENOMINATOR",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MAX_TOTAL_FEE_BPS",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "protocolFeeBps",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "protocolFeeReceiver",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newReceiver",
            "type": "address"
          }
        ],
        "name": "setProtocolFeeReceiver",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "newSwapFeeBps",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "newProtocolFeeBps",
            "type": "uint256"
          }
        ],
        "name": "setSwapFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "swapFeeBps",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x6080346101b257601f61077238819003918201601f19168301916001600160401b038311848410176101b7578084926080946040528339810103126101b257610047816101cd565b610053602083016101cd565b6040830151606090930151916001600160a01b0316801561019c57600180546001600160a01b031990811690915560008054918216831781556001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a36001600160a01b031691821561018b57606481116101725780821161015a57916040917fc8273cce54f5cf71712dee009c7e6438ae7e1db578da0ec076cf360af45501b9938260018060a01b03196002541617600255806003558160045583519260007ffb5b90d81126d568c8bdaa0398ba8a708fd01e26c7891e91fa88e96051985ce38180a382526020820152a160405161059090816101e28239f35b90632cd1e23d60e01b60005260045260245260446000fd5b637af8febb60e11b600052600452606460245260446000fd5b63d92e233d60e01b60005260046000fd5b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101b25756fe6080806040526003361161001257600080fd5b60003560e01c9081632ffdaf891461052b5750806335659fb81461050d57806339a51be5146104e45780633f4ba83a14610473578063431a9caa1461045757806346877b1a146103ce57806359acbe4e146103355780635c975abb1461030f578063715018a6146102aa57806379ba5097146102215780638456cb59146101ab5780638da5cb5b14610182578063e1a4521814610165578063e30c39781461013c5763f2fde38b146100c357600080fd5b34610137576020366003190112610137576004356001600160a01b03811690819003610137576100f1610546565b600180546001600160a01b03191682179055600080546001600160a01b0316907f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e227009080a3005b600080fd5b34610137576000366003190112610137576001546040516001600160a01b039091168152602090f35b346101375760003660031901126101375760206040516127108152f35b34610137576000366003190112610137576000546040516001600160a01b039091168152602090f35b34610137576000366003190112610137576101c4610546565b60015460ff8160a01c166102105760ff60a01b1916600160a01b176001556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b63d93c066560e01b60005260046000fd5b3461013757600036600319011261013757600154336001600160a01b039091160361029557600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b34610137576000366003190112610137576102c3610546565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b3461013757600036600319011261013757602060ff60015460a01c166040519015158152f35b3461013757604036600319011261013757600435602435610354610546565b606482116103b45781811161039d57816040917fc8273cce54f5cf71712dee009c7e6438ae7e1db578da0ec076cf360af45501b9936003558060045582519182526020820152a1005b632cd1e23d60e01b60005260045260245260446000fd5b50637af8febb60e11b600052600452606460245260446000fd5b34610137576020366003190112610137576004356001600160a01b03811690819003610137576103fc610546565b801561044657600280546001600160a01b0319811683179091556001600160a01b03167ffb5b90d81126d568c8bdaa0398ba8a708fd01e26c7891e91fa88e96051985ce3600080a3005b63d92e233d60e01b60005260046000fd5b3461013757600036600319011261013757602060405160648152f35b346101375760003660031901126101375761048c610546565b60015460ff8160a01c16156104d35760ff60a01b19166001556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b638dfc202b60e01b60005260046000fd5b34610137576000366003190112610137576002546040516001600160a01b039091168152602090f35b34610137576000366003190112610137576020600454604051908152f35b34610137576000366003190112610137576020906003548152f35b6000546001600160a01b031633036102955756fea264697066735822122029f6b10795d932ceb9d63e08c343d74f7ad68befc01c208740c7d082f9cee6ef64736f6c63430008270033"
  },
  "TataSwapFactory": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "initialOwner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_feeManager",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "IdenticalAddresses",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "PairExists",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "token1",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "pair",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "pairCount",
            "type": "uint256"
          }
        ],
        "name": "PairCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "allPairs",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "allPairsLength",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          }
        ],
        "name": "createPair",
        "outputs": [
          {
            "internalType": "address",
            "name": "pair",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeManager",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "getPair",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60a03461010a57601f61288938819003918201601f19168301916001600160401b0383118484101761010f57808492604094855283398101031261010a57610052602061004b83610125565b9201610125565b6001600160a01b039091169081156100f457600180546001600160a01b0319908116909155600080549182168417815560405193916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a36001600160a01b038116156100e35760805261274f908161013a82396080518181816101b101526103030152f35b63d92e233d60e01b60005260046000fd5b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b038216820361010a5756fe60806040526003361161001157600080fd5b6000803560e01c80631e3dd18b146106be5780633f4ba83a1461064e578063574f2ba3146106305780635c975abb1461060a578063715018a6146105a557806379ba5097146105205780638456cb59146104bd5780638da5cb5b14610496578063c9c65396146101e0578063d0fb02031461019b578063e30c397814610172578063e6a439051461011a5763f2fde38b146100ab57600080fd5b34610117576020366003190112610117576100c4610733565b6100cc61079c565b600180546001600160a01b0319166001600160a01b0392831690811790915582549091167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e227008380a380f35b80fd5b5034610117576040366003190112610117576040610136610733565b9161013f61074e565b6001600160a01b039384168252600260209081529290912090831660009081529082526040908190205490519216825290f35b50346101175780600319360112610117576001546040516001600160a01b039091168152602090f35b50346101175780600319360112610117576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b5034610117576040366003190112610117576101fa610733565b61020261074e565b9061020b6107c5565b6001600160a01b0382811690821680821461048757101561048257905b6001600160a01b038216918215610473578284526002602090815260408086206001600160a01b038581168852925285205416610464576040516bffffffffffffffffffffffff19606092831b8116602083019081529284901b166034820152602881526001600160a01b03909216916102a3604882610764565b519020604051611f348082019082821067ffffffffffffffff831117610450579082916107e68339039085f58015610445576001600160a01b031691823b156104415760405163c0c53b8b60e01b815260048101829052602481018390527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166044820152848160648183885af1801561043657610422575b50808452600260208181526040808720600086815290835281812080546001600160a01b0389166001600160a01b03199182168117909255878a52948452828920868352909352208054909216179055600354936801000000000000000085101561040e57506103bc84600160209601600355610702565b81549060031b9085821b9160018060a01b03901b19161790557f0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9604060035481519086825287820152a3604051908152f35b634e487b7160e01b81526041600452602490fd5b8461042f91959295610764565b9238610344565b6040513d87823e3d90fd5b8380fd5b6040513d85823e3d90fd5b634e487b7160e01b87526041600452602487fd5b633d77e89160e01b8452600484fd5b63d92e233d60e01b8452600484fd5b610228565b630bd969eb60e41b8552600485fd5b5034610117578060031936011261011757546040516001600160a01b039091168152602090f35b50346101175780600319360112610117576104d661079c565b6104de6107c5565b6001805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a180f35b5034610117578060031936011261011757600154336001600160a01b039091160361059257600180546001600160a01b0319908116909155815433918116821783556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08380a380f35b63118cdaa760e01b815233600452602490fd5b50346101175780600319360112610117576105be61079c565b600180546001600160a01b03199081169091558154908116825581906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b5034610117578060031936011261011757602060ff60015460a01c166040519015158152f35b50346101175780600319360112610117576020600354604051908152f35b503461011757806003193601126101175761066761079c565b60015460ff8160a01c16156106af5760ff60a01b19166001556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a180f35b638dfc202b60e01b8252600482fd5b503461011757602036600319011261011757600435906003548210156101175760206106e983610702565b905460405160039290921b1c6001600160a01b03168152f35b60035481101561071d57600360005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b600435906001600160a01b038216820361074957565b600080fd5b602435906001600160a01b038216820361074957565b90601f8019910116810190811067ffffffffffffffff82111761078657604052565b634e487b7160e01b600052604160045260246000fd5b6000546001600160a01b031633036107b057565b63118cdaa760e01b6000523360045260246000fd5b60ff60015460a01c166107d457565b63d93c066560e01b60005260046000fdfe60a06040523461038457604080519081016001600160401b0381118282101761028257604090815260118252702a30ba30a9bbb0b8102628102a37b5b2b760791b602083015280519081016001600160401b038111828210176102825760405260078152660544154412d4c560cc1b602082015281516001600160401b03811161028257600354600181811c9116801561037a575b602082101461026257601f8111610308575b50602092601f82116001146102a35792819293600092610298575b50508160011b916000199060031b1c1916176003555b80516001600160401b03811161028257600454600181811c91168015610278575b602082101461026257601f81116101f0575b50602091601f821160011461018c57918192600092610181575b50508160011b916000199060031b1c1916176004555b60017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005533608052604051611baa908161038a823960805181818161035e01526103b90152f35b015190503880610124565b601f198216926004600052806000209160005b8581106101d8575083600195106101bf575b505050811b0160045561013a565b015160001960f88460031b161c191690553880806101b1565b9192602060018192868501518155019401920161019f565b8181111561010a576004600052601f820160051c7f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b60208410610259575b81601f9101920160051c039060005b82811061024b57505061010a565b60008282015560010161023d565b6000915061022e565b634e487b7160e01b600052602260045260246000fd5b90607f16906100f8565b634e487b7160e01b600052604160045260246000fd5b0151905038806100c1565b601f198216936003600052806000209160005b8681106102f057508360019596106102d7575b505050811b016003556100d7565b015160001960f88460031b161c191690553880806102c9565b919260206001819286850151815501940192016102b6565b818111156100a6576003600052601f820160051c7fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b60208410610371575b81601f9101920160051c039060005b8281106103635750506100a6565b600082820155600101610355565b60009150610346565b90607f1690610094565b600080fdfe6080806040526003361161001257600080fd5b60003560e01c90816306fdde03146115e6575080630902f1ac14611588578063095ea7b3146115025780630dfe1681146114d957806318160ddd146114bb57806323b872dd146113ce578063313ce567146113b25780634734e71f146113945780636a627842146110be5780636d9a640a1461098757806370a082311461094d57806389afcb441461058e57806395d89b4114610486578063a9059cbb14610455578063ba9a7a5614610438578063c0c53b8b1461038d578063c45a015514610348578063d0fb02031461031f578063d21220a7146102f6578063dd62ed3e146102a5578063e1a4521814610288578063f2cf6c911461026a578063fccc28131461024d5763fff6cae91461012657600080fd5b346102015760003660031901126102015761013f611863565b6005546040516370a0823160e01b815230600482015290602090829060249082906001600160a01b03165afa801561020e5760009061021a575b6006546040516370a0823160e01b81523060048201529250602090839060249082906001600160a01b03165afa90811561020e576000916101d3575b6101bf92506119c4565b6001600080516020611b5583398151915255005b90506020823d602011610206575b816101ee6020938361172d565b81010312610201576101bf9151906101b5565b600080fd5b3d91506101e1565b6040513d6000823e3d90fd5b506020813d602011610245575b816102346020938361172d565b810103126102015760249051610179565b3d9150610227565b3461020157600036600319011261020157602060405161dead8152f35b34610201576000366003190112610201576020600954604051908152f35b346102015760003660031901126102015760206040516127108152f35b34610201576040366003190112610201576102be6116eb565b6102c6611701565b6001600160a01b039182166000908152600160209081526040808320949093168252928352819020549051908152f35b34610201576000366003190112610201576006546040516001600160a01b039091168152602090f35b34610201576000366003190112610201576007546040516001600160a01b039091168152602090f35b34610201576000366003190112610201576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b34610201576060366003190112610201576103a66116eb565b6103ae611701565b6103b6611717565b917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316330361042757600580546001600160a01b03199081166001600160a01b039384161790915560068054821693831693909317909255600780549092169216919091179055005b631dd2188d60e31b60005260046000fd5b346102015760003660031901126102015760206040516103e88152f35b346102015760403660031901126102015761047b6104716116eb565b60243590336117ca565b602060405160018152f35b346102015760003660031901126102015760405160006004548060011c90600181168015610584575b6020831081146105705782855290811561054c57506001146104ec575b6104e8836104dc8185038261172d565b604051918291826116a2565b0390f35b91905060046000527f8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b916000905b808210610532575090915081016020016104dc6104cc565b91926001816020925483858801015201910190929161051a565b60ff191660208086019190915291151560051b840190910191506104dc90506104cc565b634e487b7160e01b84526022600452602484fd5b91607f16916104af565b34610201576020366003190112610201576105a76116eb565b6105af611863565b600754604051635c975abb60e01b815290602090829060049082906001600160a01b03165afa90811561020e5760009161091e575b5061090d576005546006546040516370a0823160e01b8152306004820152926001600160a01b039283169290911690602084602481865afa93841561020e576000946108d9575b506040516370a0823160e01b815230600482015292602084602481865afa93841561020e576000946108a5575b5030600052600060205261068d610681610681610686604060002054986002549384918b61178a565b61179d565b968861178a565b928415801561089d575b61088c573015610876576000913083528260205260408320549680881061085b5790838260209360249a30845283865203604083205580600254036002556040519081527fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef843092a361070b878683611a59565b610716868685611a59565b6040516370a0823160e01b815230600482015297889182905afa958615610850578296610817575b506020602491604051928380926370a0823160e01b82523060048301525afa91821561080b5780926107d1575b5050610779906040956119c4565b83519083825282602083015260018060a01b0316907fdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496853392a36001600080516020611b558339815191525582519182526020820152f35b9091506020823d602011610803575b816107ed6020938361172d565b810103126108005750518461077961076b565b80fd5b3d91506107e0565b604051903d90823e3d90fd5b9095506020813d602011610848575b816108336020938361172d565b81010312610844575194602061073e565b5080fd5b3d9150610826565b6040513d84823e3d90fd5b63391434e360e21b8452306004526024889052604452606483fd5b634b637e8f60e11b600052600060045260246000fd5b63749383ad60e01b60005260046000fd5b508315610697565b9093506020813d6020116108d1575b816108c16020938361172d565b8101031261020157519285610658565b3d91506108b4565b9093506020813d602011610905575b816108f56020938361172d565b810103126102015751928461062b565b3d91506108e8565b634427925560e01b60005260046000fd5b610940915060203d602011610946575b610938818361172d565b810190611765565b826105e4565b503d61092e565b34610201576020366003190112610201576001600160a01b0361096e6116eb565b1660005260006020526020604060002054604051908152f35b34610201576060366003190112610201576024356004356109a6611717565b906109af611863565b600754604051635c975abb60e01b815290602090829060049082906001600160a01b03165afa90811561020e5760009161109f575b5061090d578015928380611097575b611086576001600160701b0391610a256008546001600160701b038116916001600160701b038260701c169160e01c90565b50931693848210801590611073575b611062576005546006546001600160a01b03838116989281169791169290918888148015611059575b8015611051575b6110405715611030575b848061101f575b50506040516370a0823160e01b815230600482015295602087602481845afa96871561020e57600097610feb575b506040516370a0823160e01b815230600482015292879290602085602481845afa94851561020e57600095610fb7575b508492610ae0878461177d565b6000908b1115610fb25750610afe610af8888561177d565b8b61177d565b6001600160701b03819a1692610b148a8561177d565b600090891115610fac5750610b32610b2c8b8661177d565b8961177d565b905b8198831594858096610fa4575b610f9357600754604051632ffdaf8960e01b8152966001600160a01b0390911695906020886004818a5afa97881561020e57600098610f5f575b506040516306acb3f760e31b815296602088600481845afa97881561020e57600098610f2a575b509060206004979695949392604051988980926339a51be560e01b82525afa96871561020e57600097610ee4575b5087151580610ed2575b610d6d575b505050505050509091929394959697989950808211600014610d6357610c049161177d565b905b61271085028581046127101486151715610d4d57610c2e90610c28848c61178a565b9061177d565b6127108502908582046127101486151715610d4d57610c57610c5d92610c28610c63968b61178a565b9061178a565b9261178a565b6127106001600060025b60018111610d10575082600019048211610cfc5750610c8e9291029061178a565b11610ceb57610c9c916119c4565b6040519384526020840152604083015260608201527fd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d82260803392a36001600080516020611b5583398151915255005b63113b766f60e01b60005260046000fd5b634e487b7160e01b81526011600452602490fd5b9280600019048111610d395760018416610d30575b80029260011c610c6d565b80920291610d25565b634e487b7160e01b82526011600452602482fd5b634e487b7160e01b600052601160045260246000fd5b5050600090610c06565b15610e2d575b5050909180939495969798999a9b9c9d9e50610d9d575b80808f9e9d9c9b9a999897969580610bdf565b612710610daa868561178a565b049081610db8575b50610d8a565b849b508180949a50610e0b81610e1193610df7602096889a7f81535d361819544361f80ddbe5071aef378a8ecba1c52f2c45fe3335234c433199611a59565b610e0382600a546117bd565b600a5561177d565b9a61177d565b6040519384529a6001600160a01b031692a38b80808080610db2565b612710610e3a888361178a565b049182610e48575b50610d73565b92939495969798999a9b509b9c9d9e509e8f610e8181610e8793610e6d828b88611a59565b610e79826009546117bd565b60095561177d565b9c61177d565b9e6040519081527f81535d361819544361f80ddbe5071aef378a8ecba1c52f2c45fe3335234c4331602060018060a01b03881692a3908d9c9b9a999897969594939291388080610e42565b506001600160a01b0387161515610bda565b6020979197813d602011610f22575b81610f006020938361172d565b810103126108445751906001600160a01b038216820361080057509538610bd0565b3d9150610ef3565b90976020823d602011610f57575b81610f456020938361172d565b81010312610800575051966020610ba2565b3d9150610f38565b90976020823d602011610f8b575b81610f7a6020938361172d565b810103126108005750519638610b7b565b3d9150610f6d565b63098fb56160e01b60005260046000fd5b508315610b41565b90610b34565b610afe565b90946020823d602011610fe3575b81610fd26020938361172d565b81010312610800575051938a610ad3565b3d9150610fc5565b90966020823d602011611017575b816110066020938361172d565b810103126108005750519588610aa3565b3d9150610ff9565b6110299184611a59565b8784610a75565b61103b848289611a59565b610a6e565b630521f43160e31b60005260046000fd5b508815610a64565b50838914610a5d565b63bb55fd2760e01b60005260046000fd5b506001600160701b038416831015610a34565b6342301c2360e01b60005260046000fd5b5080156109f3565b6110b8915060203d60201161094657610938818361172d565b846109e4565b34610201576020366003190112610201576110d76116eb565b6110df611863565b600754604051635c975abb60e01b815290602090829060049082906001600160a01b03165afa90811561020e57600091611375575b5061090d576024906000906111446008546001600160701b038116916001600160701b038260701c169160e01c90565b506005546040516370a0823160e01b8152306004820152959193929160209187919082906001600160a01b03165afa94851561136a578495611332575b506006546040516370a0823160e01b815230600482015290602090829060249082906001600160a01b03165afa94851561080b5780956112f4575b50506001600160701b0316906001600160701b036111da838761177d565b93166111e6818661177d565b926002549182156000146112ca57505050611209611204838561178a565b61189f565b6103e88111156112b9576103e7198101908111610d4d579361122f6103e861dead611ae6565b84156112b9576001600160a01b038216156112a3576020956112548661125994611ae6565b6119c4565b604051918252838201527f4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f60403392a26001600080516020611b5583398151915255604051908152f35b63ec442f0560e01b600052600060045260246000fd5b633489be7560e21b60005260046000fd5b6106816112de6112e593610681868a61178a565b938661178a565b9081808210911802189361122f565b909194506020823d60201161132a575b816113116020938361172d565b81010312610800575051926001600160701b03866111bc565b3d9150611304565b9094506020813d602011611362575b8161134e6020938361172d565b8101031261135e57519385611181565b8380fd5b3d9150611341565b6040513d86823e3d90fd5b61138e915060203d60201161094657610938818361172d565b82611114565b34610201576000366003190112610201576020600a54604051908152f35b3461020157600036600319011261020157602060405160128152f35b34610201576060366003190112610201576113e76116eb565b6113ef611701565b6001600160a01b038216600081815260016020908152604080832033845290915290205490926044359291600019811061142f575b5061047b93506117ca565b83811061149e5784156114885733156114725761047b946000526001602052604060002060018060a01b0333166000526020528360406000209103905584611424565b634a1406b160e11b600052600060045260246000fd5b63e602df0560e01b600052600060045260246000fd5b8390637dc7a0d960e11b6000523360045260245260445260646000fd5b34610201576000366003190112610201576020600254604051908152f35b34610201576000366003190112610201576005546040516001600160a01b039091168152602090f35b346102015760403660031901126102015761151b6116eb565b602435903315611488576001600160a01b031690811561147257336000526001602052604060002082600052602052806040600020556040519081527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560203392a3602060405160018152f35b346102015760003660031901126102015760606001600160701b0363ffffffff6115cd6008546001600160701b038116916001600160701b038260701c169160e01c90565b9193908160405195168552166020840152166040820152f35b346102015760003660031901126102015760006003548060011c90600181168015611698575b6020831081146105705782855290811561054c5750600114611638576104e8836104dc8185038261172d565b91905060036000527fc2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b916000905b80821061167e575090915081016020016104dc6104cc565b919260018160209254838588010152019101909291611666565b91607f169161160c565b91909160208152825180602083015260005b8181106116d5575060409293506000838284010152601f8019910116010190565b80602080928701015160408286010152016116b4565b600435906001600160a01b038216820361020157565b602435906001600160a01b038216820361020157565b604435906001600160a01b038216820361020157565b90601f8019910116810190811067ffffffffffffffff82111761174f57604052565b634e487b7160e01b600052604160045260246000fd5b90816020910312610201575180151581036102015790565b91908203918211610d4d57565b81810292918115918404141715610d4d57565b81156117a7570490565b634e487b7160e01b600052601260045260246000fd5b91908201809211610d4d57565b6001600160a01b0316908115610876576001600160a01b03169182156112a35760008281528060205260408120548281106118495791604082827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef958760209652828652038282205586815280845220818154019055604051908152a3565b916064928463391434e360e21b8452600452602452604452fd5b6002600080516020611b55833981519152541461188e576002600080516020611b5583398151915255565b633ee5aeb560e01b60005260046000fd5b60018111156119c157806001600160801b8210156119b0575b600482600160401b6119629410156119a3575b640100000000811015611996575b62010000811015611989575b61010081101561197d575b6010811015611971575b1015611969575b60030260011c611911818461179d565b0160011c61191f818461179d565b0160011c61192d818461179d565b0160011c61193b818461179d565b0160011c611949818461179d565b0160011c611957818461179d565b0160011c809261179d565b8111900390565b60011b611901565b811c9160021b916118fa565b60081c91811b916118f0565b60101c9160081b916118e5565b60201c9160101b916118d9565b60401c9160201b916118cb565b5050608081901c600160401b6118b8565b90565b6001600160701b0381118015611a49575b611a38577f1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1916001600160701b038060409316918263ffffffff60e01b4260e01b16918360701b9060701b16171780600855835192835260701c166020820152a1565b631a93c68960e11b60005260046000fd5b506001600160701b0382116119d5565b60405163a9059cbb60e01b60009081526001600160a01b03909316600452602493909352919060209060448180865af190600160005114821615611ac4575b60405215611aa35750565b635274afe760e01b60009081526001600160a01b0391909116600452602490fd5b906001811516611adc57823b15153d15161690611a98565b503d6000823e3d90fd5b7fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef6020600092611b18856002546117bd565b6002556001600160a01b03169384158414611b3f5780600254036002555b604051908152a3565b84845283825260408420818154019055611b3656fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220fd40b58d9989df7dc186ccca3dbf71c6efd1a602db10e0e89ebf7c4bbba1543264736f6c63430008270033a2646970667358221220f8c422fe755fc45cb7aab0f97cfd41044e7a570169ead7598ba4ab3ea0e8b07364736f6c63430008270033"
  },
  "TataSwapRouter": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_factory",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_WETH",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_feeManager",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "ExcessiveInputAmount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "Expired",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientAAmount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientBAmount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InsufficientOutputAmount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "PairDoesNotExist",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ProtocolPaused",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAmount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "BPS_DENOMINATOR",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "WETH",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountADesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBDesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountAMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "addLiquidity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenDesired",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountTokenMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETHMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "addLiquidityETH",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountToken",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountETH",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "factory",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeManager",
        "outputs": [
          {
            "internalType": "contract TataSwapFeeManager",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveOut",
            "type": "uint256"
          }
        ],
        "name": "getAmountOut",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountOut",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          }
        ],
        "name": "getAmountsOut",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reserveB",
            "type": "uint256"
          }
        ],
        "name": "quote",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "liquidity",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountAMin",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountBMin",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "removeLiquidity",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "amountA",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountB",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenA",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "tokenB",
            "type": "address"
          }
        ],
        "name": "sortTokens",
        "outputs": [
          {
            "internalType": "address",
            "name": "token0",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token1",
            "type": "address"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactTokensForETH",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountIn",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "stateMutability": "payable",
        "type": "receive"
      }
    ],
    "bytecode": "0x60e03461014057601f61210238819003918201601f19168301916001600160401b0383118484101761014557808492606094604052833981010312610140576100478161015b565b9061006060406100596020840161015b565b920161015b565b60017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f005560809290925260a0526001600160a01b031660c052604051611f92908161017082396080518181816106e1015281816107dc01528181610b9101528181610e5801528181611095015281816117d001528181611ae80152611d4d015260a051818181601a0152818161019a015281816109b101528181610a9e015261100f015260c05181818161014d01528181610497015281816106400152818161076501528181610a3f01528181610db401528181610f9d01526114c00152f35b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101405756fe608060405260033611610060575b361561001857600080fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316330361004a57005b634e487b7160e01b600052600160045260246000fd5b6000803560e01c8063054d50d41461128957806318cbafe514610f6a57806338ed173914610d84578063544caa5614610d3d5780637ff36ab5146109e0578063ad5c46481461099b578063ad615dec14610979578063baa2abde14610710578063c45a0155146106cb578063d06ca61f1461066f578063d0fb02031461062a578063e1a452181461060d578063e8e33700146104425763f305d71914610106575061000d565b60c036600319011261043f5761011a6112ee565b906084356001600160a01b0381169081900361043d57610138611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610432578391610413575b50610404574260a435106103f557906101e4917f0000000000000000000000000000000000000000000000000000000000000000906101ce60643560443534602435868a611d1c565b93918481979298339060018060a01b0316611a4d565b6001600160a01b0316803b156103e657604051630d0e30db60e41b815284816004818a865af180156103ea579085916103d1575b505060405163a9059cbb60e01b81526001600160a01b038416600482015260248101879052906020908290604490829088905af19081156103c65760209261026c8695936024938791610399575b506116c3565b6040516335313c2160e11b815260048101919091529485928391906001600160a01b03165af191821561038c578192610353575b508334116102e1575b506102dd906001600080516020611f3d83398151915255604051938493846040919493926060820195825260208201520152565b0390f35b83340334811161033f5781808092335af16102fa611668565b501561030657386102a9565b60405162461bcd60e51b815260206004820152601160248201527011551217d4915195539117d19052531151607a1b6044820152606490fd5b634e487b7160e01b82526011600452602482fd5b9091506020813d602011610384575b8161036f602093836113a3565b8101031261037f575190386102a0565b600080fd5b3d9150610362565b50604051903d90823e3d90fd5b6103b99150863d88116103bf575b6103b181836113a3565b8101906115a6565b38610266565b503d6103a7565b6040513d86823e3d90fd5b816103db916113a3565b6103e6578338610218565b8380fd5b6040513d87823e3d90fd5b630407b05b60e31b8252600482fd5b634427925560e01b8252600482fd5b61042c915060203d6020116103bf576103b181836113a3565b38610185565b6040513d85823e3d90fd5b505b80fd5b503461043f5761010036600319011261043f5761045d6112ee565b610465611304565b60c4356001600160a01b038116908190036103e657610482611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156103ea5785916105ee575b506105df574260e435106105d057926020819260246105199661052961050160a435608435606435604435888d611d1c565b95819b83888094959d339060018060a01b0316611a4d565b33906001600160a01b0316611a4d565b6040516335313c2160e11b815260048101919091529485928391906001600160a01b03165af19081156105c45790610590575b6102dd91506001600080516020611f3d83398151915255604051938493846040919493926060820195825260208201520152565b506020813d6020116105bc575b816105aa602093836113a3565b8101031261037f576102dd905161055c565b3d915061059d565b604051903d90823e3d90fd5b630407b05b60e31b8452600484fd5b634427925560e01b8452600484fd5b610607915060203d6020116103bf576103b181836113a3565b386104cf565b503461043f578060031936011261043f5760206040516127108152f35b503461043f578060031936011261043f576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461043f57604036600319011261043f576024359067ffffffffffffffff821161043f573660238301121561043f576102dd6106bf6106b7366004860135602487016113f3565b600435611786565b60405191829182611369565b503461043f578060031936011261043f576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b503461043f5760e036600319011261043f5761072a6112ee565b610732611304565b9060a4356001600160a01b038116908190036103e657610750611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156103ea57859161095a575b506105df574260c435106105d05760405163e6a4390560e01b81526001600160a01b0380841660048301528416602482015290602082806044810103817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9182156103ea578592610929575b506001600160a01b03821691821561091a5791602460409261083d889695604435903386611a4d565b8351958693849263226bf2d160e21b845260048401525af19283156103c657849285946108dc575b5061087090826116a8565b506001600160a01b039182169116036108d757905b60643582106108c85760843581106108b957604092506001600080516020611f3d8339815191525582519182526020820152f35b63ef71d09160e01b8352600483fd5b638dc525d160e01b8352600483fd5b610885565b925092506040823d604011610912575b816108f9604093836113a3565b810103126103e657610870602083519301519390610865565b3d91506108ec565b63317f12fd60e21b8652600486fd5b61094c91925060203d602011610953575b61094481836113a3565b810190611649565b9038610814565b503d61093a565b610973915060203d6020116103bf576103b181836113a3565b3861079d565b503461043f57602061099361098d366112a3565b91611706565b604051908152f35b503461043f578060031936011261043f576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b50608036600319011261043f5760243567ffffffffffffffff811161043d57610a0d9036906004016112bd565b90604435906001600160a01b03821682036103e657610a2a611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156103ea578591610d1e575b506105df5742606435106105d0578215610d0a57610a94816115be565b6001600160a01b037f000000000000000000000000000000000000000000000000000000000000000081169491610acd911685146115d2565b610ae1610adb3683856113f3565b34611786565b9384516000198101908111610cf657610afd6004359187611635565b5110610ce75785610b0d86611612565b51823b1561043d578160049160405192838092630d0e30db60e41b8252875af18015610cdc57610cc3575b5050610b43836115be565b8260011015610caf576020610b8d91610b5d8287016115be565b60405163e6a4390560e01b81526001600160a01b0392831660048201529116602482015291829081906044820190565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa8015610ca457610c0e926020928992610c85575b50610bd988611612565b5160405163a9059cbb60e01b81526001600160a01b0390931660048401526024830152909283919082908a9082906044820190565b03925af1908115610c7a5791610c36610c43959492610c3d946102dd9991610c6157506116c3565b36916113f3565b83611ae4565b6001600080516020611f3d8339815191525560405191829182611369565b6103b9915060203d6020116103bf576103b181836113a3565b6040513d88823e3d90fd5b610c9d919250833d85116109535761094481836113a3565b9038610bcf565b6040513d89823e3d90fd5b634e487b7160e01b87526032600452602487fd5b81610ccd916113a3565b610cd8578538610b38565b8580fd5b6040513d84823e3d90fd5b6342301c2360e01b8652600486fd5b634e487b7160e01b87526011600452602487fd5b634e487b7160e01b84526032600452602484fd5b610d37915060203d6020116103bf576103b181836113a3565b38610a77565b503461043f57604036600319011261043f57610d68610d5a6112ee565b610d62611304565b906116a8565b604080516001600160a01b039384168152919092166020820152f35b503461043f57610d933661131a565b610d9f95919495611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610f5f578891610f40575b50610f31574211610f2257610e0c90610e063684866113f3565b90611786565b9384516000198101908111610cf657610e259086611635565b5110610f13578015610eff57610e3a826115be565b8160011015610eeb576020610e5491610b5d8286016115be565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610c7a5791610c36610c4395949288610c3d956102dd9a92610eca575b506001600160a01b039050610eb6856115be565b1690610ec189611612565b51913390611a4d565b610ee491925060203d6020116109535761094481836113a3565b9038610ea2565b634e487b7160e01b86526032600452602486fd5b634e487b7160e01b85526032600452602485fd5b6342301c2360e01b8552600485fd5b630407b05b60e31b8652600486fd5b634427925560e01b8752600487fd5b610f59915060203d6020116103bf576103b181836113a3565b38610dec565b6040513d8a823e3d90fd5b503461043f57610f793661131a565b610f8896949695939195611a11565b604051635c975abb60e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa908115610c7a57869161126a575b5061125b5742116105d05760001982018281116112475782811015610eff576110056110499160051b83016115be565b6001600160a01b037f00000000000000000000000000000000000000000000000000000000000000008116959161103e911686146115d2565b610e063685856113f3565b9586516000198101908111611233576110629088611635565b5110611224578115610d0a57611077816115be565b8260011015610eff57602061109191610b5d8285016115be565b03817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa9081156103ea57916110f76111009261110695948891611205575b506001600160a01b036110ec846115be565b1690610ec18b611612565b309236916113f3565b86611ae4565b835160001981019081116111dd5761111e9085611635565b51813b15611201578291602483926040519485938492632e1a7d4d60e01b845260048401525af18015610cdc576111f1575b5090825160001981019081116111dd5782809261116e829387611635565b51905af161117a611668565b50156111a2576102dd906001600080516020611f3d8339815191525560405191829182611369565b60405162461bcd60e51b815260206004820152601360248201527211551217d514905394d1915497d19052531151606a1b6044820152606490fd5b634e487b7160e01b83526011600452602483fd5b816111fb916113a3565b38611150565b8280fd5b61121e915060203d6020116109535761094481836113a3565b386110da565b6342301c2360e01b8452600484fd5b634e487b7160e01b86526011600452602486fd5b634e487b7160e01b85526011600452602485fd5b634427925560e01b8552600485fd5b611283915060203d6020116103bf576103b181836113a3565b38610fd5565b503461043f57602061099361129d366112a3565b91611497565b606090600319011261037f57600435906024359060443590565b9181601f8401121561037f5782359167ffffffffffffffff831161037f576020808501948460051b01011161037f57565b600435906001600160a01b038216820361037f57565b602435906001600160a01b038216820361037f57565b60a060031982011261037f5760043591602435916044359067ffffffffffffffff821161037f5761134d916004016112bd565b90916064356001600160a01b038116810361037f579060843590565b602060408183019282815284518094520192019060005b81811061138d5750505090565b8251845260209384019390920191600101611380565b90601f8019910116810190811067ffffffffffffffff8211176113c557604052565b634e487b7160e01b600052604160045260246000fd5b67ffffffffffffffff81116113c55760051b60200190565b92916113fe826113db565b9361140c60405195866113a3565b602085848152019260051b810191821161037f57915b81831061142e57505050565b82356001600160a01b038116810361037f57815260209283019201611422565b8181029291811591840414171561146157565b634e487b7160e01b600052601160045260246000fd5b8115611481570490565b634e487b7160e01b600052601260045260246000fd5b8015801561159e575b8015611596575b61158557604051632ffdaf8960e01b81526020816004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa90811561157957600091611547575b50612710039061271082116114615761151c916115159161144e565b928361144e565b9161271082029180830461271014901517156114615781018091116114615761154491611477565b90565b90506020813d602011611571575b81611562602093836113a3565b8101031261037f5751386114f9565b3d9150611555565b6040513d6000823e3d90fd5b631f2a200560e01b60005260046000fd5b5082156114a7565b5081156114a0565b9081602091031261037f5751801515810361037f5790565b356001600160a01b038116810361037f5790565b156115d957565b60405162461bcd60e51b81526020600482015260116024820152700929cac82989288beae8aa890bea082a89607b1b6044820152606490fd5b80511561161f5760200190565b634e487b7160e01b600052603260045260246000fd5b805182101561161f5760209160051b010190565b9081602091031261037f57516001600160a01b038116810361037f5790565b3d156116a3573d9067ffffffffffffffff82116113c55760405191611697601f8201601f1916602001846113a3565b82523d6000602084013e565b606090565b6001600160a01b0382811690821610156116bf5791565b9091565b156116ca57565b60405162461bcd60e51b815260206004820152601460248201527315d1551217d514905394d1915497d1905253115160621b6044820152606490fd5b80158015611734575b801561172c575b61158557611544926117279161144e565b611477565b508215611716565b50811561170f565b51906001600160701b038216820361037f57565b9081606091031261037f576117648161173c565b9160406117736020840161173c565b92015163ffffffff8116810361037f5790565b9060028151106119dd57809291925161179e816113db565b906117ac60405192836113a3565b8082526117bb601f19916113db565b0136602083013780936117cd82611612565b527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169360005b83516000198101908111611461578110156119d6576001600160a01b036118238286611635565b51169060018101918282116114615761187f906020906001600160a01b0361184b868a611635565b5160405163e6a4390560e01b81526001600160a01b0393841660048201529116909116602482015291829081906044820190565b03818b5afa908115611579576000916119b8575b506001600160a01b031680156119a757606060049160405192838092630240bc6b60e21b82525afa90811561157957600193600091829361196c575b5061194d6119559293868060a01b036118e8878c611635565b51169461190a6000968c611902878c8060a01b0392611635565b5116906116a8565b508b61191c898b8060a01b0392611635565b511690898060a01b03161460001461195c576001600160701b038091925b169116611947878b611635565b51611497565b925086611635565b52016117fc565b6001600160701b0390819061193a565b61194d935061195592506119969060603d81116119a0575b61198e81836113a3565b810190611750565b50939092506118cf565b503d611984565b63317f12fd60e21b60005260046000fd5b6119d0915060203d81116109535761094481836113a3565b38611893565b5093505050565b60405162461bcd60e51b815260206004820152600c60248201526b0929cac82989288bea082a8960a31b6044820152606490fd5b6002600080516020611f3d8339815191525414611a3c576002600080516020611f3d83398151915255565b633ee5aeb560e01b60005260046000fd5b6040516323b872dd60e01b60009081526001600160a01b039384166004529290931660245260449390935260209060648180865af190600160005114821615611ac2575b604052600060605215611aa15750565b635274afe760e01b60009081526001600160a01b0391909116600452602490fd5b906001811516611ada57823b15153d15161690611a91565b503d6000823e3d90fd5b92917f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169160005b8151600019810190811161146157811015611d14576001600160a01b03611b3b8284611635565b511660018201808311611461576001600160a01b03611b5a8286611635565b5116611b6681846116a8565b50611b736000938b611635565b51906001600160a01b03168403611d0d578290915b8651600119810190811161124757861015611d00576002860180871161124757611bf8906020906001600160a01b0390611bc2908b611635565b5160405163e6a4390560e01b81526001600160a01b03868116600483015292909116909116602482015291829081906044820190565b03818d5afa9081156103ea5791602091611c46938791611ce3575b50965b60405163e6a4390560e01b81526001600160a01b0391821660048201529116602482015291829081906044820190565b03818c5afa9081156103c6578491611cc5575b506001600160a01b0316803b156103e6578392918360649260405197889586946336cd320560e11b86526004860152602485015260018060a01b031660448401525af1801561038c57906001939291611cb5575b505001611b14565b611cbe916113a3565b3880611cad565b611cdd915060203d81116109535761094481836113a3565b38611c59565b611cfa9150833d81116109535761094481836113a3565b38611c13565b6020611c46918996611c16565b8291611b88565b505050509050565b60405163e6a4390560e01b81526001600160a01b0382811660048301528381166024830152939690959293909291907f000000000000000000000000000000000000000000000000000000000000000016602087604481845afa96871561157957600097611f1b575b506001600160a01b03871615611eaf575b50604051630240bc6b60e21b8152906060826004816001600160a01b038b165afa94851561157957600092600096611e87575b50611dd490826116a8565b506001600160a01b03918216911603611e77576001600160701b0380915b16931692801580611e6f575b15611e0b57505050509192565b611e1b8482899794959697611706565b94828611611e4257505050508110611e31579192565b63ef71d09160e01b60005260046000fd5b919450919550611e53925083611706565b928310611e5e579192565b638dc525d160e01b60005260046000fd5b508315611dfe565b926001600160701b038091611df2565b611ea6919650611dd4935060603d6060116119a05761198e81836113a3565b50959092611dc9565b6040516364e329cb60e11b81526001600160a01b03838116600483015286166024820152919650602090829060449082906000905af190811561157957600091611efc575b509438611d96565b611f15915060203d6020116109535761094481836113a3565b38611ef4565b611f3591975060203d6020116109535761094481836113a3565b9538611d8556fe9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00a2646970667358221220e581c7d5647c71149c2c540d509c5ede2fea6aae19b625a3f0d5367666991a4f64736f6c63430008270033"
  },
  "TataSwapListingFee": {
    "abi": [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "initialOwner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialFeeReceiver",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "initialPaymentToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "initialListingFee",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "initialFactory",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "EnforcedPause",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "required",
            "type": "uint256"
          }
        ],
        "name": "InsufficientPaymentAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "required",
            "type": "uint256"
          }
        ],
        "name": "InsufficientPaymentBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          }
        ],
        "name": "InvalidERC20Token",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          }
        ],
        "name": "NotAContract",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "SafeERC20FailedOperation",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "name": "TokenAlreadyListed",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "ZeroAddress",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousFactory",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newFactory",
            "type": "address"
          }
        ],
        "name": "FactoryUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousReceiver",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newReceiver",
            "type": "address"
          }
        ],
        "name": "FeeReceiverUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "lister",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "feeAmount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "feeReceiverWallet",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "ListingFeeCollected",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "previousFee",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "newFee",
            "type": "uint256"
          }
        ],
        "name": "ListingFeeUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferStarted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousToken",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newToken",
            "type": "address"
          }
        ],
        "name": "PaymentTokenUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "lister",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "decimals",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "pairAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "name": "TokenListed",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "allListedTokens",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "factory",
        "outputs": [
          {
            "internalType": "contract TataSwapFactory",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "feeReceiverWallet",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "pairWithToken",
            "type": "address"
          }
        ],
        "name": "listToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "pairAddress",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "listingFee",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "listings",
        "outputs": [
          {
            "internalType": "address",
            "name": "tokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "lister",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "decimals",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "pairToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "pairAddress",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "feePaid",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "paymentToken",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "listedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paymentToken",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "pendingOwner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newFactory",
            "type": "address"
          }
        ],
        "name": "setFactory",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newFeeReceiver",
            "type": "address"
          }
        ],
        "name": "setFeeReceiverWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "newFee",
            "type": "uint256"
          }
        ],
        "name": "setListingFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newPaymentToken",
            "type": "address"
          }
        ],
        "name": "setPaymentToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalListedTokens",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "bytecode": "0x60803461025357601f6117e138819003918201601f19168301916001600160401b038311848410176102585780849260a094604052833981010312610253576100478161026e565b6100536020830161026e565b61005f6040840161026e565b9061007160806060860151950161026e565b926001600160a01b031690811561023d57600180546001600160a01b0319908116909155600080549182168417815560405193916001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a360017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00556001600160a01b0316938415801561022c575b801561021b575b61020a57600280546001600160a01b031990811687179091556003805482166001600160a01b0395861690811790915560048390556005805490921694909516938417905591937f83bee1c75d00c29e66092d821c1c82aa4792fe1f058e8dff38d5d394d37916dd936040939160007fa92ff4390fe6943f0b30e8fe715dde86f85ab79b2b2c640a10fc094cc4036cc88180a360007f5efdfedf5aef119c431263f0656093045dffdf44b3d8f1b0f158dc295c3a0f8e8180a3600082526020820152a16040519060007f333c7678baf16017cf31e1d2f90143a62aab01a67a0807f6836a4304ceabb5558180a361155e90816102838239f35b63d92e233d60e01b60005260046000fd5b506001600160a01b03841615610111565b506001600160a01b0383161561010a565b631e4fbdf760e01b600052600060045260246000fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036102535756fe6080806040526003361161001257600080fd5b60003560e01c9081630d719fa2146112b957508063131dbd09146112655780633013ce291461123c5780633f4ba83a146111cb5780635bb47808146111575780635c975abb14611131578063655fcaf51461110857806365a9307a146105b557806365d96c82146104ae5780636a1b7ecc146104905780636a326ab114610400578063715018a61461039b57806379ba5097146103125780638456cb59146102b05780638da5cb5b14610287578063af2a48d614610202578063c45a0155146101d9578063e30c3978146101b0578063e824af3e1461016e5763f2fde38b146100fa57600080fd5b34610169576020366003190112610169576101136112d4565b61011b6114f4565b60018060a01b0316806001600160601b0360a01b600154161760015560018060a01b03600054167f38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700600080a3005b600080fd5b346101695760203660031901126101695760043560075481101561016957610197602091611432565b905460405160039290921b1c6001600160a01b03168152f35b34610169576000366003190112610169576001546040516001600160a01b039091168152602090f35b34610169576000366003190112610169576005546040516001600160a01b039091168152602090f35b346101695760203660031901126101695761021b6112d4565b6102236114f4565b6001600160a01b0316801561027657600280546001600160a01b0319811683179091556001600160a01b03167fa92ff4390fe6943f0b30e8fe715dde86f85ab79b2b2c640a10fc094cc4036cc8600080a3005b63d92e233d60e01b60005260046000fd5b34610169576000366003190112610169576000546040516001600160a01b039091168152602090f35b34610169576000366003190112610169576102c96114f4565b6102d1611508565b6001805460ff60a01b1916600160a01b1790556040513381527f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a25890602090a1005b3461016957600036600319011261016957600154336001600160a01b039091160361038657600180546001600160a01b03199081169091556000805433928116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b63118cdaa760e01b6000523360045260246000fd5b34610169576000366003190112610169576103b46114f4565b600180546001600160a01b0319908116909155600080549182168155906001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b34610169576020366003190112610169576104196112d4565b6104216114f4565b6001600160a01b038116908115610276573b1561047c57600380546001600160a01b0319811683179091556001600160a01b03167f5efdfedf5aef119c431263f0656093045dffdf44b3d8f1b0f158dc295c3a0f8e600080a3005b6322a2d07b60e21b60005260045260246000fd5b34610169576000366003190112610169576020600454604051908152f35b34610169576020366003190112610169576001600160a01b036104cf6112d4565b166000908152600660205260409020805460018201546001600160a01b039081169291169061050060028201611346565b61050c60038301611346565b9160048101549260018060a01b0360058301541660068301549061057660018060a01b036007860154169361056860ff6009600889015498015416976040519b8c9b8c5260208c015261016060408c01526101608b019061140d565b9089820360608b015261140d565b60ff8716608089015260089690961c6001600160a01b031660a088015260c087015260e086015261010085015261012084015215156101408301520390f35b34610169576040366003190112610169576105ce6112d4565b6024356001600160a01b038116908181036101695760027f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0054146110f75760027f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055610638611508565b6001600160a01b0383169260009290841561027657803b1561101c5784600052600660205260ff600960406000200154166110e2576040516306fdde0360e01b8152600080826004818a5afa909182826110c5575b50506106a857856304a95d8d60e11b60005260045260246000fd5b936040516395d89b4160e01b81526000816004818a5afa600091816110a0575b506106e257866304a95d8d60e11b60005260045260246000fd5b9160405163313ce56760e01b81526020816004818b5afa8091600091611060575b509061071e57876304a95d8d60e11b60005260045260246000fd5b946040516318160ddd60e01b81526020816004818c5afa9081611031575b5061075657876304a95d8d60e11b60005260045260246000fd5b969394959685610f15575b505060045460035460025491926001600160a01b039182169290911683610c27575b5060405191610160830183811067ffffffffffffffff821117610a7157604052858352602083019333855260408401928a84526060850199878b5260ff608087019116998a825260a0870190815260c087019260018060a01b03169b8c845260e08801948552610100880195865261012088019642885261014089019960018b528c600052600660205260406000209960018060a01b039060018060a01b03905116166001600160601b0360a01b8b5416178a5560018060a01b0390511660018a019060018060a01b03166001600160601b0360a01b82541617905560028901905180519067ffffffffffffffff8211610a7157819061088384546112ea565b601f8111610bc9575b50602090601f8311600114610b6457600092610b59575b50508160011b916000199060031b1c19161790555b518051600389019167ffffffffffffffff8211610a71576108d983546112ea565b601f8111610b03575b50602090601f8311600114610a925760099a99989796959493929160009183610a87575b50508160011b916000199060031b1c19161790555b905160048701805492516001600160a81b031990931660ff92831617600893841b610100600160a81b031617905591516005870180546001600160a01b03199081166001600160a01b0393841617909155935160068801559351600780880180549095169190951617909255925190840155935192909101805492151590911660ff1992909216919091179055549468010000000000000000861015610a7157610a2d7f94af955b7ffae2fd8f9d2ecc717debb426ee908eb9bb641144f40c2791cccb1f926109f288600160209a01600755611432565b81549060031b9087821b9160018060a01b03901b1916179055610a206040519360a0855260a085019061140d565b908382038985015261140d565b9360408201528460608201524260808201528033940390a360017f9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f0055604051908152f35b634e487b7160e01b600052604160045260246000fd5b015190503880610906565b90601f1983169184600052816000209260005b818110610aeb575091600193918560099e9d9c9b9a999897969410610ad2575b505050811b01905561091b565b015160001960f88460031b161c19169055388080610ac5565b92936020600181928786015181550195019301610aa5565b828111156108e257836000526020600020601f840160051c9060208510610b50575b81601f9101920160051c039060005b828110610b425750506108e2565b600082820155600101610b34565b60009150610b25565b0151905038806108a3565b60008581528281209350601f198516905b818110610bb15750908460019594939210610b98575b505050811b0190556108b8565b015160001960f88460031b161c19169055388080610b8b565b92936020600181928786015181550195019301610b75565b8281111561088c57909150836000526020600020601f840160051c9060208510610c1e575b849392601f0160051c829003910160005b828110610c0d57505061088c565b600081830155859450600101610bff565b60009150610bee565b6040516370a0823160e01b8152336004820152602081602481875afa908115610e0957600091610ee3575b50848110610eca5750604051636eb1769f60e11b8152336004820152306024820152602081604481875afa908115610e0957600091610e98575b50848110610e7f57506040516370a0823160e01b815260048101829052602081602481875afa908115610e0957600091610e4a575b5060006020604051916323b872dd60e01b815233600452846024528760445260648180895af1600160005114811615610e2a575b81604052600060605215610e15576370a0823160e01b815260048101839052602081602481885afa908115610e0957600091610dd7575b50858201809211610dc15710610d7d578583916040519086825260208201524260408201527f8983cffd870bb76f493bf5b99e965afc092668b984fc9dfffdb0522629fb3bed60603392a488610783565b606460405162461bcd60e51b815260206004820152602060248201527f4645455f44454c49564552595f564552494649434154494f4e5f4641494c45446044820152fd5b634e487b7160e01b600052601160045260246000fd5b90506020813d602011610e01575b81610df260209383611324565b8101031261016957518b610d2c565b3d9150610de5565b6040513d6000823e3d90fd5b84635274afe760e01b60005260045260246000fd5b6001811516610e4057853b15153d151616610cf5565b503d6000823e3d90fd5b906020823d602011610e77575b81610e6460209383611324565b81010312610e745750518a610cc1565b80fd5b3d9150610e57565b849063b2df58df60e01b60005260045260245260446000fd5b906020823d602011610ec2575b81610eb260209383611324565b81010312610e745750518a610c8c565b3d9150610ea5565b8490631883c38160e11b60005260045260245260446000fd5b906020823d602011610f0d575b81610efd60209383611324565b81010312610e745750518a610c52565b3d9150610ef0565b809192503b1561101c5760055460405163e6a4390560e01b81526001600160a01b038481166004830152838116602483015290929116602083604481845afa928315610e0957600093610ffb575b506001600160a01b03831615610f7d575b50819250610761565b6040516364e329cb60e11b81526001600160a01b0394851660048201529190931660248201529160209150829060449082906000905af1908115610e0957600091610fcc575b50808780610f74565b610fee915060203d602011610ff4575b610fe68183611324565b8101906114d5565b86610fc3565b503d610fdc565b61101591935060203d602011610ff457610fe68183611324565b9189610f63565b846322a2d07b60e21b60005260045260246000fd5b6020813d602011611058575b8161104a60209383611324565b81010312610169575161073c565b3d915061103d565b6020813d602011611098575b8161107960209383611324565b8101031261109457519060ff82168203610e74575089610703565b5080fd5b3d915061106c565b6110be9192503d806000833e6110b68183611324565b810190611463565b90886106c8565b6110da9293503d8091833e6110b68183611324565b90878061068d565b84633fb6e97160e01b60005260045260246000fd5b633ee5aeb560e01b60005260046000fd5b34610169576000366003190112610169576002546040516001600160a01b039091168152602090f35b3461016957600036600319011261016957602060ff60015460a01c166040519015158152f35b34610169576020366003190112610169576111706112d4565b6111786114f4565b6001600160a01b0316801561027657600580546001600160a01b0319811683179091556001600160a01b03167f333c7678baf16017cf31e1d2f90143a62aab01a67a0807f6836a4304ceabb555600080a3005b34610169576000366003190112610169576111e46114f4565b60015460ff8160a01c161561122b5760ff60a01b19166001556040513381527f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa90602090a1005b638dfc202b60e01b60005260046000fd5b34610169576000366003190112610169576003546040516001600160a01b039091168152602090f35b34610169576020366003190112610169577f83bee1c75d00c29e66092d821c1c82aa4792fe1f058e8dff38d5d394d37916dd60406004356112a46114f4565b600454908060045582519182526020820152a1005b34610169576000366003190112610169576020906007548152f35b600435906001600160a01b038216820361016957565b90600182811c9216801561131a575b602083101461130457565b634e487b7160e01b600052602260045260246000fd5b91607f16916112f9565b90601f8019910116810190811067ffffffffffffffff821117610a7157604052565b906040519182600082549261135a846112ea565b80845293600181169081156113c85750600114611381575b5061137f92500383611324565b565b90506000929192526020600020906000915b8183106113ac57505090602061137f9282010138611372565b6020919350806001915483858901015201910190918492611393565b90506020925061137f94915060ff191682840152151560051b82010138611372565b60005b8381106113fd5750506000910152565b81810151838201526020016113ed565b90602091611426815180928185528580860191016113ea565b601f01601f1916010190565b60075481101561144d57600760005260206000200190600090565b634e487b7160e01b600052603260045260246000fd5b6020818303126101695780519067ffffffffffffffff8211610169570181601f8201121561016957805167ffffffffffffffff8111610a7157604051926114b4601f8301601f191660200185611324565b81845260208284010111610169576114d291602080850191016113ea565b90565b9081602091031261016957516001600160a01b03811681036101695790565b6000546001600160a01b0316330361038657565b60ff60015460a01c1661151757565b63d93c066560e01b60005260046000fdfea264697066735822122008690a0dcbc1a296e7c0cc6de816433b793537e0a5d0279930b5b146f53665f264736f6c63430008270033"
  }
} as const;
