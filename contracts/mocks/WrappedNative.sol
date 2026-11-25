// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WrappedNative is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    receive() external payable {
        deposit();
    }

    function deposit() public payable {
        _mint(msg.sender, msg.value);
    }

    function withdraw(uint256 wad) external {
        _burn(msg.sender, wad);
        (bool ok,) = msg.sender.call{value: wad}("");
        require(ok, "NATIVE_TRANSFER_FAILED");
    }
}
