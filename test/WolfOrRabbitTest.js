const { ethers } = require('hardhat')
const { expect } = require('chai')

describe("WolfOrRabbitTest", function() {
  before(async () => {
    this.signers = await ethers.getSigners()
    this.admin = this.signers[0]
    this.wolf = this.signers[1]
    this.rabbit = this.signers[2]
  })

  beforeEach(async () => {
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock", this.admin);
    this.WolfOrRabbit = await ethers.getContractFactory("WolfOrRabbit", this.admin);

    this.erc20Mock = await ERC20Mock.deploy(5000, "USD", 8, "USD");
    await this.erc20Mock.deployTransaction.wait();
  })

  it("should allow both side deposit and one wins the game", async () => {
    const wor = await this.WolfOrRabbit.deploy(this.erc20Mock.address, 100, 10);
    await wor.deployTransaction.wait();

    await this.erc20Mock.connect(this.admin).transfer(this.wolf.address, 1000).then(tx => tx.wait());
    await this.erc20Mock.connect(this.admin).transfer(this.rabbit.address, 1000).then(tx => tx.wait());
    await this.erc20Mock.connect(this.wolf).approve(wor.address, 100).then(tx => tx.wait());
    await this.erc20Mock.connect(this.rabbit).approve(wor.address, 100).then(tx => tx.wait());
    expect(await this.erc20Mock.balanceOf(this.admin.address)).to.equal(3000);
    await wor.connect(this.wolf).wolfDeposits().then(tx => tx.wait());
    expect(await this.erc20Mock.balanceOf(wor.address)).to.equal(100);
    await wor.connect(this.rabbit).rabbitDeposits().then(tx => tx.wait());
    expect(await this.erc20Mock.balanceOf(this.wolf.address)).to.equal(900);
    expect(await this.erc20Mock.balanceOf(this.rabbit.address)).to.equal(900);
    expect(await this.erc20Mock.balanceOf(wor.address)).to.equal(200);
    await wor.connect(this.admin).wolfWin().then(tx => tx.wait());
    expect(await this.erc20Mock.balanceOf(wor.address)).to.equal(0);
    expect(await this.erc20Mock.balanceOf(this.admin.address)).to.equal(3010);
    expect(await this.erc20Mock.balanceOf(this.wolf.address)).to.equal(1090);
    expect(await this.erc20Mock.balanceOf(this.rabbit.address)).to.equal(900);
  });

  it("should allow call winnner before both side deposited (wolf)", async () => {
    const wor = await this.WolfOrRabbit.deploy(this.erc20Mock.address, 100, 10);
    await wor.deployTransaction.wait();

    await this.erc20Mock.connect(this.admin).transfer(this.wolf.address, 1000).then(tx => tx.wait());
    await this.erc20Mock.connect(this.admin).transfer(this.rabbit.address, 1000).then(tx => tx.wait());
    await this.erc20Mock.connect(this.wolf).approve(wor.address, 100).then(tx => tx.wait());
    await this.erc20Mock.connect(this.rabbit).approve(wor.address, 100).then(tx => tx.wait());
    await wor.connect(this.wolf).wolfDeposits().then(tx => tx.wait());
    await expect(wor.connect(this.admin).wolfWin()).to.be.revertedWith("Wait for deposits");
  });

  it("should allow call winnner before both side deposited (rabbit)", async () => {
    const wor = await this.WolfOrRabbit.deploy(this.erc20Mock.address, 100, 10);
    await wor.deployTransaction.wait();

    await this.erc20Mock.connect(this.admin).transfer(this.wolf.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.admin).transfer(this.rabbit.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.wolf).approve(wor.address, 100).then(tx => tx.wait());
    await this.erc20Mock.connect(this.rabbit).approve(wor.address, 100).then(tx => tx.wait());
    await wor.connect(this.wolf).rabbitDeposits().then(tx => tx.wait());
    await expect(wor.connect(this.admin).wolfWin().then(tx => tx.wait())).to.be.revertedWith("Wait for deposits");
  });

  it("should not allow deposit again (rabbit)", async () => {
    const wor = await this.WolfOrRabbit.deploy(this.erc20Mock.address, 100, 10);
    await wor.deployTransaction.wait();

    await this.erc20Mock.connect(this.admin).transfer(this.wolf.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.admin).transfer(this.rabbit.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.wolf).approve(wor.address, 100).then(tx => tx.wait());
    await this.erc20Mock.connect(this.rabbit).approve(wor.address, 100).then(tx => tx.wait());
    await wor.connect(this.wolf).rabbitDeposits().then(tx => tx.wait());
    await expect(wor.connect(this.wolf).rabbitDeposits().then(tx => tx.wait())).to.be.revertedWith("Cannot deposit again");
  });

  it("should not allow deposit again (wolf)", async () => {
    const wor = await this.WolfOrRabbit.deploy(this.erc20Mock.address, 100, 10);
    await wor.deployTransaction.wait();

    await this.erc20Mock.connect(this.admin).transfer(this.wolf.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.admin).transfer(this.rabbit.address, 1000).then(tx => tx.wait())
    await this.erc20Mock.connect(this.wolf).approve(wor.address, 100).then(tx => tx.wait());
    await this.erc20Mock.connect(this.rabbit).approve(wor.address, 100).then(tx => tx.wait());
    await wor.connect(this.wolf).wolfDeposits().then(tx => tx.wait());
    await expect(wor.connect(this.wolf).wolfDeposits().then(tx => tx.wait())).to.be.revertedWith("Cannot deposit again");
  });
});
