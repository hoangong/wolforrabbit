pragma solidity ^0.7.6;

import "./SafeMath.sol";
import "./IERC20.sol";

contract WolfOrRabbit {
  using SafeMath for uint256;

  address bettingCoin;
  uint256 bettingAmount;
  uint commissionPercentage;
  address wolf;
  address rabbit;
  address creator;

  constructor(address _bettingCoin, uint256 _bettingAmount, uint _commissionPercentage) {
    creator = msg.sender;
    bettingCoin = _bettingCoin;
    bettingAmount = _bettingAmount;
    commissionPercentage = _commissionPercentage;
  }

  function wolfDeposits() public {
    require(wolf == address(0), "Cannot deposit again");
    wolf = msg.sender;
    _deposit();
  }

  function rabbitDeposits() public {
    require(rabbit == address(0), "Cannot deposit again");
    rabbit = msg.sender;
    _deposit();
  }

  function _deposit() private {
    IERC20(bettingCoin).transferFrom(msg.sender, address(this), bettingAmount);
  }

  function wolfWin() public {
    _game(wolf);
  }

  function rabbitWin() public {
    _game(rabbit);
  }

  function _game(address winner) private {
    require(wolf != address(0) && rabbit != address(0), "Wait for deposits");
    uint256 commissionAmount = bettingAmount.mul(commissionPercentage).div(100);
    uint256 winAmount = bettingAmount.mul(2).sub(commissionAmount);
    IERC20(bettingCoin).transfer(winner, winAmount);
    IERC20(bettingCoin).transfer(creator, commissionAmount);
  }

}
