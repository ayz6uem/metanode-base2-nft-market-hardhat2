// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyToken is ERC721 {

    uint256 private _tokenIdCounter;

    constructor() ERC721("MyToken", "MTK") {
        _tokenIdCounter = 1;
    }

    function mint(address to) public { 
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
    }

}
