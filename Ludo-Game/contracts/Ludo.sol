pragma solidity ^0.8.24;

contract Ludo {
    address public manager;
    uint256 public playersLength;
    mapping(uint256 => uint256) private startPoints;
    bool public isGame = false;

    mapping(uint256 => bool) public safeMap;

    constructor(uint256 _playersLength) {
        manager = msg.sender;
        playersLength = _playersLength;
        isGame = true;

        // Initialize start points
        startPoints[0] = 0;
        startPoints[1] = 13;
        startPoints[2] = 26;
        startPoints[3] = 39;

        // Populate general safe positions
        uint256[] memory safePos = [1, 9, 14, 22, 27, 35, 40, 48];
        for (uint256 i = 0; i < safePos.length; i++) {
            safeMap[safePos[i]] = true;
        }

        // Add player-specific safe zones (1001 to 4005)
        for (uint256 i = 1; i <= playersLength; i++) {
            for (uint256 j = 1; j <= 5; j++) {
                safeMap[i * 1000 + j] = true;
            }
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager can call this.");
        _;
    }

    function random() public view returns (uint256) {
        return (uint256(keccak256(abi.encodePacked(block.difficulty, block.number, block.timestamp))) % 6) + 1;
    }

    function moveDeducer(uint256 val, uint256 diceThrow)
        private
        pure
        returns (uint256, bool, bool)
    {
        uint256 newVal;
        bool isThrown = false;
        bool isChance = false;

        if (val == 0) {
            newVal = (diceThrow == 6) ? 1 : 0;
            isChance = (diceThrow != 6);
            isThrown = true;
        } else {
            uint256 testVal = val + diceThrow;
            if (testVal >= 57) {
                newVal = (testVal == 57) ? testVal : val;
                isChance = true;
            } else {
                newVal = testVal;
            }
        }
        return (newVal, isChance, isThrown);
    }

    function BoardToPos(uint256[16] memory arr) private view returns (uint256[16] memory newArr) {
        for (uint256 i = 0; i < playersLength * 4; i++) {
            uint256 color = i / 4;
            newArr[i] = (arr[i] == 0) ? 0 : (arr[i] > 52) ? 51 + (arr[i] % 1000) : (arr[i] < startPoints[color] + 1) ? 52 + arr[i] - startPoints[color] : arr[i] - startPoints[color];
        }
    }

    function PosToBoard(uint256[16] memory arr) private view returns (uint256[16] memory newArr) {
        for (uint256 i = 0; i < playersLength * 4; i++) {
            uint256 color = i / 4;
            newArr[i] = (arr[i] == 0) ? 0 : (arr[i] > 52) ? (color + 1) * 1000 + (arr[i] % 50) - 1 : (startPoints[color] + arr[i]) % 52 == 0 ? 52 : (startPoints[color] + arr[i]) % 52;
        }
    }

    function moveMarker(
        uint256[16] memory game,
        uint256 color,
        uint256 j,
        uint256 diceThrow
    ) public view onlyManager returns (uint256[16] memory, bool, bool) {
        require(isGame, "Game has not started.");

        // Convert board positions to positional indices
        uint256[16] memory currentGame = BoardToPos(game);

        // Calculate the new marker value
        (uint256 newVal, bool isChance, bool isThrown) = moveDeducer(currentGame[j], diceThrow);
        currentGame[j] = newVal;

        // Convert back to board positions
        currentGame = PosToBoard(currentGame);

        // Check if it's in a non-safe position
        uint256 val = currentGame[j];
        if (!safeMap[val]) {
            for (uint256 i = 0; i < playersLength * 4; i++) {
                if (color != i / 4 && currentGame[i] == val) {
                    isChance = true;
                    currentGame[i] = 0;
                }
            }
        }

        // If the diceThrow was a 6, allow another chance
        if (diceThrow == 6) isChance = true;

        return (currentGame, isChance, isThrown);
    }
}
