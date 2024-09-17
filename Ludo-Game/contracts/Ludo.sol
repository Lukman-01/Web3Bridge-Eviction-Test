// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract Ludo {
    address public manager;
    uint256 public playersLength;
    bool public isGame = false;

    mapping(uint256 => uint256) private startPoints;

    mapping(uint256 => mapping(uint256 => bool)) public safeMap;

    mapping(uint256 => uint256[4]) public playerPositions;  

    constructor(uint256 _playersLength) {
        manager = msg.sender;
        playersLength = _playersLength;
        isGame = true;

        startPoints[0] = 0;
        startPoints[1] = 13;
        startPoints[2] = 26;
        startPoints[3] = 39;

        uint256[] memory generalSafePositions = [1, 9, 14, 22, 27, 35, 40, 48];
        for (uint256 i = 0; i < generalSafePositions.length; i++) {
            for (uint256 player = 0; player < playersLength; player++) {
                safeMap[player][generalSafePositions[i]] = true;
            }
        }

        for (uint256 player = 0; player < playersLength; player++) {
            for (uint256 j = 1; j <= 5; j++) {
                safeMap[player][(player + 1) * 1000 + j] = true;
            }
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this.");
        _;
    }

    function random() public view returns (uint256) {
        return (uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp))) % 6) + 1;
    }

    function moveMarker(uint256 marker, uint256 diceThrow) public onlyManager returns (uint256 newPosition, bool isChance) {
        require(isGame, "Game has not started.");

        uint256 player = marker / 4;
        uint256 markerIndex = marker % 4;
        uint256 position = playerPositions[player][markerIndex];

         
        if (position == 0 && diceThrow == 6) {
            newPosition = 1; // Move out of home base
            isChance = true; // Player gets another chance for rolling a 6
        } else {
            newPosition = position + diceThrow;

            // Check if the new position exceeds the board limit (57)
            if (newPosition >= 57) {
                newPosition = (newPosition == 57) ? 57 : position; // Win if exactly 57
                isChance = false;
            }

            // If the diceThrow was a 6, give another chance
            if (diceThrow == 6) {
                isChance = true;
            }

            // Check if the new position is safe (either general safe or player-specific safe zone)
            if (!safeMap[player][newPosition]) {
                // Marker can be knocked back to start (this logic can be extended)
                // For now, no handling for other markers
            }
        }

        // Update player marker position
        playerPositions[player][markerIndex] = newPosition;

        return (newPosition, isChance);
    }
}
