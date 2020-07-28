pragma solidity ^0.7;

interface IToken {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8 decimals);
}

contract Checker {
    function isTokenAt(IToken at)
        external
        view
        returns (bool isToken)
    {
        try at.name() {}
        catch (bytes memory) {
            return false;
        }
        try at.symbol() {}
        catch (bytes memory) {
            return false;
        }
        try at.decimals() {}
        catch (bytes memory) {
            return false;
        }
        return true;
    }
}
