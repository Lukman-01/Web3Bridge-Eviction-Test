// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MyLudoGame {
    mapping(address => uint256) public playerPositions;
    uint8 public constant boardSize = 52;
    event PlayerMoved(address indexed player, uint res);

    function throwDice() external view returns (uint8) {
        uint8 res = uint8(
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.difficulty,
                        msg.sender
                    )
                )
            ) % 6) + 1
        );
        return res;
    }

    function movePlayer(uint res) external {
        require(res >= 1 && res <= 6, "Invalid result provided");

        playerPositions[msg.sender] =
            (playerPositions[msg.sender] + res) %
            boardSize;

        emit PlayerMoved(msg.sender, playerPositions[msg.sender]);
    }
}